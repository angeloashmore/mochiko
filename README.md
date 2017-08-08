# Mochiko

An automated GitHub issues generator for new projects.

## Installation

1. Add `mochiko` to your project's development dependencies via Yarn.

  ```sh
  $ yarn add walltowall/mochiko --dev
  ```

1. Add a script to your project's `package.json`.

   ```sh
   // package.json
   // ...

   "scripts": {
     // ...
     "mochiko:init": "mochiko init",
     // ...
   },

   // ...
   ```

1. Run the default mochiko script.

   ```sh
   $ yarn run mochiko:init
   ```
