/*
 * This file is part of OpenModelica.
 *
 * Copyright (c) 1998-2024, Open Source Modelica Consortium (OSMC),
 * c/o Linköpings universitet, Department of Computer and Information Science,
 * SE-58183 Linköping, Sweden.
 *
 * All rights reserved.
 *
 * THIS PROGRAM IS PROVIDED UNDER THE TERMS OF AGPL VERSION 3 LICENSE OR
 * THIS OSMC PUBLIC LICENSE (OSMC-PL) VERSION 1.8.
 * ANY USE, REPRODUCTION OR DISTRIBUTION OF THIS PROGRAM CONSTITUTES
 * RECIPIENT'S ACCEPTANCE OF THE OSMC PUBLIC LICENSE OR THE GNU AGPL
 * VERSION 3, ACCORDING TO RECIPIENTS CHOICE.
 *
 * The OpenModelica software and the OSMC (Open Source Modelica Consortium)
 * Public License (OSMC-PL) are obtained from OSMC, either from the above
 * address, from the URLs:
 * http://www.openmodelica.org or
 * https://github.com/OpenModelica/ or
 * http://www.ida.liu.se/projects/OpenModelica,
 * and in the OpenModelica distribution.
 *
 * GNU AGPL version 3 is obtained from:
 * https://www.gnu.org/licenses/licenses.html#GPL
 *
 * This program is distributed WITHOUT ANY WARRANTY; without
 * even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE, EXCEPT AS EXPRESSLY SET FORTH
 * IN THE BY RECIPIENT SELECTED SUBSIDIARY LICENSE CONDITIONS OF OSMC-PL.
 *
 * See the full OSMC Public License conditions for more details.
 *
 */

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
