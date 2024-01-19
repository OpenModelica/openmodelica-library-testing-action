import { promises as fsPromises } from 'fs'
import * as path from 'path'
import SimpleGit from 'simple-git'

/**
 * Clone OpenModelica/OpenModelicaLibraryTesting at `ref`.
 *
 * @param ref     Commit to checkout.
 * @param baseDir Base directory for all git operations.
 */
export async function cloneScripts(
  ref: string,
  baseDir?: string
): Promise<void> {
  if (baseDir !== undefined) {
    await fsPromises.mkdir(baseDir, { recursive: true })
  }

  const git = SimpleGit({ baseDir })
  await git.clone(
    'https://github.com/OpenModelica/OpenModelicaLibraryTesting.git',
    'OpenModelicaLibraryTesting'
  )
  await git.cwd(path.join(baseDir ?? '', 'OpenModelicaLibraryTesting'))
  await git.reset(['--hard', ref])
}
