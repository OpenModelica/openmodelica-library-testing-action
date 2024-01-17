import * as fsPromise from 'fs/promises'
import * as HTMLParser from 'node-html-parser'
import TurndownService from 'turndown'
import * as turndownPluginGfm from 'turndown-plugin-gfm'

export interface ActionOutputs {
  simulationTestsPassing: boolean
  nSimulationPassing: number
  verificationTestsPassing: boolean
  nVerificationPassing: number
}

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

function parseStats(
  table: HTMLParser.HTMLElement,
  verificationTested: boolean
): ActionOutputs {
  const rows = table.getElementsByTagName('tr')

  const total = Number(rows[1].getElementsByTagName('td')[0].text)
  const simulated = Number(rows[1].getElementsByTagName('td')[6].text)
  const verified = Number(rows[1].getElementsByTagName('td')[7].text)

  const outputs = {
    simulationTestsPassing: total === simulated,
    nSimulationPassing: simulated,
    verificationTestsPassing:
      !verificationTested || (verificationTested && total === verified),
    nVerificationPassing: verified
  } as ActionOutputs

  return outputs
}

/**
 * Generate summary from HTML overview file
 *
 * @param html                Content of overview.html
 * @param pagesUrl            URL where GitHub pages are hosted.
 * @param verificationTested  `true` if referenceFiles are available and verification should be tested.
 * @returns                   Array with markdown summary and action outputs.
 */
export function summaryFromHtml(
  html: string,
  pagesUrl: string,
  verificationTested: boolean
): [string, ActionOutputs] {
  const root = HTMLParser.parse(html)
  const htmlTables = root.getElementsByTagName('table')

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  })
  turndownService.use([turndownPluginGfm.gfm, turndownPluginGfm.tables])

  // TODO: ensure that htmlTables has two elements and that they are the correct tables
  const resultTable = removeHtmlLinks(htmlTables[1])

  const coverage = turndownService.turndown(htmlTables[0].outerHTML)
  const results = turndownService.turndown(resultTable.outerHTML)

  const outputs = parseStats(htmlTables[0], verificationTested)

  let summary = `## Summary

${coverage}

## Results

${results}
`

  if (pagesUrl !== '') {
    summary += `
## Detailed report

${pagesUrl}
`
  }

  return [summary, outputs]
}

/**
 * Generate summary from HTML overview file
 *
 * @param htmlFile            Path to overview.html
 * @param pagesUrl            URL where GitHub pages are hosted.
 * @param verificationTested  `true` if referenceFiles are available and verification should be tested.
 * @returns                   Array with markdown summary and action outputs.
 */
export async function summaryFromHtmlFile(
  htmlFile: string,
  pagesUrl: string,
  verificationTested: boolean
): Promise<[string, ActionOutputs]> {
  console.log(`Read file ${htmlFile}`)
  const html = await fsPromise.readFile(htmlFile, 'utf-8')

  return summaryFromHtml(html, pagesUrl, verificationTested)
}
