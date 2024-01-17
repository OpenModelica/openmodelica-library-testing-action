import * as fs from 'fs'
import * as path from 'path'

/**
 * Copy all html files generated from OpenModelicaLibraryTesting into target directory.
 *
 * @param libraryName     Modelica library name
 * @param libraryVersion  Version or ref of Modelica library
 * @param branchOM        OpenModelica version or ref
 * @param omLibTestingDir Root directory of OpenModelicaLibraryTesting
 * @param targetDir       Target directory
 */
export function copyHtmlFilesSync(
  libraryName: string,
   libraryVersion: string,
   branchOM: string,
   omLibTestingDir: string,
   targetDir: string) {

  const libNameBranch = `${libraryName}_${libraryVersion}`

  if (fs.existsSync(path.join(targetDir, branchOM, libNameBranch))) {
    fs.mkdirSync(
      path.join(targetDir, branchOM, libNameBranch),
      { recursive: true }
    )
  }

  // Copy files/
  fs.cpSync(
    path.join(omLibTestingDir, 'files'),
    path.join(targetDir, branchOM, libNameBranch, 'files'),
    {recursive: true}
  )

  // Copy overview
  fs.cpSync(
    path.join(omLibTestingDir, 'overview.html'),
    path.join(targetDir, 'index.html')
  )

  fs.cpSync(
    path.join(omLibTestingDir, `${libNameBranch}.html`),
    path.join(targetDir, branchOM, libNameBranch, `${libNameBranch}.html`)
  )

  // Copy dygraph script
  fs.cpSync(
    path.join(__dirname, '..', 'scripts', 'dygraph-combined.js'),
    path.join(targetDir, branchOM, libNameBranch, 'files', 'dygraph-combined.js')
  )
}
