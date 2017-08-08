#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import colors from 'colors/safe'
import matter from 'gray-matter'
import yargs from 'yargs'
import { getParentPackage, extractRepository } from './parentPackage'
import { createClient, createIssue, createLabel, getAllIssues } from './github'

// Location of templates directory.
const TEMPLATES_DIR = path.resolve(__dirname, '..', 'issues')

// Extension for template files.
const TEMPLATES_EXTENSION = '.md'

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

// Creates a formatted string to display information.
const formatMessage = ({ status, tag, message }) =>
  [status && STATUS[status.toUpperCase()], tag && `[${tag}]`, message]
    .filter(Boolean)
    .join(' ')

// Get the parent package's data.
const parentPackage = getParentPackage()
const repo = parentPackage ? extractRepository(parentPackage) : false

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
    default: repo ? `${repo.owner}/${repo.name}` : undefined,
  })
  .option('templates', {
    alias: 'f',
    describe: 'List of templates to use',
    type: 'array',
  })
  .option('force', {
    describe: 'Ignore existing issues',
    default: false,
  })
  .option('dry-run', {
    alias: 'n',
    describe: "Don't create issues, but show what would have been created",
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
const templates = (argv.templates
  ? argv.templates.map(name => `${name}.md`)
  : fs.readdirSync(TEMPLATES_DIR))
  .map(name => path.join(TEMPLATES_DIR, name))
  .map(file => ({ ...matter.read(file), file }))

// Factory to create issue existance checker. Simple algorithm checks if an
// issue, open or closed, with the same title as the template already exists.
// Algorithm can be improved if issues (*crickets*) occur.
const findExistingIssueFactory = allExisting => template =>
  allExisting.find(issue => issue.title === template.data.title)

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
              tag: path.basename(template.file),
              message: `Issue exists at #${existing.number}. Use --force to create.`,
            })
          )
          return
        }
      }

      if (argv.dryRun) {
        console.log(
          formatMessage({
            status: 'success',
            tag: path.basename(template.file),
            message: `Issue created at #<dry-run>.`,
          })
        )
      } else {
        createIssue(client)(template)
          .then(created => {
            console.log(
              formatMessage({
                status: 'success',
                tag: path.basename(template.file),
                message: `Issue created at #${created.number}.`,
              })
            )
          })
          .catch(error => {
            console.error(
              formatMessage({
                status: 'failure',
                tag: path.basename(template.file),
                message: `Unable to create issue\n  ${error}`,
              })
            )
          })
      }
    })
  })
  .catch(error => {
    console.error(
      formatMessage({
        status: 'failure',
        message: error,
      })
    )
  })
