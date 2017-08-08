import path from 'path'
import fs from 'fs'
import base64 from 'base-64'
import fetch from 'node-fetch'
import matter from 'gray-matter'
import yargs from 'yargs'
import getParentPackage from 'parent-package-json'
import github from './github'

const parentPackage = getParentPackage()

const { argv } = yargs
  .option('token', {
    alias: 't'
  })
  .option('owner', {
    alias: 'o',
    default: 'WalltoWall'
  })
  .option('repo', {
    alias: 'r',
    default: parentPackage ? parentPackage.name : undefined
  })

github.authenticate({
  type: 'token',
  token: argv.token
})

const templatesDir = path.resolve(__dirname, '..', 'issues')
const templates = fs.readdirSync(templatesDir)
  .map(f => matter.read(path.join(templatesDir, f)))
  .reverse()

github.issues.getForRepo({
  owner: argv.owner,
  repo: argv.repo,
  page: 1,
  per_page: 100
}, (err, res) => {
  if (err) {
    console.error(err)
    return
  }

  const existingTitles = res.data.map(issue => issue.title)

  const filtered = templates.filter(template => (
    !existingTitles.includes(template.data.title)
  ))

  createAllIssues(filtered)
})

function createAllIssues (templates) {
  templates.forEach(template => {
    github.issues.create({
      owner: argv.owner,
      repo: argv.repo,
      title: template.data.title,
      body: template.content,
      labels: template.data.labels,
      assignees: template.data.assignees
    }, (err, res) => {
      if (err) {
        console.error(err)
        return
      }

      console.log(`Successfully created issue #${res.data.number}: ${template.data.title}`)
    })
  })
}

