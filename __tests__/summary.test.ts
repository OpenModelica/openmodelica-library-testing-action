/**
 * Unit tests for src/summary.ts
 */

import * as fs from 'fs'
import { expect } from '@jest/globals'
import { summaryFromHtmlFile } from '../src/summary'

const htmlLibOverview = `<!DOCTYPE html>
<html lang="en">
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

<p>
Test started: 2025-11-12 14:21:56<br/>
Total time taken: 0:00:15<br>
System info: Intel(R) Core(TM) i7-10700KF CPU @ 3.80GHz, 16 GB RAM, Ubuntu 24.04.3 LTS</p>
<p>OpenModelica Version: v1.26.0-dev-471-g729822b244-cmake<br>


OpenModelicaLibraryTesting Changes<br>
<table><tr><th>Commit</th><th>Date</th><th>Author</th><th>Summary</th></tr><tr><td><a href="https://github.com/OpenModelica/OpenModelicaLibraryTesting/commit//601633f">601633f</a></td><td>2025-11-12 12:03:57 +0100</td><td>Andreas</td><td>Fixing OMPython at v3.6 (#245)</td></tr></table>
</p>
<p>Tested Library: 1.0.0<pre>
</pre></p>
<p>
BuildModel time limit: 660s<br>
Simulation time limit: 480s<br>
Default tolerance: 1e-06<br>
Default number of intervals: 2500<br>
Optimization level: Tool default</p>
<p>Reference Files: /path/to/ReferenceFiles</p><table><tr><th>Commit</th><th>Date</th><th>Author</th><th>Summary</th></tr><tr><td><a href="git@github.com:OpenModelica/openmodelica-library-testing-action.git
/996916f">996916f</a></td><td>2025-11-12 12:36:21 +0100</td><td>AnHeuermann</td><td>Update OpenModelicaLibraryTesting SHA</td></tr></table>

<p>Verified using: v1.26.0-dev-471-g729822b244-cmake (diffSimulationResults)</p>
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
 &quot;referenceFileExtension&quot;: &quot;csv&quot;,
 &quot;referenceFileNameDelimiter&quot;: &quot;.&quot;,
 &quot;referenceFiles&quot;: &quot;/path/to/ReferenceFiles&quot;
}</pre>
<p>Links are provided if getErrorString() or the simulation generates output. The links are coded with <font style="#FF0000">red</font> if there were errors, <font style="#FFCC66">yellow</font> if there were warnings, and normal links if there are only notifications.</p>
<table>
<tr><th>Model</th><th>Verified</th><th>Simulate</th><th>Total buildModel</th><th>Parsing</th><th>Frontend</th><th>Backend</th><th>SimCode</th><th>Templates</th><th>Compile</th><th>Total Execution</th></tr>
<tr><td><a href="files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.err">MyLibrary.Blocks.Examples.PID_Controller</a> (<a href="files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.sim">sim</a>)</td><td bgcolor="#FFCC66">0.08 (<a href="files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.diff.html">4/7 failed</a>)</td><td bgcolor="#00FF00">0.02</td><td bgcolor="#00FF00">2.25</td><td>3.68</td><td bgcolor="#00FF00">0.12</td><td bgcolor="#00FF00">0.07</td><td bgcolor="#00FF00">0.02</td><td bgcolor="#00FF00">0.05</td><td bgcolor="#00FF00">1.99</td><td>7.04</td></tr>

<tr><td><a href="files/MyLibrary_main_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.err">MyLibrary.Mechanics.MultiBody.Examples.Pendulum</a> (<a href="files/MyLibrary_main_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.sim">sim</a>)</td><td bgcolor="#00FF00">0.03 (3 verified)</td><td bgcolor="#00FF00">0.09</td><td bgcolor="#00FF00">3.76</td><td>3.68</td><td bgcolor="#00FF00">0.18</td><td bgcolor="#00FF00">0.71</td><td bgcolor="#00FF00">0.05</td><td bgcolor="#00FF00">0.10</td><td bgcolor="#00FF00">2.73</td><td>8.59</td></tr>

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

| Model | Verified | Simulate | Total buildModel | Parsing | Frontend | Backend | SimCode | Templates | Compile | Total Execution |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [MyLibrary.Blocks.Examples.PID\\_Controller](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.err) ([sim](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.sim)) | 0.08 ([4/7 failed](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Blocks.Examples.PID_Controller.diff.html)) | 0.02 | 2.25 | 3.68 | 0.12 | 0.07 | 0.02 | 0.05 | 1.99 | 7.04 |
| [MyLibrary.Mechanics.MultiBody.Examples.Pendulum](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.err) ([sim](https://USERNAME.github.io/REPOSITORY/stable/MyLibrary_pr-8/files/MyLibrary_main_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.sim)) | 0.03 (3 verified) | 0.09 | 3.76 | 3.68 | 0.18 | 0.71 | 0.05 | 0.10 | 2.73 | 8.59 |

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
    })
  })
})
