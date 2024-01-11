#!/usr/bin/python3

# Find Library_version.html
# Collect HTML table
# Generate markdown table

import os
import pandas as pd
import sys

def createSummary(htmlFile, testVerification):
  """Create markdown summary from HTML file.

  Arguments:
  htmlFile         -- HTML file containing results for one library.
  testVerification -- Test if verification tests passed.
  """
  dfs = pd.read_html(htmlFile)
  overview = dfs[0]
  results = dfs[1]

  simSuccess = (overview["Total"][0] == overview["Simulation"][0])
  verificationSuccess = not testVerification or (testVerification and (overview["Total"][0] == overview["Verification"][0]))

  if (not simSuccess):
    print("::error::Some simulation tests failed")
  if (not verificationSuccess):
    print("::error::Some verification tests failed")

  pages_url = os.getenv("PAGES_URL")

  # Write to output and summary
  out_str = (
    "## Summary\n\n"
    f"{overview.to_markdown()}\n\n"
    "## Results\n\n"
    f"{results.to_markdown()}\n\n"
    f"## Detailed report\n\n{pages_url}.\n"
  )

  summary_file = os.getenv('GITHUB_STEP_SUMMARY')
  with open(summary_file, "a") as f:
    f.write(out_str)

  output_file = os.getenv('GITHUB_OUTPUT')
  with open(output_file, "a") as f:
    f.write(f"simulation-tests-passing={simSuccess}\n")
    f.write(f"n-simulation-passing={overview['Simulation'][0]}\n")
    f.write(f"verification-tests-passing={verificationSuccess}\n")
    f.write(f"n-verification-passing={overview['Verification'][0]}\n")

  return 0

if len(sys.argv) != 5:
  raise Exception("Wrong number of input arguments.\nUsage:\ncreateSummary.py /path/to/OpenModelicaLibraryTesting libName master")

directory       = sys.argv[1]
libName         = sys.argv[2]
libVersion      = sys.argv[3]
referenceFiles  = sys.argv[4]

# If running inside a pull request
if libVersion.endswith('/merge'):
  libVersion = 'dev-pr-' + libVersion.replace('/merge', '')

htmlFile = os.path.join(directory, libName + "_" + libVersion + ".html")
exitCode = createSummary(htmlFile, referenceFiles != "")
sys.exit(exitCode)
