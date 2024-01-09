#!/usr/bin/python3

import os
import sys

"""
Generate configuration file for test library script.

Arguments:
configFile             -- Full path to configure file to generate, e.g. `OpenModelicaLibraryTesting/configs/myConf.json`
modelicaFile           -- Path to Modelica library, e.g. `path/to/MyLibrary/package.mo`
packageName            -- Name of Modelica library, e.g. `MyLibrary`
refName                -- Reference name, (version, branch, ...), e.g. `main`
referenceFiles         -- Path to directory with reference files, empty sting if not available. E.g. `examples/ReferenceFiles`
referenceFileExtension -- File extension of reference files: `csv` or `mat`.
referenceFileDelimiter -- File delimiter of CSV files, e.g. `.`

Example call:
./scripts/genConfig.py "OpenModelicaLibraryTesting/configs/myConf.json" "examples/MyLibrary/package.mo" "MyLibrary" "main" "examples/ReferenceFiles" "csv" "."
"""


if len(sys.argv) != 8:
  raise Exception("Wrong number of input arguments.\nUsage:\n\tgenConfig.py configFile /path/to/package.mo packageName branchName referenceFiles referenceFileExtension referenceFileDelimiter")

configFile             = sys.argv[1]
modelicaFile           = sys.argv[2]
packageName            = sys.argv[3]
refName                = sys.argv[4]
referenceFiles         = sys.argv[5]
referenceFileExtension = sys.argv[6]
referenceFileDelimiter = sys.argv[7]

# If running inside a pull request
if refName.endswith('/merge'):
  refName = 'dev-pr-' + refName.replace('/merge', '')

refName.replace('/', '-')

with open(configFile, 'w') as f:
  content = (
    '[\n'
    '  {\n'
    f'    "library": "{packageName}",\n'
    f'    "libraryVersion": "{refName}",\n'
    '    "loadFileCommands": [\n'
    f'      "loadFile(\\\"{os.path.abspath(modelicaFile)}\\\")"\n'
    '    ],\n'
  )

  if referenceFiles:
    content += (
      f'    "referenceFileExtension": "{referenceFileExtension}",\n'
      f'    "referenceFileNameDelimiter": "{referenceFileDelimiter}",\n'
      f'    "referenceFiles": "{os.path.abspath(referenceFiles)}",\n'
    )

  content += (
    '    "optlevel": "-Os -march=native"\n'
    '  }\n'
    ']\n'
  )

  f.write(content)
