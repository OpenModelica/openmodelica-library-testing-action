#!/usr/bin/python3

import os
import shutil

libraryName = "MyLibrary"
branchLib = "main"
branchOM = "master"
targetDir = "/home/aheuermann/workspace/githubactions/openmodelica-library-testing-action/html"
omLibTestingDir = "/home/aheuermann/workspace/OM/OpenModelicaLibraryTesting"

libNameBranch = f"{libraryName}_{branchLib}"

# Copy logs and diffs
shutil.copytree(os.path.join(omLibTestingDir, "files"),
                os.path.join(targetDir, branchOM, libNameBranch, "files"),
                dirs_exist_ok = True)

# Copy general overview
shutil.copy2(os.path.join(omLibTestingDir, "overview.html"),
             os.path.join(targetDir, "index.html"))

# Copy library overview
shutil.copy2(os.path.join(omLibTestingDir, f"{libNameBranch}.html"),
             os.path.join(targetDir, branchOM, libNameBranch, f"{libNameBranch}.html"))

# Copy dygraph script
shutil.copy2(os.path.join(os.path.dirname(__file__), "dygraph-combined.js"),
             os.path.join(targetDir, branchOM, libNameBranch, "files", "dygraph-combined.js"))