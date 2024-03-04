/**
 * Unit tests for src/get-msys.ts
 */

import * as fs from 'fs'
import * as path from 'path'

import { expect } from '@jest/globals'
import { getMSYS } from '../src/get-msys'

// TODO: Mock OMDEV and OPENMODLEICAHOME as well as tools/msys directories.

interface ProcessEnv {
  [key: string]: string | undefined
}

const tempTestDir = path.join('__tests__', 'tmp-msys')

function mockMsys(rootDir: string, environments: string[]): void {
  for (const env of environments) {
    fs.mkdirSync(path.join(rootDir, env), { recursive: true })
    fs.writeFileSync(path.join(rootDir, `${env}.exe`), '')
  }
}

describe('get-msys.ts', () => {
  // Save environment variables
  let originalEnv: ProcessEnv
  beforeEach(() => {
    originalEnv = { ...process.env }
    process.env['OMDEV'] = undefined
    process.env['OPENMODELICAHOME'] = undefined
    fs.rmSync(tempTestDir, { recursive: true, force: true })
  })
  afterEach(() => {
    process.env = originalEnv
    fs.rmSync(tempTestDir, { recursive: true, force: true })
  })

  it('Get MSYS environment from OMDEV', async () => {
    process.env['OMDEV'] = path.join(tempTestDir, 'OMDev')
    mockMsys(path.join(tempTestDir, 'OMDev', 'tools', 'msys'), [
      'mingw64',
      'ucrt64'
    ])

    const env = getMSYS()
    expect(env).toEqual('ucrt64')
  })

  it('Get MSYS environment from OPENMODELICAHOME', async () => {
    process.env['OPENMODELICAHOME'] = path.join(tempTestDir, 'OpenModelica')
    mockMsys(path.join(tempTestDir, 'OpenModelica', 'tools', 'msys'), [
      'mingw64'
    ])

    const env = getMSYS()
    expect(env).toEqual('mingw64')
  })

  it('Get MSYS environment from OMDEV and OPENMODELICAHOME', async () => {
    process.env['OMDEV'] = path.join(tempTestDir, 'OMDev')
    mockMsys(path.join(tempTestDir, 'OMDev', 'tools', 'msys'), ['mingw64'])

    process.env['OPENMODELICAHOME'] = path.join(tempTestDir, 'OpenModelica')
    mockMsys(path.join(tempTestDir, 'OpenModelica', 'tools', 'msys'), [
      'ucrt64'
    ])

    const env = getMSYS()
    expect(env).toEqual('mingw64')
  })
})
