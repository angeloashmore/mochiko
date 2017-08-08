import fetch from 'node-fetch'
import { encode } from 'base-64'

export const createClient = ({ repo, token, user }) => (
  partialEndpoint,
  providedOptions = {}
) => {
  const endpoint = `https://api.github.com/repos/${repo}/${partialEndpoint}`
  const headers = {
    Authorization: 'Basic ' + encode(`${user}:${token}`),
  }
  const options = {
    method: 'GET',
    ...providedOptions,
  }

  return fetch(endpoint, { ...options, headers }).then(response => {
    if (response.status >= 400) {
      throw new Error(`${options.method} <${endpoint}>: ${response.statusText}`)
    }

    return response.json()
  })
}

export const getAllIssues = async (client, aggregated = [], page = 1) => {
  if (!aggregated.length) {
    console.log(`starting to fetch existing issues`)
  }

  console.time(`fetched issues`)
  const issues = await client(`issues?page=${page}`)

  if (!issues.length) {
    console.timeEnd(`fetched issues`)
    return aggregated
  }

  aggregated = aggregated.concat(issues)

  return await getAllIssues(client, aggregated, page + 1)
}

export const createIssue = client => async template => {
  const body = JSON.stringify({
    ...template.data,
    body: template.content,
  })

  return await client('issues', {
    method: 'POST',
    body,
  })
}

export const createLabel = client => async label => {
  const body = JSON.stringify(label)

  return await client('labels', {
    method: 'POST',
    body,
  })
}
