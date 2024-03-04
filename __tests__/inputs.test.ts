/**
 * Unit tests for src/inputs.ts
 */

import * as path from 'path'
import * as core from '@actions/core'
import { expect } from '@jest/globals'
import { ActionInputs, ActionInputsInterface } from '../src/inputs'

const modelicaFile = path.resolve('examples/MyLibrary/package.mo')
const referenceFilesDir = path.resolve('examples/ReferenceFiles')

// Mock the GitHub Actions core library
let getInputMock: jest.SpyInstance

describe('inputs.ts', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
  })

  it('Read inputs', async () => {
    getInputMock.mockImplementation((name: string): string => {
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
