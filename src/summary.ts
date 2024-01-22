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

/**
 * Update all links from td elements of table.
 *
 * @param table     HTML table
 * @param rootUrl   Root URL to prepend all links with. If not set remove links instead.
 * @returns         table without links
 */
function updateHtmlLinks(
  table: HTMLParser.HTMLElement,
  rootUrl?: string
): HTMLParser.HTMLElement {
  for (const td of table.querySelectorAll('td')) {
    for (const linkElement of td.querySelectorAll('a')) {
      if (rootUrl) {
        // Add rootUrl to the beginning of the href attribute
        const href = linkElement.getAttribute('href')
        if (href) {
          linkElement.setAttribute('href', `${rootUrl}/${href}`)
        }
      } else {
        // Replace the <a> element with its text content
        td.set_content(td.text)
      }
    }
  }

  return table
}

/**
 * Parse coverage HTML table to get action results.
 *
 * @param table               HTML table.
 * @param verificationTested  Should reference results be tested.
 * @returns                   Action outputs.
 */
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
 * Generate summary from HTML overview file.
 *
 * @param html                Content of overview.html.
 * @param rootUrl             URL where GitHub pages are hosted, can be empty.
 * @param verificationTested  `true` if referenceFiles are available and verification should be tested.
 * @returns                   Array with markdown summary and action outputs.
 */
export function summaryFromHtml(
  html: string,
  rootUrl: string,
  omcVersion: string,
  library: string,
  libraryVersion: string,
  verificationTested: boolean
): [string, ActionOutputs] {
  const root = HTMLParser.parse(html)
  const htmlTables = root.getElementsByTagName('table')

  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
  })
  turndownService.use([turndownPluginGfm.gfm, turndownPluginGfm.tables])

  // Set HTML links to results
  rootUrl = rootUrl.trim()
  const addPagesLinks = rootUrl !== ''
  if (addPagesLinks && rootUrl.endsWith('/')) {
    rootUrl = rootUrl.slice(0, -1)
  }
  let resultTable: HTMLParser.HTMLElement
  let resultsRootFile = ''

  if (addPagesLinks) {
    const libNameBranch = `${library}_${libraryVersion}`

    resultsRootFile = `${rootUrl}/${omcVersion}/${libNameBranch}/${libNameBranch}.html`

    // TODO: ensure that htmlTables has two elements and that they are the correct tables
    resultTable = updateHtmlLinks(
      htmlTables[1],
      `${rootUrl}/${omcVersion}/${libNameBranch}`
    )
  } else {
    resultTable = updateHtmlLinks(htmlTables[1])
  }

  const coverage = turndownService.turndown(htmlTables[0].outerHTML)
  const results = turndownService.turndown(resultTable.outerHTML)

  const outputs = parseStats(htmlTables[0], verificationTested)

  let summary = `## Summary

${coverage}

## Results

${results}
`

  if (addPagesLinks) {
    summary += `
## Detailed report

${resultsRootFile}
`
  }

  return [summary, outputs]
}

/**
 * Generate summary from HTML overview file.
 *
 * @param htmlFile            Path to overview.html.
 * @param rootUrl             URL where GitHub pages are hosted, can be empty.
 * @param verificationTested  `true` if referenceFiles are available and verification should be tested.
 * @returns                   Array with markdown summary and action outputs.
 */
export async function summaryFromHtmlFile(
  htmlFile: string,
  rootUrl: string,
  omcVersion: string,
  library: string,
  libraryVersion: string,
  verificationTested: boolean
): Promise<[string, ActionOutputs]> {
  const html = await fsPromise.readFile(htmlFile, 'utf-8')

  return summaryFromHtml(
    html,
    rootUrl,
    omcVersion,
    library,
    libraryVersion,
    verificationTested
  )
}
