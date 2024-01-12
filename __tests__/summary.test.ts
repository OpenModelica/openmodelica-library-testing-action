/**
 * Unit tests for src/summary.ts
 */

import { extractSummary, Summary, SummaryInterface } from '../src/summary'
import { expect } from '@jest/globals'

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <title>OpenModelica Library Testing Overview</title>
  <style>
  td.warning {background-color:#FFCC66;}
  td.better {background-color:#00FF00;}
  td.warningPerformance {background-color:#FFFC66;}
  td.betterPerformance {background-color:#00FAFF;}
  a span.tooltip {display:none;}
  a:hover span.tooltip {position:fixed;top:30px;left:20px;display:inline;border:2px solid black;background-color:white;}
  a.dot {border-bottom: 1px dotted #000; text-decoration: none;}
  </style>
</head>
<body>
<h2>Statistics</h2>
<table>
<tr><td>Number of libraries</td><td>1</td></tr>
<tr><td>Number of models</td><td>2</td></tr>
</table>
<h2>Tested branches</h2>
<table>
<tr><th>Branch</th><th>Version</th><th>Build time</th><th>Execution time</th><th># Simulate</th><th># Total</th></tr>
<tr><td>omc-stable</td><td>v1.23.0-dev-203-g5904d1ea84-cmake</td><td>2024-01-09 16:34:16</td><td>8.74</td><td>2</td><td>2</td></tr>

</table>
<hr><h3>MyLibrary_main</h3>
<p><strong>Library version:</strong> 1.0.0 (/home/aheuermann/workspace/githubactions/openmodelica-library-testing-action/examples/MyLibrary/package.mo)</p><table>
<tr><th>Branch</th><th>Total</th><th>Parsing</th><th>Frontend</th><th>Backend</th><th>SimCode</th><th>Templates</th><th>Compilation</th><th>Simulation</th><th>Verification</th></tr>
<tr><td><a href="omc-stable/MyLibrary_main/MyLibrary_main.html">omc-stable</a></td><td><a>2</a></td><td><a>2</a></td><td><a>2</a></td><td><a>2</a></td><td><a>2</a></td><td><a>2</a></td><td><a>2</a></td><td><a>2</a></td><td><a>1</a></td></tr></table>
<table>
<tr><th>Branch</th><th>Total</th><th>Parsing</th><th>Frontend</th><th>Backend</th><th>SimCode</th><th>Templates</th><th>Compilation</th><th>Simulation</th><th>Verification</th></tr>
<tr><td><a href="omc-stable/MyLibrary_main/MyLibrary_main.html">omc-stable</a></td><td>8.74</td><td>3.91</td><td>0.36</td><td>0.42</td><td>0.04</td><td>0.09</td><td>2.92</td><td>0.08</td><td>0.07</td></tr>
</table>

</body>
</html>
`

const markdownTable = `| Branch     | Total | Parsing | Frontend | Backend | SimCode | Templates | Compilation | Simulation | Verification |
| ---------- | ----- | ------- | -------- | ------- | ------- | --------- | ----------- | ---------- | ------------ |
| omc-stable | 2     | 2       | 2        | 2       | 2       | 2         | 2           | 2          | 1            |`

describe('summary.ts', () => {
  it('Extract summary from HTML', async () => {
    const summary = extractSummary(html)

    expect(summary).toEqual({
      branch: 'omc-stable',
      total: 2,
      parsing: 2,
      frontend: 2,
      backend: 2,
      simCode: 2,
      templates: 2,
      compilation: 2,
      simulation: 2,
      verification: 1
    } as SummaryInterface)
  })

  it('Summary to Markdown', async () => {
    const summary = new Summary({
      branch: 'omc-stable',
      total: 2,
      parsing: 2,
      frontend: 2,
      backend: 2,
      simCode: 2,
      templates: 2,
      compilation: 2,
      simulation: 2,
      verification: 1
    } as SummaryInterface)

    expect(summary.toMarkdown()).toEqual(markdownTable)
  })
})
