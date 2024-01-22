/**
 * Unit tests for src/summary.ts
 */

import * as fs from 'fs'
import { expect } from '@jest/globals'
import { summaryFromHtmlFile, ActionOutputs } from '../src/summary'

const htmlLibOverview = `<!DOCTYPE html>
<html>
<head>
  <title>MyLibrary_main test using OpenModelica</title>
</head>
<body>
<h1>MyLibrary_main test using OpenModelica</h1>

<table>
<tr>
<th>Total</th>
<th>Frontend</th>
<th>Backend</th>
<th>SimCode</th>
<th>Templates</th>
<th>Compilation</th>
<th>Simulation</th>
<th>Verification</th>
</tr>
<tr>
<td>2</td>
<td bgcolor="#00FF00">2</td>
<td bgcolor="#00FF00">2</td>
<td bgcolor="#00FF00">2</td>
<td bgcolor="#00FF00">2</td>
<td bgcolor="#00FF00">2</td>
<td bgcolor="#00FF00">2</td>
<td bgcolor="#FFCC66">1</td>
</tr>
</table>

<p>Total time taken: 0:00:08</p>
<p>System info: 12th Gen Intel(R) Core(TM) i7-12800H, 16 GB RAM, Ubuntu 22.04.3 LTS</p>
<p>OpenModelica Version: v1.23.0-dev-203-g5904d1ea84-cmake</p>

<p>Test started: 2024-01-09 16:34:16</p>
<p>Tested Library: 1.0.0<pre>
</pre></p>
<p>BuildModel time limit: 660s</p>
<p>Simulation time limit: 480s</p>
<p>Default tolerance: 1e-06</p>
<p>Optimization level: -Os -march=native</p>
<p>Reference Files: /path/to/ReferenceFiles</p>
<p>Verified using: v1.23.0-dev-203-g5904d1ea84-cmake (diffSimulationResults)</p>
Flags: <pre>setCommandLineOptions(&quot;-d=nogen&quot;);
setCommandLineOptions(&quot;-d=initialization&quot;);
setCommandLineOptions(&quot;-d=backenddaeinfo&quot;);
setCommandLineOptions(&quot;-d=discreteinfo&quot;);
setCommandLineOptions(&quot;-d=stateselection&quot;);
setCommandLineOptions(&quot;-d=execstat&quot;);
setMatchingAlgorithm(&quot;PFPlusExt&quot;);
setIndexReductionMethod(&quot;dynamicStateSelection&quot;);</pre>
Config: <pre>{
 &quot;library&quot;: &quot;MyLibrary&quot;,
 &quot;libraryVersion&quot;: &quot;main&quot;,
 &quot;loadFileCommands&quot;: [
  &quot;loadFile(\\&quot;/path/to/MyLibrary/package.mo\\&quot;)&quot;
 ],
 &quot;optlevel&quot;: &quot;-Os -march=native&quot;,
 &quot;referenceFileExtension&quot;: &quot;csv&quot;,
 &quot;referenceFileNameDelimiter&quot;: &quot;.&quot;,
 &quot;referenceFiles&quot;: &quot;/path/to/ReferenceFiles&quot;
}</pre>
<p>Links are provided if getErrorString() or the simulation generates output. The links are coded with <font style="#FF0000">red</font> if there were errors, <font style="#FFCC66">yellow</font> if there were warnings, and normal links if there are only notifications.</p>
<table>
<tr><th>Model</th><th>Verified</th><th>Simulate</th><th>Total buildModel</th><th>Parsing</th><th>Frontend</th><th>Backend</th><th>SimCode</th><th>Templates</th><th>Compile</th></tr>
<tr><td><a href="files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.err">MyLibrary.Blocks.Examples.PID_Controller</a> (<a href="files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.sim">sim</a>)</td><td bgcolor="#FFCC66">0.05 (<a href="files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.diff.html">4/7 failed</a>)</td><td bgcolor="#00FF00">0.02</td><td bgcolor="#00FF00">1.52</td><td>1.96</td><td bgcolor="#00FF00">0.08</td><td bgcolor="#00FF00">0.20</td><td bgcolor="#00FF00">0.01</td><td bgcolor="#00FF00">0.02</td><td bgcolor="#00FF00">1.20</td></tr>

<tr><td><a href="files/MyLibrary_main_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.err">MyLibrary.Mechanics.MultiBody.Examples.Pendulum</a> (<a href="files/MyLibrary_main_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.sim">sim</a>)</td><td bgcolor="#00FF00">0.01 (3 verified)</td><td bgcolor="#00FF00">0.06</td><td bgcolor="#00FF00">2.32</td><td>1.95</td><td bgcolor="#00FF00">0.29</td><td bgcolor="#00FF00">0.22</td><td bgcolor="#00FF00">0.03</td><td bgcolor="#00FF00">0.06</td><td bgcolor="#00FF00">1.72</td></tr>

</table>
</body>
</html>
`

const libOverviewFile = 'MyLibrary_0.1.0.html'

const markdownSummary = `## Summary

| Total | Frontend | Backend | SimCode | Templates | Compilation | Simulation | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 |

## Results

| Model | Verified | Simulate | Total buildModel | Parsing | Frontend | Backend | SimCode | Templates | Compile |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [MyLibrary.Blocks.Examples.PID\\_Controller](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.err) ([sim](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.sim)) | 0.05 ([4/7 failed](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.diff.html)) | 0.02 | 1.52 | 1.96 | 0.08 | 0.20 | 0.01 | 0.02 | 1.20 |
| [MyLibrary.Mechanics.MultiBody.Examples.Pendulum](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.err) ([sim](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.sim)) | 0.01 (3 verified) | 0.06 | 2.32 | 1.95 | 0.29 | 0.22 | 0.03 | 0.06 | 1.72 |

## Detailed report

https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/MyLibrary_pr-8.html
`

describe('summary.ts', () => {
  afterAll(() => fs.rmSync(libOverviewFile, { force: true }))
  beforeEach(() => fs.rmSync(libOverviewFile, { force: true }))

  it('Markdown summary from HTML file', async () => {
    fs.writeFileSync(libOverviewFile, htmlLibOverview)
    const [summary, outputs] = await summaryFromHtmlFile(
      libOverviewFile,
      'https://USERNAME.github.io/REPOSITORY/',
      'stable',
      'MyLibrary',
      'pr-8',
      true
    )
    expect(summary).toEqual(markdownSummary)
    expect(outputs).toEqual({
      simulationTestsPassing: true,
      nSimulationPassing: 2,
      verificationTestsPassing: false,
      nVerificationPassing: 1
    } as ActionOutputs)
  })
})
