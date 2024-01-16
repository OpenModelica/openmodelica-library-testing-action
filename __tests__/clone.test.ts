/**
 * Unit tests for src/clone.ts
 */

import { cloneScripts } from '../src/clone'
import { expect } from '@jest/globals'
import { join } from 'path'
import { existsSync, rmSync, mkdirSync } from 'fs'
import simpleGit from 'simple-git'

const tempTestDir = join('__tests__', 'clone')
const oldDir = process.cwd()

describe('clone.ts', () => {
  beforeAll(() => rmSync(tempTestDir, { recursive: true, force: true }))
  afterEach(() => {
    process.chdir(oldDir)
    rmSync(tempTestDir, { recursive: true, force: true })
  })

  it('Generate minimal configuration', async () => {
    await cloneScripts('cdf827130ce7df206264f673972a691fb469533a', tempTestDir)
    expect(existsSync(join(tempTestDir, 'OpenModelicaLibraryTesting', 'test.py'))).toBe(true)

    const git = simpleGit({ baseDir: join(tempTestDir, 'OpenModelicaLibraryTesting')})
    expect(await git.revparse(['--abbrev-ref', 'HEAD'])).toEqual('master')
    expect(await git.revparse(['HEAD'])).toEqual('cdf827130ce7df206264f673972a691fb469533a')
  }, 60000)

  it('Generate minimal configuration', async () => {
    mkdirSync(join(tempTestDir, 'OpenModelicaLibraryTesting'), { recursive: true})
    process.chdir(tempTestDir)
    await cloneScripts('cdf827130ce7df206264f673972a691fb469533a')
    expect(existsSync(join('OpenModelicaLibraryTesting', 'test.py'))).toBe(true)

    const git = simpleGit({ baseDir: 'OpenModelicaLibraryTesting'})
    expect(await git.revparse(['--abbrev-ref', 'HEAD'])).toEqual('master')
    expect(await git.revparse(['HEAD'])).toEqual('cdf827130ce7df206264f673972a691fb469533a')
  }, 60000)
})
