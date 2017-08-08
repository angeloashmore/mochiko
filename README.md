# Mochiko

An automated GitHub issues generator for new projects.

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

1. Run the mochiko script.

   ```sh
   yarn run mochiko -- -u <github_username> -t <github_access_token>
   ```
