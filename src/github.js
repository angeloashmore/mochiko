import fetch from 'node-fetch'
import { encode } from 'base-64'

export const createClient = ({ repo, token, user }) => async (
  partialEndpoint,
  options = {}
) => {
  const endpoint = `https://api.github.com/repos/${repo}/${partialEndpoint}`
  const headers = {
    Authorization: 'Basic ' + encode(`${user}:${token}`),
  }

  const response = await fetch(endpoint, { ...options, headers })

  if (response.status >= 400) {
    const error = await response.error()

    console.error(error)

    return error
  }

  const json = await response.json()

  return json
}

export const getAllIssues = client => client('issues')

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
