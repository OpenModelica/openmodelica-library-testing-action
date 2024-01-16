import { join } from 'path'
import { promises as fsPromises } from 'fs'
import * as core from '@actions/core'
import simpleGit from 'simple-git'

/**
 * Clone OpenModelica/OpenModelicaLibraryTesting at `ref`.
 *
 * @param ref     Commit to checkout.
 * @param baseDir Base directory for all git operations.
 */
export async function cloneScripts(ref: string, baseDir?: string): Promise<void>{
  core.debug('clone OpenModelicaLibraryTesting')
  if (baseDir !== undefined) {
    await fsPromises.mkdir(baseDir, { recursive: true })
  }

  const git = simpleGit({ baseDir: baseDir})
  await git.clone('https://github.com/OpenModelica/OpenModelicaLibraryTesting.git', 'OpenModelicaLibraryTesting')
  await git.cwd(join(baseDir ?? '', 'OpenModelicaLibraryTesting'))
  await git.reset(['--hard', ref])
}
