/**
 * Unit tests for src/config.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { expect } from '@jest/globals'
import { Configuration, genConfigFile } from '../src/config'

const tempTestDir = path.join('__tests__', 'tmp-configs')

describe('config.ts', () => {
  beforeAll(() => fs.rmSync(tempTestDir, { recursive: true, force: true }))
  afterEach(() => fs.rmSync(tempTestDir, { recursive: true, force: true }))

  it('Generate minimal configuration', async () => {
    const modelicaFile = '/path/to/MyLibrary/package.mo'
    const config: Configuration = {
      library: 'MyLibrary',
      libraryVersion: 'main',
      loadFileCommands: [`loadFile("${path.resolve(modelicaFile)}")`]
    }

    expect(config).toEqual({
      library: 'MyLibrary',
      libraryVersion: 'main',
      loadFileCommands: ['loadFile("/path/to/MyLibrary/package.mo")']
    })
  })

  it('Generate minimal configuration file', async () => {
    const file = path.join(tempTestDir, 'testConfigSimple.json')
    const modelicaFile = '/path/to/MyLibrary/package.mo'
    const config: Configuration = {
      library: 'MyLibrary',
      libraryVersion: 'main',
      loadFileCommands: [`loadFile("${path.resolve(modelicaFile)}")`]
    }

    await genConfigFile(file, [config])
    expect(fs.existsSync(file)).toBe(true)
  })

  it('Generate extensive configuration file', async () => {
    const file = path.join(tempTestDir, 'testConfig.json')
    const config: Configuration = {
      library: 'MyLibrary',
      libraryVersion: 'main',
      libraryVersionNameForTests: 'v1.0.0-def',
      libraryVersionLatestInPackageManager: true,
      extraLibraries: [
        ['Modelica', '4.0'],
        ['AnotherLib', 'main']
      ],
      ignoreModelPrefix: 'MyLib.Slow.Examples',
      referenceFileExtension: 'csv',
      referenceFileNameDelimiter: '/',
      referenceFileNameExtraName: '$ClassName',
      referenceFinalDot: '_ref.',
      referenceFiles: {
        giturl: 'https://github.com/User/Repository',
        destination: 'ReferenceFiles/'
      },
      allReferenceFilesExist: false,
      simCodeTarget: 'C',
      ulimitOmc: 300,
      ulimitExe: 300,
      ulimitMemory: 12582912,
      optlevel: '-Os -march=native',
      alarmFlag: '--alarm',
      abortSlowSimulation: '',
      loadFileCommands: ['loadFile("${resolve(modelicaFile)}")'],
      extraCustomCommands: ['setCommandLineOptions("-d=-NLSanalyticJacobian")'],
      environmentSimulation: [
        ['publicData', '$libraryLocation/Tables/'],
        ['privateData', '$libraryLocation/Tables/'],
        [
          'superstructureTables',
          '$libraryLocation/Tables/superstructure/Tables/'
        ],
        [
          'superstructureInput',
          '$libraryLocation/Tables/superstructure/RegionInformation/'
        ]
      ],
      configExtraName: 'noopt'
    }

    await genConfigFile(file, [config])
    expect(fs.existsSync(file)).toBe(true)
  })
})
