import { defineConfig } from "mppx/cli"
import { stripe, tempo } from "mppx/cli/plugins"

export default defineConfig({
  plugins: [stripe(), tempo()],
})
