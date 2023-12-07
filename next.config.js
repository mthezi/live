/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
    mdxRs: true,
    serverComponentsExternalPackages: ['mongoose'],
  },
}

const removeImports = require('next-remove-imports')()

module.exports = nextConfig
module.exports = removeImports({})
