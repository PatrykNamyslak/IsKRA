import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Organizations } from './collections/Organizations'
import { Categories } from './collections/Categories'
import { Innovations } from './collections/Innovations'
import { Feedbacks } from './collections/Feedbacks'
import { UnmatchedQueries } from './collections/UnmatchedQueries'
import {ChatMessages} from "@/collections/ChatMessages";
import {TesterChats} from "@/collections/TesterChat";
import {WantToTest} from "@/collections/Testers";

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: 'light',
    meta: {
      titleSuffix: ' | IsKra Małopolska',
      favicon: '/iskra.svg',
    },
    components: {
      beforeDashboard: ['/app/components/AdminWelcome'],
      afterNavLinks: ['/app/components/AdminInnovationNavLink'],
      graphics: {
        Logo: '/app/components/AdminBrand',
      },
      views: {
        innovationManagement: {
          path: '/innovation-management',
          Component: '/app/components/InnovationManagement',
        },
      },
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  routes: {
    admin: '/panel',
  },
  collections: [Users, Organizations, Categories, Innovations, Feedbacks, UnmatchedQueries, ChatMessages, TesterChats, WantToTest],
  editor: lexicalEditor(),
  // Payload must not sign session tokens with a publicly known fallback key.
  secret: process.env.PAYLOAD_SECRET || '',
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
