import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Projects } from './collections/Projects'
import { DesktopItems } from './collections/DesktopItems'
import { Site } from './globals/Site'
import { defaultLocale, locales } from './lib/locales'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Projects, DesktopItems],
  globals: [Site],
  localization: {
    locales: [...locales],
    defaultLocale,
    fallback: true,
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  // sharp 0.35's overloaded constructor does not match Payload's narrower
  // `SharpDependency` signature; the runtime behaviour is identical.
  sharp: sharp as unknown as Parameters<typeof buildConfig>[0]['sharp'],
  plugins: [
    /**
     * Serverless filesystems are ephemeral, so uploads must go to blob storage
     * in production. Enabled only when the token exists, which keeps local
     * development writing to ./media with no extra setup.
     */
    ...(process.env.BLOB_READ_WRITE_TOKEN
      ? [
          vercelBlobStorage({
            collections: { media: true },
            token: process.env.BLOB_READ_WRITE_TOKEN,
          }),
        ]
      : []),
  ],
})
