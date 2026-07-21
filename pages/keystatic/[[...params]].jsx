// The Keystatic admin UI, mounted at /keystatic. Renders its own full-page app
// (not the Nextra docs theme). Local mode: available only while `npm run dev`.
import { makePage } from '@keystatic/next/ui/pages'
import config from '../../keystatic.config'

export default makePage(config)
