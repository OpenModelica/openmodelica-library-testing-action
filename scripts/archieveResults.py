#!/usr/bin/python3

import os
import sys
from zipfile import ZipFile

def zipFiles(libraryName, branchLib, branchOM, omLibTestingDir, zipFile):
  """
  Zip HTML files and save in target directory.

  Arguments
  libraryName     -- Name of Modelica library.
  branchLib       -- Branch or version of Modelica library.
  branchOM        -- Branch or version of OpenModelica.
  omLibTestingDir -- Root directory of OpenModelicaLibraryTesting repository.
  zipFile         -- Target directory for zip file.
  """

  libNameBranch = f"{libraryName}_{branchLib}"

  with ZipFile(zipFile, 'w') as zip:
    # Add logs and diffs
    for path, _, files in os.walk(os.path.join(omLibTestingDir, "files")):
       for file in files:
          zip.write(os.path.join(path, file),
                    arcname=os.path.join(branchOM, libNameBranch, "files", file))

    # Add overview
    zip.write(os.path.join(omLibTestingDir, "overview.html"),
              arcname="index.html")

    # Add library overview
    zip.write(os.path.join(omLibTestingDir, f"{libNameBranch}.html"),
              arcname=os.path.join(branchOM, libNameBranch, f"{libNameBranch}.html"))

    # Add diff javascript
    zip.write(os.path.join(os.path.dirname(__file__), "dygraph-combined.js"),
              arcname=os.path.join(branchOM, libNameBranch, "files", "dygraph-combined.js"))

    zip.printdir()


if len(sys.argv) != 6:
  raise Exception("Wrong number of input arguments.\nUsage:\narchieveResults.py libraryName libVersion branchOM omLibTestingDir zipFile")

libraryName     = sys.argv[1]
libVersion      = sys.argv[2]
branchOM        = sys.argv[3]
omLibTestingDir = sys.argv[4]
zipFile         = sys.argv[5]

# If running inside a pull request
if libVersion.endswith('/merge'):
  libVersion = 'dev-pr-' + libVersion.replace('/merge', '')


zipFiles(libraryName, libVersion, branchOM, omLibTestingDir, zipFile)
