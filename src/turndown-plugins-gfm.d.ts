declare module 'turndown-plugin-gfm' {
  import Turndown from 'turndown'

  const gfm: Turndown.Plugin
  const tables: Turndown.Plugin

  export { gfm, tables }
}
