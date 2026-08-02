import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * Payload loads sharp at module scope, so it must stay a real Node module
   * rather than being bundled by Turbopack.
   *
   * Do NOT add `outputFileTracingIncludes` for sharp's `@img/*` packages: the
   * platform variants total ~116 MB, and including them under a `'/**'` key
   * copies that into every route until the deployment upload fails with a bare
   * "unexpected error" after an otherwise green build. Keeping sharp on the
   * same version Next depends on lets Vercel's builder supply the native
   * binary instead.
   */
  serverExternalPackages: ['sharp'],
}

export default withPayload(nextConfig)
