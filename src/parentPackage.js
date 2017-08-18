import fs from 'fs'
import path from 'path'
import url from 'url'
import sshurl from 'ssh-url'

const ROOT = '/'
const FILENAME = 'package.json'

// Find a file starting from the a base directory and working upward until
// found. If found, returns the full path to the file.  If not found, return
// false. Provide a skip amount to skip a certain quantity of found files.
const findFileUpward = ({
  dir,
  endDir = ROOT,
  file,
  skip = 0,
}) => {
  const resolvedDir = path.resolve(dir)

  // If dir is not a subdirectory of endDir, return false.
  if (path.relative(endDir, resolvedDir).startsWith('..')) return false

  // Ensure we are just looking for a filename, not a whole path.
  const basename = path.basename(file)
  const files = fs.readdirSync(resolvedDir)

  if (files.includes(basename) && skip > 0) {
    if (skip > 0) {
      skip--
    } else {
      return path.join(resolvedDir, basename)
    }
  }

  return findFileUpward({
    dir: path.join(resolvedDir, '..'),
    endDir,
    file: basename,
    skip,
  })
}

// Returns the immediate parent's package.json data.
export const getParentPackage = () => {
  const file = findFileUpward({
    dir: __dirname,
    file: FILENAME,
    skip: 1,
  })

  try {
    return require(file)
  } catch (e) {
    return false
  }
}

// Get the repository owner and name from the provided package.
export const extractRepository = data => {
  if (!data.repository || !data.repository.url) return false

  let parsed = url.parse(data.repository.url)

  // Dumb check to determine if URL is SSH or HTTP.
  if (parsed.host === null) {
    parsed = sshurl.parse(data.repository.url)
  }

  return {
    owner: parsed.pathname.split('/')[1],
    name: path.basename(parsed.pathname, '.git'),
  }
}
