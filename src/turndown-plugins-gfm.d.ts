declare module 'turndown-plugin-gfm' {
  import { Plugin } from 'turndown';

  const gfm: Plugin;
  const tables: Plugin;

  export { gfm, tables };
}
