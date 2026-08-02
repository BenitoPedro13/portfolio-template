import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Payload loads sharp at module scope, so it must stay a real Node module
  // rather than being bundled.
  serverExternalPackages: ['sharp'],

  /**
   * sharp's native libvips lives in platform-specific `@img/*` packages that
   * pnpm installs behind symlinks in `node_modules/.pnpm`. Next's file tracer
   * does not follow those symlinks, so the serverless bundle ships without
   * `libvips-cpp.so` and every request touching Payload fails at runtime with
   * ERR_DLOPEN_FAILED. Including them explicitly puts the binaries in the
   * function output.
   */
  outputFileTracingIncludes: {
    '/**': ['./node_modules/.pnpm/@img/**/*'],
  },
}

export default withPayload(nextConfig)
