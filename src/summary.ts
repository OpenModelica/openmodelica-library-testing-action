import { readFileSync } from 'fs'
import * as HTMLParser from 'node-html-parser'
import TurndownService from 'turndown'
import * as turndownPluginGfm from 'turndown-plugin-gfm'

function removeHtmlLinks(
  table: HTMLParser.HTMLElement
): HTMLParser.HTMLElement {
  for (const td of table.querySelectorAll('td')) {
    // Check if the <td> contains an <a> element
    const linkElement = td.querySelector('a')
    if (linkElement) {
      // Replace the <a> element with its text content
      td.set_content(linkElement.text)
    }
  }

  return table
}

export function summaryFromHtmlFile(htmlFile: string): string {
  const html: string = readFileSync(htmlFile, 'utf-8')

  const root = HTMLParser.parse(html)
  const htmlTables = root.getElementsByTagName('table')

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  })
  turndownService.use([turndownPluginGfm.gfm, turndownPluginGfm.tables])

  const resultTable = removeHtmlLinks(htmlTables[1])

  const coverage = turndownService.turndown(htmlTables[0].outerHTML)
  const results = turndownService.turndown(resultTable.outerHTML)

  const summary = `## Summary

${coverage}

## Results

${results}
`

  return summary
}
