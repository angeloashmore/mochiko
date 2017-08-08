import fs from 'fs'
import path from 'path'
import url from 'url'

const ROOT = '/'
const FILENAME = 'package.json'

// Find a file starting from the a base directory (__dirname by default) and
// working upward until found. If found, returns the full path to the file. If
// not found, return false. Provide a skip amount to skip a certain quantity of
// found files.
const findFileUpward = ({ file, basedir = __dirname, skip = 0 }) => {
  // Ensure we are just looking at a filename, not a whole path.
  const basename = path.basename(file)

  const recursiveFun = dir => {
    const resolved = path.resolve(dir)
    const files = fs.readdirSync(resolved)
    const oneUp = path.join(dir, '..')

    // Return the dir if it includes FILENAME.
    if (files.includes(basename)) {
      // Skip file if skip is still above 0.
      if (skip > 0) {
        skip--

        return recursiveFun(oneUp)
      }

      return path.join(dir, basename)
    }

    // Reached top directory, but didn't find any package.json. Cry.
    if (resolved === ROOT) {
      return false
    }

    // Try the function again, but one directory up.
    return recursiveFun(oneUp)
  }

  return recursiveFun(basedir)
}

// Returns the immediate parent's package.json data.
export const getParentPackage = (skip = 1) => {
  const file = findFileUpward({
    file: FILENAME,
    skip,
  })

  if (!file) return false

  const contents = fs.readFileSync(file, 'utf-8')

  return JSON.parse(contents)
}

// Get the repository owner and name from the provided package.
export const extractRepository = data => {
  const { pathname } = url.parse(data.repository.url)

  return {
    owner: pathname.split('/')[1],
    name: path.basename(pathname, '.git'),
  }
}
