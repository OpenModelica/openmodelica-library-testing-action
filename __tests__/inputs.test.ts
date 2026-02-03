/**
 * Unit tests for src/inputs.ts
 */

import * as path from 'path'
import { expect, jest, describe, beforeEach, it } from '@jest/globals'

// Import mocks from fixtures
import * as core from '../__fixtures__/core.js'

const modelicaFile = path.resolve('examples/MyLibrary/package.mo')
const referenceFilesDir = path.resolve('examples/ReferenceFiles')

// Mock @actions/core before importing modules that use it
jest.unstable_mockModule('@actions/core', () => core)

// Dynamic import after mocking
const { ActionInputs } = await import('../src/inputs')
import type { ActionInputsInterface } from '../src/inputs'

describe('inputs.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Read inputs', async () => {
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
          return 'false'
        default:
          return ''
      }
    })

    const inputs = ActionInputs.newFromGitHub()

    expect(inputs).toEqual({
      library: 'MyLibrary',
      libraryVersion: 'pr-123',
      modelicaFile,
      referenceFilesDir,
      referenceFileExtension: 'csv',
      referenceFileNameDelimiter: '.',
      pagesRootUrl: 'https://USERNAME.github.io/REPOSITORY/',
      omcVersion: 'master',
      allowFailingTests: false
    } as ActionInputsInterface)
  })
})
