/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as fs from 'fs'
import * as path from 'path'
import * as core from '@actions/core'
import * as main from '../src/main'

// Some expected string
const mdCoverageTable = `| Total | Frontend | Backend | SimCode | Templates | Compilation | Simulation | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 |`

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
const modelicaFile = path.resolve('examples/MyLibrary/package.mo')
const referenceRilesDir = path.resolve('examples/ReferenceFiles')

// Mock the GitHub Actions core library
let debugMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let infoMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let setOutputMock: jest.SpyInstance

// Mock @actions/artifact and @actions/github
jest.mock('@actions/artifact')
jest.mock('@actions/github')

// Set GitHub summary file
const gitHubStepSummaryFile = path.resolve(
  path.join('__tests__', 'github_step_summary.md')
)
process.env.GITHUB_STEP_SUMMARY = gitHubStepSummaryFile

describe('action', () => {
  afterAll(() => {
    fs.rmSync('OpenModelicaLibraryTesting', { recursive: true, force: true })
    fs.rmSync('html', { recursive: true, force: true })
    fs.rmSync(gitHubStepSummaryFile, { force: true })
  })
  beforeEach(() => {
    fs.rmSync('OpenModelicaLibraryTesting', { recursive: true, force: true })
    fs.rmSync('html', { recursive: true, force: true })
    fs.rmSync(gitHubStepSummaryFile, { force: true })
    fs.writeFileSync(gitHubStepSummaryFile, '', { flag: 'w' })

    jest.clearAllMocks()

    debugMock = jest
      .spyOn(core, 'debug')
      .mockImplementation(msg => console.log(`::debug::${msg}`))
    infoMock = jest
      .spyOn(core, 'info')
      .mockImplementation(msg => console.log(`::info::${msg}`))
    errorMock = jest
      .spyOn(core, 'error')
      .mockImplementation(msg => console.log(`::error::${msg}`))
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it(
    'Run action',
    async () => {
      // Set the action's inputs as return values from core.getInput()
      getInputMock.mockImplementation((name: string): string => {
        switch (name) {
          case 'library':
            return 'MyLibrary'
          case 'library-version':
            return 'refs/pull/123/merge'
          case 'modelica-file':
            return modelicaFile
          case 'reference-files-dir':
            return referenceRilesDir
          case 'reference-files-extension':
            return 'csv'
          case 'reference-files-delimiter':
            return '.'
          case 'omc-version':
            return 'master'
          case 'pages-root-url':
            return 'https://USERNAME.github.io/REPOSITORY/'
          default:
            return ''
        }
      })

      await main.run()
      expect(runMock).toHaveReturned()

      // Verify that all of the core library functions were called correctly
      expect(debugMock).toHaveBeenNthCalledWith(1, 'Get inputs')
      expect(debugMock).toHaveBeenNthCalledWith(
        2,
        'clone OpenModelicaLibraryTesting'
      )
      expect(debugMock).toHaveBeenNthCalledWith(4, 'Generating configuration')
      expect(debugMock).toHaveBeenNthCalledWith(
        5,
        'Running python test.py --branch=master --noclean configs/conf-MyLibrary.json'
      )
      expect(debugMock).toHaveBeenNthCalledWith(
        7,
        'Running python report.py --branch=master configs/conf-MyLibrary.json'
      )
      expect(debugMock).toHaveBeenNthCalledWith(9, 'Write summary')
      expect(debugMock).toHaveBeenNthCalledWith(10, 'Set outputs')
      expect(debugMock).toHaveBeenNthCalledWith(11, 'Collect HTML outputs')
      expect(debugMock).toHaveBeenNthCalledWith(12, 'Upload artifacts')
      expect(debugMock).toHaveBeenCalledTimes(12)

      expect(setOutputMock).toHaveBeenNthCalledWith(
        1,
        'simulation-tests-passing',
        true
      )
      expect(setOutputMock).toHaveBeenNthCalledWith(
        2,
        'n-simulation-passing',
        2
      )
      expect(setOutputMock).toHaveBeenNthCalledWith(
        3,
        'verification-tests-passing',
        false
      )
      expect(setOutputMock).toHaveBeenNthCalledWith(
        4,
        'n-verification-passing',
        1
      )
      expect(setOutputMock).toHaveBeenCalledTimes(4)

      expect(infoMock).toHaveBeenNthCalledWith(
        2,
        `simulation-tests-passing: true`
      )
      expect(infoMock).toHaveBeenNthCalledWith(3, `n-simulation-passing: 2`)
      expect(infoMock).toHaveBeenNthCalledWith(
        4,
        `verification-tests-passing: false`
      )
      expect(infoMock).toHaveBeenNthCalledWith(5, `n-verification-passing: 1`)
      expect(infoMock).toHaveBeenCalledTimes(5)

      expect(errorMock).not.toHaveBeenCalled()
      expect(setFailedMock).not.toHaveBeenCalled()

      // Verify summary file
      const summaryContent = fs.readFileSync(gitHubStepSummaryFile, 'utf-8')
      expect(summaryContent).toContain(mdCoverageTable)
      expect(summaryContent).toContain(
        '| [MyLibrary.Blocks.Examples.PID\\_Controller](https://USERNAME.github.io/REPOSITORY/master/MyLibrary_pr-123/files/MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.err) ([sim](https://USERNAME.github.io/REPOSITORY/master/MyLibrary_pr-123/files/MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.sim)) | 0.06 ([4/7 failed](https://USERNAME.github.io/REPOSITORY/master/MyLibrary_pr-123/files/MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.html))'
      )

      // Verify html/ dir
      const files = fs.readdirSync(
        path.join('html', 'master', 'MyLibrary_pr-123', 'files')
      )
      expect(files.sort()).toEqual([
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.cmdout',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.html',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.inertia1.phi.csv',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.inertia1.phi.html',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.inertia1.w.csv',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.inertia1.w.html',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.spring.phi_rel.csv',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.spring.phi_rel.html',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.spring.w_rel.csv',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.spring.w_rel.html',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.err',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.sim',
        'MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.stat.json',
        'MyLibrary_pr-123_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.cmdout',
        'MyLibrary_pr-123_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.err',
        'MyLibrary_pr-123_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.sim',
        'MyLibrary_pr-123_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.stat.json',
        'dygraph-combined.js'
      ])

      expect(
        fs.existsSync(
          path.join(
            'html',
            'master',
            'MyLibrary_pr-123',
            'MyLibrary_pr-123.html'
          )
        )
      ).toBe(true)
    },
    10 * 60000 /* 10 minutes */
  )
})
