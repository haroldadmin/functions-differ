# functions-differ

[![Build and test](https://github.com/haroldadmin/functions-differ/actions/workflows/build-test.yml/badge.svg)](https://github.com/haroldadmin/functions-differ/actions/workflows/build-test.yml)
[![npm](https://img.shields.io/npm/dm/functions-differ)](https://www.npmjs.com/package/functions-differ)
[![npm](https://img.shields.io/npm/v/functions-differ)](https://www.npmjs.com/package/functions-differ)

A tool to selectively deploy only the Firebase Functions that changed.

[functions-differ](https://www.npmjs.com/package/functions-differ) takes a list of Firebase Functions from your repository and returns a list of functions that changed since its last invocation.
This helps you selectively deploy only the functions that changed, thus saving time during re-deployments.

It detects any changes to a function by bundling it into a single minified file, and calculating a hash for it. This works for changes in the function's code, changes in its installed dependencies, or any other local imports.

## Usage

-   Create a `.differspec.json` file in the directory containing your Firebase Functions:

```shell
my-firebase-project
    ├── firebase.json
    ├── functions
        ├── src
        └── .differspec.json
```

-   Specify your function names and their paths in `.differspec.json`:

> This step is optional if you use the experimental `--discover` flag, which lets functions-differ discover the exported Cloud Functions from your project automatically.

```json
{
    "functions": {
        "login": "src/auth/login/function.ts",
        "register": "src/auth/login/function.ts"
    }
}
```

-   Run `functions-differ` in the directory containing `.differspec.json`

```shell
cd my-firebase-project/functions
functions-differ
```

-   `functions-differ` will then output a list of functions that need to be (re)deployed. This includes any functions that were changed or added since its last invocation.

```shell
> functions-differ
functions:login,functions:register
```

The default output is suitable for passing to `firebase deploy --only` command.

## Options

`functions-differ` supports the following options:

| Name          | Alias | Description                                                                                                                     | Default                                 |
| ------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| dir           | d     | The directory containing `.differspec.json` file                                                                                | (current working directory)             |
| write         | w     | Write output to `.differspec.json` file or not                                                                                  | true                                    |
| verbose       | v     | Output verbose logs                                                                                                             | false                                   |
| prefix        |       | Prefix for each function name output                                                                                            | `functions:`                            |
| sep           |       | Separator for each output function                                                                                              | `,`                                     |
| bundlerConfig |       | Path to the bundler config file which would be passed to esbuild                                                                |                                         |
| concurrency   |       | Number to control the concurrency of the bundling process. Useful in CI/CD flows with limited memory                            | Number of functions in .differspec.json |
| discover      |       | (**Experimental**) Flag indicating whether to use automatic function path discovery                                             | true                                    |
| no-discover   |       | (**Experimental**) Negates the `--discover` flag                                                                                |                                         |
| indexFilePath |       | (**Experimental**) Location of the index.ts file which exports all the functions. Optional. Only used if used with `--discover` | `src/index.ts`                          |

## .differspec.json

`.differspec.json` serves as persistent storage for `functions-differ`. It contains the following properties:

| Name        | Description                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `functions` | JSON object containing names of functions in the repository along with their paths                                            |

`.differdata.json` serves as persistent storage for `functions-differ`. It contains the following properties:

| Name        | Description                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `hashes`    | (**AUTOGENERATED, DO NOT MODIFY**) JSON object containing hashes of all functions in the `functions` property                 |
| `lastDiff`  | (**AUTOGENERATED, DO NOT MODIFY**) JSON object containing the results of the last successful invocation of `functions-differ` |

-   The `hashes` and `lastDiff` properties are autogenerated by `functions-differ`, and should not be created/edited manually.

## Contributions

Please discuss bugs, feature requests, and help in Github Issues. Pull requests are welcome, but please make sure to open an issue for your changes first.

## Installation

Install the package with `npm`:

`npm install -g functions-differ`

## Notes

### Automatic Functions Discovery (Experimental)

`functions-differ` has experimental support for discovering Cloud Functions exported from your project automatically. This lets you skip defining function paths in your `.differspec.json` file manually.

It does this by using the TypeScript AST on exports from your project's root `index.ts` file. It makes the following assumptions about your codebase:

1. The `src/index.ts` file must contain all exported Cloud Functions from your project, and no other exports.
2. Every Cloud Function is defined in a separate file. E.g.: `src/auth/login/index.ts`, `src/auth/register/index.ts`, etc.

If you use automatic functions discovery in your project, make sure the above assumptions hold true.

### Integration with CI/CD

I built `functions-differ` to help reduce the average deployment time of Cloud Functions in a project, but does not offer native support for CI builds.

Files generated during CI builds are usually ephemeral. They are lost once the CI build completes. If you plan to run `functions-differ` in your CI workflow, you need to backup the `.differspec.json` generated by the previous build, and restore it for the next built.

Here are some ways to do that for GitHub Actions:

1. Use [caching](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows) between CI runs for the `.differspec.json` file.
2. Read/store the contents of the `.differspec.json` file in GitHub secrets in each CI run using the `gh` CLI available to every job.

This tool uses ESBuild internally to bundle Cloud Functions in parallel. Bundling is a resource intensive process.
If your CI builds appear to crash or run very slowly after integrating functions-differ, it could be due to high memory usage by ESBuild. Consider using the `--concurrency` option to control how many Cloud Functions to bundle in parallel.
