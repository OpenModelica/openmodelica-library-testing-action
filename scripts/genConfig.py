#!/usr/bin/python3

import os
import sys

if len(sys.argv) != 7:
  raise Exception("Wrong number of input arguments.\nUsage:\n\tgenConfig.py configFile /path/to/package.mo packageName referenceFiles referenceFileExtension referenceFileDelimiter")

configFile             = sys.argv[1]
modelicaFile           = sys.argv[2]
packageName            = sys.argv[3]
referenceFiles         = sys.argv[4]
referenceFileExtension = sys.argv[5]
referenceFileDelimiter = sys.argv[6]

with open(configFile, 'w') as f:

  content = (
    '[\n'
    '  {\n'
    f'    "library": "{packageName}",\n'
    '    "libraryVersion": "master",\n'
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
