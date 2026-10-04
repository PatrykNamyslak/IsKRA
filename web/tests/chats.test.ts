import assert from 'node:assert/strict'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { runInNewContext } from 'node:vm'
import { ModuleKind, ScriptTarget, transpileModule } from 'typescript'
import type { PayloadRequest, Where } from 'payload'
import { ChatMessages } from '@/collections/ChatMessages'
import { Users } from '@/collections/Users'
import { chatsAccess, createMessageAccess, markMessagesAccess, messagesAccess, readContext } from '@/lib/chat-access'
import { ChatError, listChats, markChatsRead, parsePositiveInteger } from '@/lib/chats'
import { getConversation, sendConversationMessage } from '@/lib/chat-conversation'
import { requireSameOrigin } from '@/lib/chat-http'

interface Message {
  [key: string]: unknown
  id: number; conversation: number; sender: number; content: string; createdAt: string
  readByUser?: boolean; readByOrganization?: boolean
}
const chats = [
  { id: 1, user: 10, organization: 20, createdAt: '2026-10-01T00:00:00Z' },
  { id: 2, user: 11, organization: 21, createdAt: '2026-10-02T00:00:00Z' },
  { id: 3, user: 10, organization: 21, createdAt: '2026-10-03T00:00:00Z' },
]

function matches(doc: Record<string, unknown>, where: Where): boolean {
  return Object.entries(where).every(([key, condition]) => {
    if (key === 'and') return (condition as Where[]).every((query) => matches(doc, query))
    if (key === 'or') return (condition as Where[]).some((query) => matches(doc, query))
    const value = key.startsWith('conversation.')
      ? chats.find((chat) => chat.id === doc.conversation)?.[key.slice(13) as 'user' | 'organization'] : doc[key]
    return Object.entries(condition as Record<string, unknown>).every(([operator, expected]) => {
      if (operator === 'equals') return value === expected
      if (operator === 'not_equals') return value !== expected
      if (operator === 'in') return (expected as unknown[]).includes(value)
      if (operator === 'less_than_equal') return Number(value) <= Number(expected)
      if (operator === 'less_than') return typeof value === 'number'
        ? value < Number(expected) : String(value) < String(expected)
      throw new Error(`Unsupported test operator: ${operator}`)
    })
  })
}

function fixture(id = 10, messages: Message[] = []) {
  const user = { id, role: id === 20 || id === 21 ? 'organization' : 'user', collection: 'users' }
  const operations: { collection: string; overrideAccess: boolean; select?: unknown }[] = []
  let afterUpdate: (() => void) | undefined
  const req = { user, context: {}, payload: {} } as unknown as PayloadRequest
  Object.assign(req.payload, {
    async find(options: { collection: string; overrideAccess: boolean; select?: unknown; where: Where; page?: number; limit: number; pagination?: boolean; sort?: string | string[] }) {
      operations.push(options)
      let docs: Record<string, unknown>[] = options.collection === 'tester_chats' ? chats :
        options.collection === 'users' ? [
          { id: 10, name: 'Anna' }, { id: 11, name: 'Jan' },
          { id: 20, name: 'Instytucja A' }, { id: 21, name: 'Instytucja B' },
        ] : messages
      if (!options.overrideAccess) {
        const access = await (options.collection === 'tester_chats' ? chatsAccess : messagesAccess)({ req })
        docs = access === false ? [] : access === true ? docs : docs.filter((doc) => matches(doc, access))
      }
      docs = docs.filter((doc) => matches(doc, options.where))
      for (const sort of [...(Array.isArray(options.sort) ? options.sort : options.sort ? [options.sort] : [])].reverse()) {
        const descending = sort.startsWith('-'), field = descending ? sort.slice(1) : sort
        docs.sort((a, b) => (a[field]! < b[field]! ? -1 : a[field]! > b[field]! ? 1 : 0) * (descending ? -1 : 1))
      }
      const totalDocs = docs.length, page = options.page ?? 1, totalPages = Math.max(1, Math.ceil(totalDocs / options.limit))
      return { docs: docs.slice((page - 1) * options.limit, page * options.limit),
        page, totalDocs, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 }
    },
    async create(options: { data: { conversation: number; sender: number; content: string }; overrideAccess: boolean }) {
      assert.equal(options.overrideAccess, false)
      assert.equal(await createMessageAccess({ req, data: options.data }), true)
      const doc = message(Math.max(0, ...messages.map((msg) => msg.id)) + 1, options.data.conversation, req.user!.id)
      doc.content = options.data.content
      messages.push(doc)
      return doc
    },
    async update(options: { context: Record<string, unknown>; data: Record<string, unknown>; where: Where; limit: number; overrideAccess: boolean }) {
      assert.equal(options.overrideAccess, false)
      Object.assign(req.context, options.context)
      const access = await markMessagesAccess({ req })
      assert.notEqual(access, false)
      const docs = messages.filter((doc) => matches(doc as unknown as Record<string, unknown>, options.where) &&
        (access === true || matches(doc as unknown as Record<string, unknown>, access as Where))).slice(0, options.limit)
      for (const doc of docs) Object.assign(doc, options.data)
      afterUpdate?.()
      afterUpdate = undefined
      return { docs, errors: [] }
    },
  })
  return { req, messages, operations, onUpdate(callback: () => void) { afterUpdate = callback } }
}

function message(id: number, conversation = 1, sender = 20): Message {
  return { id, conversation, sender, content: `Wiadomość ${id}`, createdAt: '2026-10-04T10:00:00Z', readByUser: false, readByOrganization: false }
}

test('ACL rejects anonymous access and isolates participants, including direct collection access', async () => {
  const anonymous = fixture().req; anonymous.user = null
  assert.equal(await chatsAccess({ req: anonymous }), false)
  assert.equal(await messagesAccess({ req: anonymous }), false)
  assert.equal(await createMessageAccess({ req: anonymous, data: { conversation: 1 } }), false)
  const own = await messagesAccess({ req: fixture().req })
  assert.equal(typeof own, 'object')
  assert.equal(matches(message(1, 2) as unknown as Record<string, unknown>, own as Where), false)
  assert.equal(matches(message(1) as unknown as Record<string, unknown>, own as Where), true)
  assert.equal(await createMessageAccess({ req: fixture().req, data: { conversation: 2 } }), false)
  assert.equal(await createMessageAccess({ req: fixture().req, data: { conversation: 1 } }), true)
})

test('read changes require a server capability and public role promotion is rejected', async () => {
  const { req } = fixture()
  assert.equal(await markMessagesAccess({ req }), false)
  req.context = { chatReadCapability: 'chat-read', chatReadSide: 'readByUser' }
  assert.equal(await markMessagesAccess({ req }), false)
  req.context = readContext('readByUser')
  assert.deepEqual(await markMessagesAccess({ req }), { 'conversation.user': { equals: 10 } })
  const role = Users.fields.find((field) => 'name' in field && field.name === 'role')
  assert.ok(role && 'access' in role)
  assert.equal(await role.access!.create!({ req, data: { role: 'admin' } }), false)
  assert.equal(await role.access!.update!({ req, data: { role: 'admin' } }), false)
})

test('create hook forces sender, read flags and date rather than trusting submitted values', async () => {
  const hook = ChatMessages.hooks!.beforeValidate![0]
  const data = { sender: 21, conversation: 1, content: ' hello ', id: 999, readByUser: true, readByOrganization: true, createdAt: '1999-01-01' }
  await hook({ data, req: fixture().req, context: {}, operation: 'create', collection: ChatMessages as import('payload').SanitizedCollectionConfig })
  assert.equal(data.sender, 10)
  assert.equal(data.content, 'hello')
  assert.equal(data.readByUser, false)
  assert.equal(data.readByOrganization, false)
  assert.equal('id' in data, false)
  assert.notEqual(data.createdAt, '1999-01-01')
})

test('trusted read context survives separate Next module copies and hot reloads', async () => {
  const source = readFileSync(resolve('lib/chat-access.ts'), 'utf8')
  const compiled = transpileModule(source, {
    compilerOptions: { module: ModuleKind.CommonJS, target: ScriptTarget.ES2022 },
  }).outputText
  const loadModule = () => {
    const runtime = { exports: {} }
    runInNewContext(compiled, runtime)
    return runtime.exports as typeof import('@/lib/chat-access')
  }
  const route = loadModule()
  const cachedCollection = loadModule()
  const reloadedCollection = loadModule()
  const req = fixture().req
  req.context = route.readContext('readByUser')
  assert.equal(cachedCollection.isReadOperation(req, 'readByUser'), true)
  assert.equal(reloadedCollection.isReadOperation(req, 'readByUser'), true)
  const access = await cachedCollection.markMessagesAccess({ req })
  assert.ok(access && typeof access === 'object')
  const participant = access['conversation.user']
  assert.ok(participant && !Array.isArray(participant))
  assert.equal(participant.equals, 10)
  req.context = { chatReadCapability: 'iskra.chat-read.v1', chatReadSide: 'readByUser' }
  assert.equal(await cachedCollection.markMessagesAccess({ req }), false)
})

test('list shows only own chats and retains unread state under a later outgoing message', async () => {
  const incoming = message(1), outgoing = message(2, 1, 10)
  const { req, operations } = fixture(10, [incoming, outgoing, message(3, 2, 21)])
  const result = await listChats(req)
  assert.deepEqual(result.docs.map((chat) => chat.id), [3, 1])
  assert.equal(result.docs[1].to, 'Instytucja A')
  assert.equal(result.docs[1].last_message, 'Wiadomość 2')
  assert.equal(result.docs[1].last_message_date, outgoing.createdAt)
  assert.equal(result.docs[1].readed, false)
  assert.equal(result.docs[0].readed, true)
  assert.equal(result.docs[0].last_message_date, null)
  const privileged = operations.filter((operation) => operation.overrideAccess)
  assert.equal(privileged.length, 1)
  assert.equal(privileged[0].collection, 'users')
  assert.deepEqual(privileged[0].select, { name: true })
})

test('read hook excludes a stale receipt of the other side from the update', async () => {
  const req = fixture().req
  req.context = readContext('readByUser')
  const original = message(1)
  const data: Record<string, unknown> = { readByUser: false, readByOrganization: false, content: 'changed', sender: 21, conversation: 2 }
  await ChatMessages.hooks!.beforeChange![0]({
    data, req, context: req.context, operation: 'update', originalDoc: original,
    collection: ChatMessages as import('payload').SanitizedCollectionConfig,
  })
  assert.equal(data.readByUser, true)
  assert.equal('readByOrganization' in data, false)
  assert.equal(data.content, original.content)
  assert.equal(data.sender, original.sender)
  assert.equal(data.conversation, original.conversation)
})

test('single read is idempotent, excludes outgoing messages and preserves the other side', async () => {
  const incoming = message(1), outgoing = message(2, 1, 10)
  const { req } = fixture(10, [incoming, outgoing, message(3, 2, 21)])
  assert.equal(await markChatsRead(req, 1), 1)
  assert.equal(incoming.readByUser, true)
  assert.equal(incoming.readByOrganization, false)
  assert.equal(outgoing.readByUser, false)
  assert.equal(await markChatsRead(req, 1), 0)
  await assert.rejects(markChatsRead(req, 2), (error: unknown) => error instanceof ChatError && error.status === 404)
  await assert.rejects(markChatsRead(req, 999), (error: unknown) => error instanceof ChatError && error.status === 404)
})

test('organization can mark its own inbox without changing the user receipt', async () => {
  const incoming = message(1, 1, 10)
  assert.equal(await markChatsRead(fixture(20, [incoming]).req, 1), 1)
  assert.equal(incoming.readByOrganization, true)
  assert.equal(incoming.readByUser, false)
})

test('read-all processes multiple batches and chats while new incoming messages stay unread', async () => {
  const messages = Array.from({ length: 251 }, (_, index) => message(index + 1, index % 2 ? 1 : 3, index % 2 ? 20 : 21))
  const outsider = message(252, 2, 21); messages.push(outsider)
  const state = fixture(10, messages)
  const newlyArrived = message(253)
  state.onUpdate(() => messages.push(newlyArrived))
  assert.equal(await markChatsRead(state.req), 251)
  assert.equal(outsider.readByUser, false)
  assert.equal(newlyArrived.readByUser, false)
  assert.equal(messages.filter((msg) => msg.readByUser).length, 251)
})

test('automatic read marks only fetched IDs inside the selected authorized chat', async () => {
  const first = message(1), second = message(2), outsider = message(3, 2, 21)
  assert.equal(await markChatsRead(fixture(10, [first, second, outsider]).req, 1, [1, 3]), 1)
  assert.equal(first.readByUser, true)
  assert.equal(second.readByUser, false)
  assert.equal(outsider.readByUser, false)
})

test('POST origin checks reject cross-site, missing and null origins', () => {
  const request = (origin?: string, site?: string) => new Request('https://example.test/api/chats/read-all', {
    method: 'POST', headers: { ...(origin ? { origin } : {}), ...(site ? { 'sec-fetch-site': site } : {}) },
  })
  const previous = process.env.APP_URL
  process.env.APP_URL = 'https://example.test'
  try {
    assert.doesNotThrow(() => requireSameOrigin(request('https://example.test', 'same-origin')))
    for (const origin of [undefined, 'null', 'https://evil.test']) assert.throws(() => requireSameOrigin(request(origin)))
    assert.throws(() => requireSameOrigin(request('https://example.test', 'cross-site')))
  } finally {
    if (previous === undefined) delete process.env.APP_URL
    else process.env.APP_URL = previous
  }
})

test('identifiers reject noninteger, negative, repeated and overflowing input', () => {
  assert.equal(parsePositiveInteger(null, 1), 1)
  assert.equal(parsePositiveInteger('25'), 25)
  for (const value of ['0', '-1', '1.5', '1e2', '1,2', '2147483648', '', 'NaN']) assert.throws(() => parsePositiveInteger(value))
})


test('conversation history is isolated, chronological and limited to 50 messages', async () => {
  const state = fixture(10, [message(1), message(2, 2, 21), message(3, 1, 10)])
  const result = await getConversation(state.req, 1)
  assert.equal(result.title, 'Instytucja A')
  assert.deepEqual(result.messages.map((msg) => msg.id), [1, 3])
  assert.equal(result.messages[0].isOwn, false)
  assert.equal(result.messages[0].senderName, 'Instytucja A')
  assert.equal(result.messages[1].isOwn, true)
  assert.equal(result.messages[1].senderName, 'Ty')
  await assert.rejects(getConversation(state.req, 2), (error: unknown) => error instanceof ChatError && error.status === 404)
  await assert.rejects(getConversation(state.req, 1, 2), (error: unknown) => error instanceof ChatError && error.status === 404)
  const anonymous = fixture().req; anonymous.user = null
  await assert.rejects(getConversation(anonymous, 1), (error: unknown) => error instanceof ChatError && error.status === 401)
})

test('older-message cursor has no gaps or duplicates when a new message arrives', async () => {
  const messages = Array.from({ length: 120 }, (_, i) => message(i + 1))
  const state = fixture(10, messages)
  const first = await getConversation(state.req, 1)
  assert.equal(first.messages.length, 50)
  assert.equal(first.olderCursor, 71)
  messages.push(message(121))
  const second = await getConversation(state.req, 1, first.olderCursor!)
  const third = await getConversation(state.req, 1, second.olderCursor!)
  assert.equal(second.olderCursor, 21)
  assert.equal(third.olderCursor, null)
  assert.deepEqual([...third.messages, ...second.messages, ...first.messages].map((msg) => msg.id),
    Array.from({ length: 120 }, (_, i) => i + 1))
})

test('sending validates content, uses the session sender and rejects foreign conversations', async () => {
  const state = fixture()
  const sent = await sendConversationMessage(state.req, 1, '  Cześć!  ')
  assert.equal(sent.content, 'Cześć!')
  assert.equal(sent.isOwn, true)
  assert.equal(state.messages[0].sender, 10)
  assert.equal(state.messages[0].conversation, 1)
  for (const content of ['', '   ', null, 42, 'x'.repeat(10001)]) {
    await assert.rejects(sendConversationMessage(state.req, 1, content), (error: unknown) => error instanceof ChatError && error.status === 400)
  }
  await assert.rejects(sendConversationMessage(state.req, 2, 'test'), (error: unknown) => error instanceof ChatError && error.status === 404)
  assert.equal(state.messages.length, 1)
})
