import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const directory = mkdtempSync(join(tmpdir(), 'chat-tests-'))
const output = join(directory, 'chats.test.cjs')
try {
  const build = spawnSync(resolve('node_modules/.bin/esbuild'), [
    'tests/chats.test.ts', '--bundle', '--platform=node', '--format=cjs', '--packages=external',
    '--alias:server-only=./tests/fixtures/server-imports.ts',
    '--alias:@payload-config=./tests/fixtures/server-imports.ts', `--outfile=${output}`,
  ], { stdio: 'inherit' })
  if (build.error) throw build.error
  if (build.status !== 0) process.exitCode = build.status ?? 1
  else {
    // Run node:test directly: Payload's dependency loading interferes with the
    // test runner's child-process mode in Node 24, which otherwise skips tests.
    const result = spawnSync(process.execPath, [output], {
      stdio: 'inherit', env: { ...process.env, NODE_PATH: resolve('node_modules') },
    })
    if (result.error) throw result.error
    process.exitCode = result.status ?? 1
  }
} finally { rmSync(directory, { recursive: true, force: true }) }
