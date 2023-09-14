#!/usr/bin/python3

# Find Library_version.html 
# Collect HTML table
# Generate markdown table

import os
import pandas as pd
import sys
import tabulate

def getTestResults(htmlFile, testVerification):
  dfs = pd.read_html(htmlFile)
  overview = dfs[0]
  results = dfs[1]

  simSuccess = (overview["Total"][0] == overview["Simulation"][0])
  verificationSuccess = (overview["Total"][0] == overview["Verification"][0])

  # Write to output and summary
  out_str = (
    "## Summary\n"
    "\n"
    f"{overview.to_markdown()}\n"
    "## Results\n"
    f"{results.to_markdown()}\n"
  )

  summary_file = os.getenv('GITHUB_STEP_SUMMARY')
  with open(summary_file, "a") as f:
    f.write(out_str)

  if (simSuccess) and (not testVerification or verificationSuccess):
    return 0  # Success
  else:
    return 1  # Failure

if len(sys.argv) != 5:
  raise Exception("Wrong number of input arguments.\nUsage:\n\getTestResults.py /path/to/OpenModelicaLibraryTesting libName master")

name_of_script  = sys.argv[0]
directory       = sys.argv[1]
libName         = sys.argv[2]
libVersion      = sys.argv[3]
referenceFiles  = sys.argv[4]

htmlFile = os.path.join(directory, libName + "_" + libVersion + ".html")
exitCode = getTestResults(htmlFile, referenceFiles != "")
sys.exit(exitCode)
