/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as core from '@actions/core'
import * as main from '../src/main'
import { readFileSync, rmSync, writeFileSync } from 'fs'
import { resolve, join } from 'path'

// Some expected string
const mdCoverageTable = `| Total | Frontend | Backend | SimCode | Templates | Compilation | Simulation | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 |`

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')
const modelicaFile = resolve('examples/MyLibrary/package.mo')
const referenceRilesDir = resolve('examples/ReferenceFiles')

// Mock the GitHub Actions core library
let debugMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let infoMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let setOutputMock: jest.SpyInstance

// Set GitHub summary file
const gitHubStepSummaryFile = resolve(join('__tests__', 'github_step_summary.md'))
process.env.GITHUB_STEP_SUMMARY = gitHubStepSummaryFile

describe('action', () => {
  afterAll(() => {
    rmSync('OpenModelicaLibraryTesting', { recursive: true, force: true })
    rmSync(gitHubStepSummaryFile, { force: true })
  })
  beforeEach(() => {
    rmSync('OpenModelicaLibraryTesting', { recursive: true, force: true })
    rmSync(gitHubStepSummaryFile, { force: true })
    writeFileSync(gitHubStepSummaryFile, '', {flag: 'w'})

    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    infoMock = jest.spyOn(core, 'info').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('Run action', async () => {
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
    expect(debugMock).toHaveBeenCalledTimes(9)
    expect(debugMock).toHaveBeenNthCalledWith(1, 'Get inputs')
    expect(debugMock).toHaveBeenNthCalledWith(2, 'clone OpenModelicaLibraryTesting')
    expect(debugMock).toHaveBeenNthCalledWith(3, 'Generating configuration')
    expect(debugMock).toHaveBeenNthCalledWith(4, 'Running python test.py --branch=master --noclean configs/conf-MyLibrary.json')
    expect(debugMock).toHaveBeenNthCalledWith(6, 'Running python report.py --branch=master configs/conf-MyLibrary.json')
    expect(debugMock).toHaveBeenNthCalledWith(8, 'Write summary')
    expect(debugMock).toHaveBeenNthCalledWith(9, 'Set outputs')

    expect(errorMock).not.toHaveBeenCalled()

    expect(setOutputMock).toHaveBeenCalledTimes(4)
    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'simulation-tests-passing', true)
    expect(setOutputMock).toHaveBeenNthCalledWith(2, 'n-simulation-passing', 2)
    expect(setOutputMock).toHaveBeenNthCalledWith(3, 'verification-tests-passing', false)
    expect(setOutputMock).toHaveBeenNthCalledWith(4, 'n-verification-passing', 1)

    expect(infoMock).toHaveBeenNthCalledWith(1, `simulation-tests-passing: true`)
    expect(infoMock).toHaveBeenNthCalledWith(2, `n-simulation-passing: 2`)
    expect(infoMock).toHaveBeenNthCalledWith(3, `verification-tests-passing: false`)
    expect(infoMock).toHaveBeenNthCalledWith(4, `n-verification-passing: 1`)

    // Verify summary file
    const summaryContent = readFileSync(gitHubStepSummaryFile, 'utf-8')
    expect(summaryContent).toContain(mdCoverageTable)
    expect(summaryContent).toContain('MyLibrary.Blocks.Examples.PID\\_Controller | 4/7 failed')
  }, 10*60000 /* 10 minutes */)
})
