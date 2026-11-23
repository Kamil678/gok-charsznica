import config from '@/payload.config'
import { getPayload, type Payload } from 'payload'
import { beforeAll, describe, expect, it } from 'vitest'

let payload: Payload

describe('Payload Local API (test database)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('connects to the test database, never the dev one', () => {
    expect(process.env.DATABASE_URL).toMatch(/\/gok_test$/)
  })

  it('finds users', async () => {
    const users = await payload.find({ collection: 'users' })
    expect(Array.isArray(users.docs)).toBe(true)
  })
})
