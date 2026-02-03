/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * These should be run as if the action was called from a workflow.
 * Specifically, the inputs listed in `action.yml` should be set as environment
 * variables following the pattern `INPUT_<INPUT_NAME>`.
 */

import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'
import { expect, jest, describe, beforeEach, afterAll, it } from '@jest/globals'

// Import mocks from fixtures
import * as core from '../__fixtures__/core.js'

// Some expected string
const mdCoverageTable = `| Total | Frontend | Backend | SimCode | Templates | Compilation | Simulation | Verification |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 2 | 2 | 2 | 2 | 2 | 2 | 2 | 1 |`

const modelicaFile = path.resolve(
  path.join('examples', 'MyLibrary', 'package.mo')
)
const referenceFilesDir = path.resolve(path.join('examples', 'ReferenceFiles'))

// Mock the GitHub Actions core library
jest.unstable_mockModule('@actions/core', () => core)

// Mock @actions/artifact and @actions/github
const uploadArtifactMock = jest
  .fn<() => Promise<{ size: number; id: number }>>()
  .mockResolvedValue({ size: 0, id: 0 })

jest.unstable_mockModule('@actions/artifact', () => ({
  DefaultArtifactClient: jest.fn().mockImplementation(() => ({
    uploadArtifact: uploadArtifactMock
  }))
}))

jest.unstable_mockModule('@actions/github', () => ({
  context: {
    repo: { owner: 'test', repo: 'test' },
    runId: 123
  }
}))

// Dynamic imports after mocking
const main = await import('../src/main')
const { getMSYS } = await import('../src/get-msys')

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
    // Reset summary buffer
    core.resetSummaryBuffer()

    core.debug.mockImplementation(msg => console.log(`::debug::${msg}`))
    core.info.mockImplementation(msg => console.log(`::info::${msg}`))
    core.error.mockImplementation(msg => console.log(`::error::${msg}`))
  })

  it(
    'Run action',
    async () => {
      // Set the action's inputs as return values from core.getInput()
      core.getInput.mockImplementation((name: string): string => {
        switch (name) {
          case 'library':
            return 'MyLibrary'
          case 'library-version':
            return 'refs/pull/123/merge'
          case 'modelica-file':
            return modelicaFile
          case 'reference-files-dir':
            return referenceFilesDir
          case 'reference-files-extension':
            return 'csv'
          case 'reference-files-delimiter':
            return '.'
          case 'omc-version':
            return 'master'
          case 'pages-root-url':
            return 'https://USERNAME.github.io/REPOSITORY/'
          case 'allow-failing-tests':
            return 'true'
          default:
            return ''
        }
      })

      await main.run()

      // Verify that all of the core library functions were called correctly
      expect(core.debug).toHaveBeenNthCalledWith(1, 'Get inputs')
      expect(core.debug).toHaveBeenNthCalledWith(
        2,
        'clone OpenModelicaLibraryTesting'
      )
      expect(core.debug).toHaveBeenNthCalledWith(4, 'Generating configuration')
      expect(core.debug).toHaveBeenNthCalledWith(
        5,
        'Running python test.py --verbose --branch=master --noclean' +
          ` ${os.platform() === 'win32' ? `--msysEnvironment=${getMSYS()}` : ''}` +
          ` ${path.join('configs', 'conf-MyLibrary.json')}`
      )
      expect(core.debug).toHaveBeenNthCalledWith(
        7,
        'Running python report.py --branch=master' +
          ` ${path.join('configs', 'conf-MyLibrary.json')}`
      )
      expect(core.debug).toHaveBeenNthCalledWith(9, 'Write summary')
      expect(core.debug).toHaveBeenNthCalledWith(10, 'Set outputs')
      expect(core.debug).toHaveBeenNthCalledWith(11, 'Collect HTML outputs')
      expect(core.debug).toHaveBeenNthCalledWith(12, 'Upload artifacts')
      expect(core.debug).toHaveBeenCalledTimes(12)

      expect(core.setOutput).toHaveBeenNthCalledWith(
        1,
        'simulation-tests-passing',
        true
      )
      expect(core.setOutput).toHaveBeenNthCalledWith(
        2,
        'n-simulation-passing',
        2
      )
      expect(core.setOutput).toHaveBeenNthCalledWith(
        3,
        'verification-tests-passing',
        false
      )
      expect(core.setOutput).toHaveBeenNthCalledWith(
        4,
        'n-verification-passing',
        1
      )
      expect(core.setOutput).toHaveBeenCalledTimes(4)

      expect(core.info).toHaveBeenNthCalledWith(
        2,
        `simulation-tests-passing: true`
      )
      expect(core.info).toHaveBeenNthCalledWith(3, `n-simulation-passing: 2`)
      expect(core.info).toHaveBeenNthCalledWith(
        4,
        `verification-tests-passing: false`
      )
      expect(core.info).toHaveBeenNthCalledWith(5, `n-verification-passing: 1`)
      expect(core.info).toHaveBeenCalledTimes(5)

      expect(core.error).not.toHaveBeenCalled()
      expect(core.setFailed).not.toHaveBeenCalled()

      // Verify summary file
      const summaryContent = fs.readFileSync(gitHubStepSummaryFile, 'utf-8')
      expect(summaryContent).toContain(mdCoverageTable)
      expect(summaryContent).toContain(
        '| [MyLibrary.Blocks.Examples.PID\\_Controller](https://USERNAME.github.io/REPOSITORY/master/MyLibrary_pr-123/files/MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.err) ([sim](https://USERNAME.github.io/REPOSITORY/master/MyLibrary_pr-123/files/MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.sim)) |'
      )
      expect(summaryContent).toContain(
        '[4/7 failed](https://USERNAME.github.io/REPOSITORY/master/MyLibrary_pr-123/files/MyLibrary_pr-123_MyLibrary.Blocks.Examples.PID_Controller.diff.html)) |'
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
