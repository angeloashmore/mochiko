# Mochiko

An automated GitHub issues generator for new projects.

This tool helps teams bootstrap new GitHub repositories by generating a
standard set of issues to track a project's progress.

The current set of issues is heavily influenced by the [Humaan Website
Checklist][0].

## Installation

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

## Usage

All calls to mochiko require a GitHub username and personal access token.

```sh
yarn mochiko -- -u <username> -t <personal_access_token>
```

**Note**: The following examples exclude the `-u` and `-t` parameters for
conciseness, *but they are required for all calls*.

### List all options

Use the `--help` flag to see all available options.

```sh
yarn mochiko -- --help
```

### Dry Runs

You may perform a "dry-run" to see what issues would be created without sending
any create issue requests.

```sh
yarn mochiko -- --dry-run
```

### Examples

- **Create all issues**

  ```sh
  yarn mochiko
  ```

- **Create specific issues**

  Provide a list of templates using `-f`:

  ```sh
  yarn mochiko -- -f 01-content
  ```

## Creating New Issues

**Note**: There is currently not a way to load custom issues. You can, however,
explicitly define which issues are loaded (see above for an example).

Issues are created using Markdown files with relevant frontmatter.

### Frontmatter Options:

| Key | Description |
| --- | --- |
| `title` | Title of the issue. |
| `labels` | Array of labels to add to the issue. |
| `assignees` | Array of assignee usernames. |
| `milestone` | Milestone number to associate |

A standard `mochiko` label is created during script execution. It is not added
to an issue by default, but including it is recommended.

[0]: https://humaan.com/checklist/
