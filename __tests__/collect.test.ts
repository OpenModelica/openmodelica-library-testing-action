/**
 * Unit tests for src/collect.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { expect } from '@jest/globals'
import { copyHtmlFilesSync } from '../src/collect'

const tempTestDir = path.join('__tests__', 'tmp-collect')

function mockFileStructure(
  libraryName: string,
  libraryVersion: string,
  modelPrefix: string,
  dest: string
): void {
  const filesModelPrefix = path.join(dest, 'files', modelPrefix)
  fs.mkdirSync(path.join(dest, 'files'), { recursive: true })

  fs.writeFileSync(`${filesModelPrefix}.cmdout`, `${modelPrefix}.cmdout`)
  fs.writeFileSync(`${filesModelPrefix}.diff.html`, `${modelPrefix}.diff.html`)
  fs.writeFileSync(
    `${filesModelPrefix}.diff.x.csv`,
    `${modelPrefix}.diff.x.csv`
  )
  fs.writeFileSync(
    `${filesModelPrefix}.diff.x.html`,
    `${modelPrefix}.diff.x.html`
  )
  fs.writeFileSync(`${filesModelPrefix}.err`, `${modelPrefix}.err`)
  fs.writeFileSync(`${filesModelPrefix}.sim`, `${modelPrefix}.sim`)
  fs.writeFileSync(`${filesModelPrefix}.json`, `${modelPrefix}.json`)

  fs.writeFileSync(path.join(dest, 'overview.html'), 'overview.html')
  fs.writeFileSync(
    path.join(dest, `${libraryName}_${libraryVersion}.html`),
    '${libraryName}_${libraryVersion}.html'
  )
}

describe('collect.ts', () => {
  beforeAll(() => fs.rmSync(tempTestDir, { recursive: true, force: true }))
  afterEach(() => fs.rmSync(tempTestDir, { recursive: true, force: true }))

  it('Copy HTML files', () => {
    const libraryName = 'MyLibrary'
    const libraryVersion = '1.2.3'
    const modelPrefix = `${libraryName}_${libraryVersion}_${libraryName}.Examples.M`
    const branchOM = 'master'
    const omLibTestingDir = path.join(tempTestDir, 'OpenModelicaLibraryTesting')
    const targetDir = path.join(tempTestDir, 'html')
    mockFileStructure(libraryName, libraryVersion, modelPrefix, omLibTestingDir)

    copyHtmlFilesSync(
      libraryName,
      libraryVersion,
      branchOM,
      omLibTestingDir,
      targetDir
    )

    const files = fs.readdirSync(
      path.join(
        targetDir,
        branchOM,
        `${libraryName}_${libraryVersion}`,
        'files'
      )
    )
    expect(files.sort()).toEqual([
      `${modelPrefix}.cmdout`,
      `${modelPrefix}.diff.html`,
      `${modelPrefix}.diff.x.csv`,
      `${modelPrefix}.diff.x.html`,
      `${modelPrefix}.err`,
      `${modelPrefix}.json`,
      `${modelPrefix}.sim`,
      'dygraph-combined.js'
    ])

    expect(
      fs.existsSync(
        path.join(
          targetDir,
          branchOM,
          `${libraryName}_${libraryVersion}`,
          `${libraryName}_${libraryVersion}.html`
        )
      )
    ).toBe(true)

    expect(fs.existsSync(path.join(targetDir, 'index.html'))).toBe(true)
  })
})
