import * as fsPromise from 'fs/promises'
import * as path from 'path'

type Library = [string, string]
type ReferenceFileExtension = 'csv' | 'mat'
type ReferenceFileNameDelimiter = '.' | '/' | '_'

export interface ReferenceFiles {
  giturl: string
  destination: string
}

export interface Configuration {
  library: string
  libraryVersion: string
  libraryVersionNameForTests?: string
  libraryVersionLatestInPackageManager?: boolean
  extraLibraries?: Library[]
  ignoreModelPrefix?: string
  referenceFileExtension?: ReferenceFileExtension
  referenceFileNameDelimiter?: ReferenceFileNameDelimiter
  referenceFileNameExtraName?: string
  referenceFinalDot?: string
  referenceFiles?: string | ReferenceFiles
  allReferenceFilesExist?: boolean
  simCodeTarget?: string
  ulimitOmc?: number
  ulimitExe?: number
  ulimitMemory?: number
  optlevel?: string
  alarmFlag?: string
  abortSlowSimulation?: string
  loadFileCommands?: string[]
  extraCustomCommands?: string[]
  environmentSimulation?: [string, string][]
  configExtraName?: string
}

/**
 * Generate OpenModelicaLibraryTesting configuration file.
 *
 * @param file            Path to configuration file.
 *                        If a file descriptor is provided, the underlying file will not be closed automatically.
 * @param configurations  Array of configurations for Modelica libraries.
 */
export async function genConfigFile(
  file: string,
  configurations: Configuration[]
): Promise<void> {
  await fsPromise.mkdir(path.dirname(file), { recursive: true })
  await fsPromise.writeFile(file, JSON.stringify(configurations, null, 2))
}
