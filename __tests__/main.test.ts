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

// Set GitHub summary file
const gitHubStepSummaryFile = path.resolve(
  path.join('__tests__', 'github_step_summary.md')
)
process.env.GITHUB_STEP_SUMMARY = gitHubStepSummaryFile

describe('action', () => {
  afterAll(() => {
    fs.rmSync('OpenModelicaLibraryTesting', { recursive: true, force: true })
    //fs.rmSync('html', { recursive: true, force: true })
    fs.rmSync(gitHubStepSummaryFile, { force: true })
  })
  beforeEach(() => {
    fs.rmSync('OpenModelicaLibraryTesting', { recursive: true, force: true })
    fs.rmSync('html', { recursive: true, force: true })
    fs.rmSync(gitHubStepSummaryFile, { force: true })
    fs.writeFileSync(gitHubStepSummaryFile, '', { flag: 'w' })

    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    infoMock = jest.spyOn(core, 'info').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
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
          case 'package-name':
            return 'MyLibrary'
          case 'package-version':
            return '0.1.0'
          case 'modelica-file':
            return modelicaFile
          case 'reference-files-dir':
            return referenceRilesDir
          case 'reference-files-format':
            return 'csv'
          case 'reference-files-delimiter':
            return '.'
          case 'omcVersion':
            return 'master'
          case 'pagesRootUrl':
            return 'https://not/a/valid/url'
          default:
            return ''
        }
      })
      // Mock logging functions
      debugMock.mockImplementation((msg: string): void => {
        console.log(msg)
      })
      errorMock.mockImplementation((msg: string): void => {
        console.log(msg)
      })
      infoMock.mockImplementation((msg: string): void => {
        console.log(msg)
      })

      await main.run()
      expect(runMock).toHaveReturned()

      // Verify that all of the core library functions were called correctly
      expect(debugMock).toHaveBeenCalledTimes(10)
      expect(debugMock).toHaveBeenNthCalledWith(1, 'Get inputs')
      expect(debugMock).toHaveBeenNthCalledWith(
        2,
        'clone OpenModelicaLibraryTesting'
      )
      expect(debugMock).toHaveBeenNthCalledWith(3, 'Generating configuration')
      expect(debugMock).toHaveBeenNthCalledWith(
        4,
        'Running python test.py --branch=master --noclean configs/conf-MyLibrary.json'
      )
      expect(debugMock).toHaveBeenNthCalledWith(
        6,
        'Running python report.py --branch=master configs/conf-MyLibrary.json'
      )
      expect(debugMock).toHaveBeenNthCalledWith(8, 'Write summary')
      expect(debugMock).toHaveBeenNthCalledWith(9, 'Set outputs')
      expect(debugMock).toHaveBeenNthCalledWith(10, 'Collect HTML outputs')

      expect(setOutputMock).toHaveBeenCalledTimes(4)
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

      expect(infoMock).toHaveBeenNthCalledWith(
        1,
        `simulation-tests-passing: true`
      )
      expect(infoMock).toHaveBeenNthCalledWith(2, `n-simulation-passing: 2`)
      expect(infoMock).toHaveBeenNthCalledWith(
        3,
        `verification-tests-passing: false`
      )
      expect(infoMock).toHaveBeenNthCalledWith(4, `n-verification-passing: 1`)

      expect(errorMock).not.toHaveBeenCalled()
      expect(setFailedMock).not.toHaveBeenCalled()

      // Verify summary file
      const summaryContent = fs.readFileSync(gitHubStepSummaryFile, 'utf-8')
      expect(summaryContent).toContain(mdCoverageTable)
      expect(summaryContent).toContain(
        'MyLibrary.Blocks.Examples.PID\\_Controller | 4/7 failed'
      )

      // Verify html/ dir
      const files = fs.readdirSync(path.join('html', 'master', 'MyLibrary_0.1.0', 'files'))
      expect(files.sort()).toEqual([
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.cmdout',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.diff.html',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.diff.inertia1.phi.csv',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.diff.inertia1.phi.html',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.diff.inertia1.w.csv',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.diff.inertia1.w.html',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.diff.spring.phi_rel.csv',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.diff.spring.phi_rel.html',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.diff.spring.w_rel.csv',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.diff.spring.w_rel.html',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.err',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.sim',
        'MyLibrary_0.1.0_MyLibrary.Blocks.Examples.PID_Controller.stat.json',
        'MyLibrary_0.1.0_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.cmdout',
        'MyLibrary_0.1.0_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.err',
        'MyLibrary_0.1.0_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.sim',
        'MyLibrary_0.1.0_MyLibrary.Mechanics.MultiBody.Examples.Pendulum.stat.json',
        'dygraph-combined.js'
      ])

      expect(
        fs.existsSync(path.join('html', 'master', 'MyLibrary_0.1.0', 'MyLibrary_0.1.0.html'))
      ).toBe(true)

      expect(
        fs.existsSync(path.join('html', 'index.html'))
      ).toBe(true)
    },
    10 * 60000 /* 10 minutes */
  )
})
