#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import colors from 'colors/safe'
import matter from 'gray-matter'
import yargs from 'yargs'
import { createClient, createIssue, createLabel, getAllIssues } from './github'

// Location of templates directory.
const TEMPLATES_DIR = path.resolve(__dirname, '..', 'issues')

// Default GitHub repository owner. Only used when a parent package.json is
// detected.
const DEFAULT_OWNER = 'WalltoWall'

// Status strings for CLI output.
const STATUS = {
  FAILURE: colors.red('failure'),
  SUCCESS: colors.green('success'),
  WARNING: colors.yellow('warning'),
}

// Label used to identify mochiko-created tasks.
const LABEL = {
  name: 'mochiko',
  color: '9842f4', // purple
}

// Setup CLI arguments.
const { argv } = yargs
  .option('user', {
    alias: 'u',
    describe: 'Username',
    demandOption: true,
  })
  .option('token', {
    alias: 't',
    describe: 'Personal access token',
    demandOption: true,
  })
  .option('repo', {
    alias: 'r',
    describe: 'Full repository name (e.g. WalltoWall/mochiko)',
    demandOption: true,
  })
  .option('force', {
    describe: 'Ignore existing issues',
    default: false,
  })
  .help()

// Create a GitHub v3 API client.
const client = createClient({
  repo: argv.repo,
  token: argv.token,
  user: argv.user,
})

// Get all templates and read contents.
const templates = fs
  .readdirSync(TEMPLATES_DIR)
  .map(name => path.join(TEMPLATES_DIR, name))
  .map(file => ({ ...matter.read(file), file }))

// Factory to create issue existance checker. Simple algorithm checks if an
// issue, open or closed, with the same title as the template already exists.
// Algorithm can be improved if issues (*crickets*) occur.
const findExistingIssueFactory = allExisting => template =>
  allExisting.find(issue => issue.title === template.data.title)

// Creates a formatted string to display information about a template.
const formatMessage = ({ status, template, message }) => {
  const basename = path.basename(template.file)
  return `${STATUS[status.toUpperCase()]} [${basename}] ${message}`
}

// Create the standard mochiko label. Ignore errors.
createLabel(client)(LABEL).catch(() => {})

// Do the thing, where the thing is create GitHub issues.
getAllIssues(client)
  .then(allIssues => {
    const findExistingIssue = findExistingIssueFactory(allIssues)

    templates.forEach(template => {
      if (!argv.force) {
        const existing = findExistingIssue(template)

        if (existing) {
          console.log(
            formatMessage({
              status: 'warning',
              template,
              message: `Issue exists at #${existing.number}. Use --force to create.`,
            })
          )
          return
        }
      }

      createIssue(client)(template)
        .then(created => {
          console.log(
            formatMessage({
              status: 'success',
              template,
              message: `Issue created at #${created.number}.`,
            })
          )
        })
        .catch(error => {
          console.error(
            formatMessage({
              status: 'failure',
              template,
              message: `Unable to create issue\n  ${error}`,
            })
          )
        })
    })
  })
  .catch(console.error)
