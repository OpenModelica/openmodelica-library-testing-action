import { readFileSync, writeFileSync } from 'fs'
import * as HTMLParser from 'node-html-parser'
import TurndownService from 'turndown'
import * as turndownPluginGfm from 'turndown-plugin-gfm'

function removeHtmlLinks(table: HTMLParser.HTMLElement): HTMLParser.HTMLElement {

  table.querySelectorAll('td').forEach((td: HTMLParser.HTMLElement) => {
    // Check if the <td> contains an <a> element
    const linkElement = td.querySelector('a');
    if (linkElement) {
      // Replace the <a> element with its text content
      td.set_content(linkElement.text);
    }
  });

  return table
}

export function summaryFromHtmlFile(htmlFile: string): string {
  const html: string = readFileSync(htmlFile, 'utf-8')

  const root = HTMLParser.parse(html)
  const htmlTables = root.getElementsByTagName('table')

  const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
  turndownService.use([turndownPluginGfm.gfm, turndownPluginGfm.tables])

  const table = removeHtmlLinks(htmlTables[1])

  const coverage = turndownService.turndown(htmlTables[0].outerHTML)
  const results = turndownService.turndown(table.outerHTML)

  let summary: string = `## Summary

${coverage}

## Results

${results}
`

  return summary
}
