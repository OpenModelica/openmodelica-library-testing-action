/*
 * This file is part of OpenModelica.
 *
 * Copyright (c) 1998-2024, Open Source Modelica Consortium (OSMC),
 * c/o Linköpings universitet, Department of Computer and Information Science,
 * SE-58183 Linköping, Sweden.
 *
 * All rights reserved.
 *
 * THIS PROGRAM IS PROVIDED UNDER THE TERMS OF AGPL VERSION 3 LICENSE OR
 * THIS OSMC PUBLIC LICENSE (OSMC-PL) VERSION 1.8.
 * ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS PROGRAM CONSTITUTES
 * RECIPIENT'S ACCEPTANCE OF THE OSMC PUBLIC LICENSE OR THE GNU AGPL
 * VERSION 3, ACCORDING TO RECIPIENTS CHOICE.
 *
 * The OpenModelica software and the OSMC (Open Source Modelica Consortium)
 * Public License (OSMC-PL) are obtained from OSMC, either from the above
 * address, from the URLs:
 * http://www.openmodelica.org or
 * https://github.com/OpenModelica/ or
 * http://www.ida.liu.se/projects/OpenModelica,
 * and in the OpenModelica distribution.
 *
 * GNU AGPL version 3 is obtained from:
 * https://www.gnu.org/licenses/licenses.html#GPL
 *
 * This program is distributed WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE, EXCEPT AS EXPRESSLY SET FORTH
 * IN THE BY RECIPIENT SELECTED SUBSIDIARY LICENSE CONDITIONS OF OSMC-PL.
 *
 * See the full OSMC Public License conditions for more details.
 *
 */

import * as core from '@actions/core'
import * as fsPromise from 'fs/promises'
import * as HTMLParser from 'node-html-parser'
import TurndownService from 'turndown'
import * as turndownPluginGfm from 'turndown-plugin-gfm'

export interface ActionOutputsInterface {
  simulationTestsPassing: boolean
  nSimulationPassing: number
  verificationTestsPassing: boolean
  nVerificationPassing: number
}

class ActionOutputs implements ActionOutputsInterface {
  simulationTestsPassing: boolean
  nSimulationPassing: number
  verificationTestsPassing: boolean
  nVerificationPassing: number

  constructor(outputs: ActionOutputsInterface) {
    this.simulationTestsPassing = outputs.simulationTestsPassing
    this.nSimulationPassing = outputs.nSimulationPassing
    this.verificationTestsPassing = outputs.verificationTestsPassing
    this.nVerificationPassing = outputs.nVerificationPassing
  }

  /**
   * Set GitHub outputs.
   */
  setOutputs(): void {
    core.setOutput('simulation-tests-passing', this.simulationTestsPassing)
    core.setOutput('n-simulation-passing', this.nSimulationPassing)
    core.setOutput('verification-tests-passing', this.verificationTestsPassing)
    core.setOutput('n-verification-passing', this.nVerificationPassing)
  }

  /**
   * Print outputs to GitHub info.
   */
  printInfo(): void {
    core.info(`simulation-tests-passing: ${this.simulationTestsPassing}`)
    core.info(`n-simulation-passing: ${this.nSimulationPassing}`)
    core.info(`verification-tests-passing: ${this.verificationTestsPassing}`)
    core.info(`n-verification-passing: ${this.nVerificationPassing}`)
  }

  setStatus(): void {
    if (!this.simulationTestsPassing) {
      core.setFailed('Simulation tests failed.')
      return
    }
    if (!this.verificationTestsPassing) {
      core.setFailed('Verification tests failed.')
      return
    }
    return
  }
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

  const outputs = new ActionOutputs({
    simulationTestsPassing: total === simulated,
    nSimulationPassing: simulated,
    verificationTestsPassing:
      !verificationTested || (verificationTested && total === verified),
    nVerificationPassing: verified
  })

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
      htmlTables[2],
      `${rootUrl}/${omcVersion}/${libNameBranch}`
    )
  } else {
    resultTable = updateHtmlLinks(htmlTables[2])
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
