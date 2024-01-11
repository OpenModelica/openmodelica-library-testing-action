#!/usr/bin/python3

import os
import shutil
import sys

def copyFiles(libraryName, branchLib, branchOM, omLibTestingDir, targetDir):
  """
  Zip HTML files and save in target directory.

  Arguments
  libraryName     -- Name of Modelica library.
  branchLib       -- Branch or version of Modelica library.
  branchOM        -- Branch or version of OpenModelica.
  omLibTestingDir -- Root directory of OpenModelicaLibraryTesting repository.
  targetDir       -- Target directory.
  """

  libNameBranch = f"{libraryName}_{branchLib}"

  shutil.copytree(os.path.join(omLibTestingDir, "files"),
                  os.path.join(targetDir, branchOM, libNameBranch, "files"),
                  dirs_exist_ok = True)

  shutil.copy2(os.path.join(omLibTestingDir, "overview.html"),
               os.path.join(targetDir, "index.html"))

  # Copy library overview
  shutil.copy2(os.path.join(omLibTestingDir, f"{libNameBranch}.html"),
               os.path.join(targetDir, branchOM, libNameBranch, f"{libNameBranch}.html"))

  # Copy dygraph script
  shutil.copy2(os.path.join(os.path.dirname(__file__), "dygraph-combined.js"),
               os.path.join(targetDir, branchOM, libNameBranch, "files", "dygraph-combined.js"))

if len(sys.argv) != 6:
  raise Exception("Wrong number of input arguments.\nUsage:\narchieveResults.py libraryName libVersion branchOM omLibTestingDir zipFile")

libraryName     = sys.argv[1]
libVersion      = sys.argv[2]
branchOM        = sys.argv[3]
omLibTestingDir = sys.argv[4]
targetDir       = sys.argv[5]

# If running inside a pull request
if libVersion.endswith('/merge'):
  libVersion = 'dev-pr-' + libVersion.replace('/merge', '')

copyFiles(libraryName, libVersion, branchOM, omLibTestingDir, targetDir)

root_url = os.getenv("PAGES_URL")

url = f"{root_url}/{branchOM}/{libraryName}_{libVersion}/{libraryName}_{libVersion}.html"
output_file = os.getenv('GITHUB_OUTPUT')
with open(output_file, "a") as f:
  f.write(f"pages-url={url}\n")
