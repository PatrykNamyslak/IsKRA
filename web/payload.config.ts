import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Organizations } from './collections/Organizations'
import { Innovations } from './collections/Innovations'
import { Feedbacks } from './collections/Feedbacks'
import { UnmatchedQueries } from './collections/UnmatchedQueries'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  routes: {
    admin: '/panel',
  },
  collections: [Users, Organizations, Innovations, Feedbacks, UnmatchedQueries],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'hackyeah2026-payload-secret-key-1234567890',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString:
        process.env.DATABASE_URL ||
        'postgresql://hackyeah2026:hackyeah2026@127.0.0.1:5432/hackyeah2026',
    },
  }),
  sharp,
})
