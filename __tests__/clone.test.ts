/**
 * Unit tests for src/clone.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import SimpleGit from 'simple-git'
import { expect } from '@jest/globals'
import { cloneScripts } from '../src/clone'

const tempTestDir = path.join('__tests__', 'clone')

describe('clone.ts', () => {
  beforeAll(() => fs.rmSync(tempTestDir, { recursive: true, force: true }))
  afterEach(() => fs.rmSync(tempTestDir, { recursive: true, force: true }))

  it('Generate minimal configuration', async () => {
    await cloneScripts('cdf827130ce7df206264f673972a691fb469533a', tempTestDir)
    expect(
      fs.existsSync(
        path.join(tempTestDir, 'OpenModelicaLibraryTesting', 'test.py')
      )
    ).toBe(true)

    const git = SimpleGit({
      baseDir: path.join(tempTestDir, 'OpenModelicaLibraryTesting')
    })
    expect(await git.revparse(['--abbrev-ref', 'HEAD'])).toEqual('master')
    expect(await git.revparse(['HEAD'])).toEqual(
      'cdf827130ce7df206264f673972a691fb469533a'
    )
  }, 60000)
})
