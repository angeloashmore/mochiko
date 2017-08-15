# mochiko

An automated GitHub issues generator for new projects.

This tool helps teams bootstrap new GitHub repositories by generating a
standard set of issues to track a project's progress.

The current set of issues is heavily influenced by the [Humaan Website
Checklist][0].

## Installation

mochiko can be installed locally (preferred) or globally. The tool will look
for your project's `package.json` file to grab the repository URL, if
available.

### Local installation (preferred)

1. Add `mochiko` to your project's development dependencies.

   ```sh
   yarn add mochiko --dev
   ```

1. Add a script to your project's `package.json`.

   ```sh
   // package.json
   // ...

   "scripts": {
     // ...
     "mochiko": "mochiko",
     // ...
   },

   // ...
   ```

1. Use mochiko with `yarn run mochiko -- <options here>` in your project
   directory.

### Global installation

1. Add `mochiko` to your global packages.

   ```sh
   yarn global add mochiko
   ```

1. Use mochiko anywhere and provide the GitHut repository as an option.

   ```sh
   mochiko -u <username> -t <personal_access_token> -r <full_repository_name>
   ```

   Or use mochiko in your project directory.

1. Use mochiko with `mochiko -- <options here>` in your project directory.

## Usage

All calls to mochiko require a GitHub username and personal access token.

```sh
mochiko -u <username> -t <personal_access_token>
```

mochiko will try to get your GitHub repository name from your `package.json` if
provided. If it is not included in your `project.json`, include it as an
option.

```sh
mochiko -u <username> -t <personal_access_token> -r <full_repository_name>
```

**Note**: The following examples exclude the `-u` and `-t` parameters for
conciseness, *but they are required for all calls*.

### List all options

Use the `--help` flag to see all available options.

```sh
mochiko --help
```

### Dry runs

You may perform a "dry-run" to see what issues would be created without sending
any create issue requests.

```sh
mochiko --dry-run
```

### Examples

- **Create all issues**

  ```sh
  mochiko
  ```

- **Create specific issues**

  Provide a list of templates using `-f`:

  ```sh
  mochiko -f 01-content 03-social
  ```

## Creating new issues

**Note**: There is currently not a way to load custom issues. You can, however,
explicitly define which issues are loaded (see above for an example).

Issues are created using Markdown files with relevant frontmatter.

### Frontmatter options

| Key | Description |
| --- | --- |
| `title` | Title of the issue. |
| `labels` | Array of labels to add to the issue. |
| `assignees` | Array of assignee usernames. |
| `milestone` | Milestone number to associate with the issue. |

A standard `mochiko` label is created during script execution. It is not added
to an issue by default, but including it is recommended.

[0]: https://humaan.com/checklist/
