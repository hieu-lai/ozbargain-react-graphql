import 'cross-fetch/polyfill'
import prisma from '../src/prisma'
import seedDatabase, { userOne } from './utils/seedDatabase'
import getClient from './utils/getClient'
import { createUser, getUsers, login, getProfile } from './utils/operations'

const client = getClient()

beforeEach(seedDatabase, 35000)

test('Should create a new user', async () => {
  const variables = {
    data: {
      name: 'Mike',
      email: 'mike@example.com',
      password: 'password'
    }
  }

  const res = await client.mutate({
    mutation: createUser,
    variables
  }) 

  const userExists = await prisma.exists.User({ id: res.data.createUser.user.id })

  expect(userExists).toBe(true)
})

test('Should expose public author profiles', async () => {
  const res = await client.query({ query: getUsers })

  expect(res.data.users.length).toBe(2)
  expect(res.data.users[0].email).toBe(null)
  expect(res.data.users[0].name).toBe('Jen')
})

test('Should not login with bad credentials', async () => {
  const variables = {
    data: {
      email: 'jen@example.com',
      password: 'wdwwdwffeffe'
    }
  }
  
  await expect(client.mutate({ mutation: login, variables })).rejects.toThrow()
})

test('Should not create user with invalid password', async () => {
  const variables = {
    data: {
      name: 'Mike',
      email: 'mike@example.com',
      password: 'pass'
    }
  }

  await expect(client.mutate({ mutation: createUser, variables })).rejects.toThrow()
})

test('Should fetch user profile', async () => {
  const client = getClient(userOne.jwt)
  const { data } = await client.query({ query: getProfile })

  expect(data.me.id).toBe(userOne.user.id)
  expect(data.me.name).toBe(userOne.user.name)
})

test('Should not signup a user with email that is already in use', async () => {
  const variables = {
    data: {
      name: 'Jennifer',
      email: 'jen@example.com',
      password: 'sdjfb8c&^HJ'
    }
  }

  await expect(client.mutate({ mutation: createUser, variables })).rejects.toThrow()
})

test('Should login and provide authentication token', async () => {
  const variables = {
    data: {
      email: 'jen@example.com',
      password: 'QWASZX!1'
    }
  }

  const { data } = await client.mutate({ mutation: login, variables })

  expect(data.login.token.split('.')[0]).toBe(userOne.jwt.split('.')[0])
})

test('Should reject me query without authentication', async () => {
  await expect(client.query({ query: getProfile })).rejects.toThrow()
})

test('Should hide emails when fetching list of users', async () => {
  const client = getClient(userOne.jwt)
  const { data } = await client.query({ query: getUsers })

  expect(data.users[0].email).toBe('jen@example.com')
  expect(data.users[1].email).toBe(null)
})