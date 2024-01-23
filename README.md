# openmodelica-library-testing Action

[![Continuous Integration](https://github.com/AnHeuermann/openmodelica-library-testing-action/actions/workflows/ci.yml/badge.svg)][1]
![TS test coverage](badges/coverage.svg)

This GitHub action setups [OpenModelicaLibraryTesting][2]
scripts and run them on a provided Modelica package and returns a summary of the
test report.

The action will set output variables that can be checked how many tests passed
simulation and verification. It will fail if at least one test is failing.

## Inputs

### `library`

Name of Modelica package to test.

### `library-version`

Version of the Modelica package `library` as specified in version
annotation.

> [!NOTE]
> Wrap numbers in `'` to ensure parsing them as strings and not a number.
>
> ```yml
> library-version: '1.0'
> ```

### `modelica-file`

Relative path (from git repository root) to Modelica file containing package to
test.\
Default: `'package.mo'`

### `omc-version`

Version of OpenModelica used for testing.
Add [AnHeuermann/setup-openmodelica][3]
to your workflow to setup OpenModelica.\
Default: `'stable'`

### `reference-files-dir`

Relative path (from git repository root) to reference files to compare
simulation results to.\
Default: `''`

### `reference-files-extension`

File extension of result files.\
Allowed values: `'mat'`, `'csv'`\
Default: `'mat'`

### `reference-files-delimiter`

Character to separate model names in reference files.
E.g. for `Modelica.Blocks.Examples.PID_Controller.mat` it would be `'.'`\
Default: `'.'`

## Example usage

```yaml
jobs:
  library-testing:
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python 3
        uses: actions/setup-python@v5
        with:
          python-version: '3.10'

      - name: Setup OpenModelica
        uses: AnHeuermann/setup-openmodelica@v0.7
        with:
          version: stable
          packages: |
            omc
          libraries: |
            Modelica 4.0.0
          omc-diff: true

      - uses: openmodelica-library-testing@v0.2.0
        with:
          library: 'MyLibrary'
          library-version: '2.2.0'
          modelica-file: 'MyLibrary/package.mo'
          omc-version: 'stable'
          reference-files-dir: 'ReferenceFiles'
          reference-files-extension: 'mat'
          reference-files-delimiter: '.'
          pages-root-url: 'https://USERNAME.github.io/REPOSITORY/'
```

## Outputs

The action will fail if one test fails. In addition the following outputs can be
used to determine the testing results.

## `simulation-tests-passing`

`'True'` if all simulation tests are passing, `'False'` otherwise.

## `n-simulation-passing`

Number of successful simulation tests.

## `verification-tests-passing`

`'True'` if all verification tests are passing, `'False'` otherwise.

## `n-verification-passing`

Number of successful verification tests.

## Artifacts

### HTML Results

Download the `MyLibrary.html.zip` artifact, unzip it and start a HTML server to
display the results. This can be used to host results on a server or GitHub
pages.

```bash
unzip MyLibrary.html.zip -d html
python3 -m http.server -d html
```

#### GitHub Pages

It's possible to deploy the test results to GitHub pages. On option

```yml
# [...]
jobs:
  library-testing:
    # [...]

  deploy:
    needs: library-testing
    permissions:
      contents: write
    if: ${{ always() }}
    concurrency: ci-${{ github.ref }} # Recommended if you intend to make multiple deployments in quick succession.
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Get HTML artifact
        uses: actions/download-artifact@v4
        with:
          path: html/
          pattern: '*.html'
          merge-multiple: true

      - name: Deploy 🚀
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          folder: html/
          branch: gh-pages
```

### SQlite

For future test the SQlite data base `sqlite3.db` is achieved.

## Demo

This action tests Modelica library [MyLibrary](examples/MyLibrary/package.mo)
consisting of two models from the Modelica Standard Library and compares them to
reference results in [examples/ReferenceFiles](examples/ReferenceFiles) taken
from
[https://github.com/modelica/MAP-LIB_ReferenceResults][4].
The reference results for MyLibrary.Blocks.Examples.PID_Controller are altered
to check that verification will fail for variables `spring.w_rel`,
`spring.phi_rel`, `inertia1.w` and `inertia1.phi`.

The expected output is:

> ## GitHub Actions Test summary
>
> ### Summary
>
> |    |   Total |   Frontend |   Backend |   SimCode |   Templates |   Compilation |   Simulation |   Verification |
> |---:|--------:|-----------:|----------:|----------:|------------:|--------------:|-------------:|---------------:|
> |  0 |       2 |          2 |         2 |         2 |           2 |             2 |            2 |              1 |
>
> ### Results
>
> |    | Model                                                 | Verified          |   Simulate |   Total buildModel |   Parsing |   Frontend |   Backend |   SimCode |   Templates |   Compile |
> |---:|:------------------------------------------------------|:------------------|-----------:|-------------------:|----------:|-----------:|----------:|----------:|------------:|----------:|
> |  0 | MyLibrary.Blocks.Examples.PID_Controller (sim)        | 0.06 (4/7 failed) |       0.03 |               2.46 |      1.86 |       0.23 |      0.03 |      0.01 |        0.03 |      2.16 |
> |  1 | MyLibrary.Mechanics.MultiBody.Examples.Pendulum (sim) | 0.01 (3 verified) |       0.26 |               3.37 |      1.86 |       0.25 |      0.37 |      0.02 |        0.05 |      2.67 |

The HTML results can be hosted with GitHub Pages, for this example they can be
found at
[https://anheuermann.github.io/openmodelica-library-testing-action][5].

[1]: https://github.com/AnHeuermann/openmodelica-library-testing-action/actions/workflows/ci.yml
[2]: https://github.com/OpenModelica/OpenModelicaLibraryTesting
[3]: https://github.com/AnHeuermann/setup-openmodelica#available-openmodelica-versions
[4]: https://github.com/modelica/MAP-LIB_ReferenceResults/blob/v4.0.0
[5]: https://anheuermann.github.io/openmodelica-library-testing-action/
