// Keystatic's local-mode API: reads and writes the repo's MDX files on disk.
import { makeAPIRouteHandler } from '@keystatic/next/api'
import config from '../../../keystatic.config'

export default makeAPIRouteHandler({ config })
