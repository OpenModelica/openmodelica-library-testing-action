import { promises as fsPromises } from 'fs'
import { dirname } from 'path'

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
 * @param path            Path to configuration file.
 *                        If a file descriptor is provided, the underlying file will not be closed automatically.
 * @param configurations  Array of configurations for Modelica libraries.
 */
export async function genConfigFile(
  path: string,
  configurations: Configuration[]
): Promise<void> {
  await fsPromises.mkdir(dirname(path), { recursive: true })
  await fsPromises.writeFile(path, JSON.stringify(configurations, null, 2))
}
