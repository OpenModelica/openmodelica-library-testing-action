import * as HTMLParser from 'node-html-parser'
import { getMarkdownTable } from 'markdown-table-ts'

export interface SummaryInterface {
  branch: string
  total: number
  parsing: number
  frontend: number
  backend: number
  simCode: number
  templates: number
  compilation: number
  simulation: number
  verification: number

  toMarkdown: () => string
}

export class Summary implements SummaryInterface {
  branch: string
  total: number
  parsing: number
  frontend: number
  backend: number
  simCode: number
  templates: number
  compilation: number
  simulation: number
  verification: number

  constructor({
    branch,
    total,
    parsing,
    frontend,
    backend,
    simCode,
    templates,
    compilation,
    simulation,
    verification
  }: SummaryInterface) {
    assertIsUnsignedInteger(total)
    assertIsUnsignedInteger(parsing)
    assertIsUnsignedInteger(frontend)
    assertIsUnsignedInteger(backend)
    assertIsUnsignedInteger(simCode)
    assertIsUnsignedInteger(templates)
    assertIsUnsignedInteger(compilation)
    assertIsUnsignedInteger(simulation)
    assertIsUnsignedInteger(verification)
    this.branch = branch
    this.total = total
    this.parsing = parsing
    this.frontend = frontend
    this.backend = backend
    this.simCode = simCode
    this.templates = templates
    this.compilation = compilation
    this.simulation = simulation
    this.verification = verification
  }

  toMarkdown(): string {
    const table = getMarkdownTable({
      table: {
        head: [
          'Branch',
          'Total',
          'Parsing',
          'Frontend',
          'Backend',
          'SimCode',
          'Templates',
          'Compilation',
          'Simulation',
          'Verification'
        ],
        body: [
          [
            this.branch,
            this.total.toString(),
            this.parsing.toString(),
            this.frontend.toString(),
            this.backend.toString(),
            this.simCode.toString(),
            this.templates.toString(),
            this.compilation.toString(),
            this.simulation.toString(),
            this.verification.toString()
          ]
        ]
      }
    })

    return table
  }
}

function assertIsUnsignedInteger(value: number): void {
  if (!(Number.isInteger(value) && value >= 0)) {
    throw new Error('Not a unsigned integer')
  }
}

function isEqual(array1: string[], array2: string[]): boolean {
  return array1.every((element, index) => element === array2[index])
}

/**
 * Find coverage table.
 *
 * @param tables Array of HTML tables.
 * @returns      Coverage table.
 */
function findCoverageTable(
  tables: HTMLParser.HTMLElement[]
): HTMLParser.HTMLElement | undefined {
  for (const table of tables) {
    const rows = table.getElementsByTagName('tr')
    const headlineNames: string[] = []
    for (const elem of rows[0].childNodes) {
      headlineNames.push(elem.text)
    }

    if (
      isEqual(headlineNames, [
        'Branch',
        'Total',
        'Parsing',
        'Frontend',
        'Backend',
        'SimCode',
        'Templates',
        'Compilation',
        'Simulation',
        'Verification'
      ]) &&
      Number.isInteger(Number(rows[1].childNodes[1].text))
    ) {
      return table
    }
  }

  return undefined
}

function tableToSummary(table: HTMLParser.HTMLElement): Summary {
  const rows = table.getElementsByTagName('tr')
  const elements = rows[1].getElementsByTagName('td')

  const summary = new Summary({
    branch: elements[0].text,
    total: Number(elements[1].text),
    parsing: Number(elements[2].text),
    frontend: Number(elements[3].text),
    backend: Number(elements[4].text),
    simCode: Number(elements[5].text),
    templates: Number(elements[6].text),
    compilation: Number(elements[7].text),
    simulation: Number(elements[8].text),
    verification: Number(elements[9].text)
  } as SummaryInterface)

  return summary
}

/** Extract coverage summary overview.html file
 *
 * @param html    Content of overview.html file
 * @returns       summary or undefined on failure.
 */
export function extractSummary(html: string): Summary | undefined {
  const root = HTMLParser.parse(html)
  const table = findCoverageTable(root.getElementsByTagName('table'))

  if (table === undefined) {
    return undefined
  }

  return tableToSummary(table)
}

export function genSummary(htmlFile: string): string {
  let summary: string = ''
  return summary
}
