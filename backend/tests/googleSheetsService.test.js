import assert from 'node:assert/strict'
import test from 'node:test'
import { appendFormSubmission, setGoogleSheetsClientForTests } from '../src/services/googleSheetsService.js'

const createSheetsMock = ({ headers = [], existingRows = [] } = {}) => {
  const state = {
    headers: [...headers],
    rows: existingRows.map((row) => [...row]),
    updates: 0,
    clears: 0,
    appends: [],
  }

  const client = {
    spreadsheets: {
      get: async () => ({ data: { sheets: [{ properties: { title: 'Health Insurance' } }] } }),
      batchUpdate: async () => ({ data: {} }),
      values: {
        get: async () => ({ data: { values: state.headers.length ? [state.headers] : [] } }),
        clear: async () => { state.clears += 1 },
        update: async ({ requestBody }) => {
          state.updates += 1
          state.headers = [...requestBody.values[0]]
          return { data: {} }
        },
        append: async (request) => {
          state.appends.push(request)
          state.rows.push([...request.requestBody.values[0]])
          return { data: { updates: { updatedRows: 1 } } }
        },
      },
    },
  }

  return { client, state }
}

const columnName = (columnNumber) => {
  let number = columnNumber
  let name = ''
  while (number > 0) {
    number -= 1
    name = String.fromCharCode(65 + (number % 26)) + name
    number = Math.floor(number / 26)
  }
  return name
}

const applicationPayload = (userNumber, proposerCount) => ({
  fullName: `Head ${userNumber}`,
  email: `head${userNumber}@example.com`,
  phone: `98765432${String(userNumber).padStart(2, '0')}`,
  proposerType: 'self',
  primaryMember: { fullName: `Member ${userNumber}` },
  additionalProposers: Array.from({ length: proposerCount }, (_, index) => ({
    sequence: index + 1,
    fullName: `User ${userNumber} Proposer ${index + 1}`,
    email: `user${userNumber}.proposer${index + 1}@example.com`,
    phone: `900000${String(userNumber).padStart(2, '2')}${String(index + 1).padStart(2, '2')}`,
  })),
})

test('appends each submission while preserving the existing header columns and rows', async () => {
  const { client, state } = createSheetsMock({
    headers: ['Name', 'Email', 'Phone', 'Plan Name'],
    existingRows: [
      ['Earlier User 1', 'one@example.com', '9000000001', 'Plan A'],
      ['Earlier User 2', 'two@example.com', '9000000002', 'Plan A'],
      ['Earlier User 3', 'three@example.com', '9000000003', 'Plan A'],
      ['Earlier User 4', 'four@example.com', '9000000004', 'Plan A'],
      ['Latest Existing User', 'five@example.com', '9000000005', 'Plan B'],
    ],
  })
  setGoogleSheetsClientForTests(client)
  const originalRows = state.rows.map((row) => [...row])

  await Promise.all(Array.from({ length: 12 }, (_, index) =>
    appendFormSubmission({ formType: 'Health Application', payload: applicationPayload(index + 1, 0) })
  ))

  assert.deepEqual(state.rows.slice(0, originalRows.length), originalRows)
  assert.deepEqual(state.headers.slice(0, 4), ['Name', 'Email', 'Phone', 'Plan Name'])
  assert.equal(state.rows.length, originalRows.length + 12)
  assert.equal(state.clears, 0)
  assert.ok(state.updates >= 1)
  assert.equal(state.appends.length, 12)
  assert.ok(state.appends.every(({ insertDataOption }) => insertDataOption === 'INSERT_ROWS'))
  assert.ok(state.appends.every(({ range }) => range === `'Health Insurance'!A:${columnName(state.headers.length)}`))
})

test('stores all proposers for submissions with 2, 3, 5, and 8 proposers', async () => {
  const { client, state } = createSheetsMock()
  setGoogleSheetsClientForTests(client)
  const proposerCounts = [2, 3, 5, 8]

  await Promise.all(proposerCounts.map((count, index) =>
    appendFormSubmission({ formType: 'Life Application', payload: applicationPayload(index + 20, count) })
  ))

  assert.equal(state.rows.length, proposerCounts.length)
  const proposerColumn = state.headers.indexOf('Additional Proposers')
  assert.notEqual(proposerColumn, -1)

  const headNameColumn = state.headers.indexOf('Name')
  proposerCounts.forEach((count, rowIndex) => {
    const expectedHeadName = `Head ${rowIndex + 20}`
    const row = state.rows.find((candidate) => candidate[headNameColumn] === expectedHeadName)
    assert.ok(row, `expected an appended row for ${expectedHeadName}`)
    const stored = JSON.parse(row[proposerColumn])
    assert.equal(stored.length, count)
    assert.deepEqual(stored.map((proposer) => proposer.sequence), Array.from({ length: count }, (_, index) => index + 1))
    assert.ok(stored.every((proposer) => proposer.fullName.startsWith(`User ${rowIndex + 20} Proposer `)))
    assert.ok(stored.every((proposer) => proposer.email.includes(`user${rowIndex + 20}.`)))
  })
  assert.ok(state.appends.every(({ insertDataOption }) => insertDataOption === 'INSERT_ROWS'))
})

test('retains the primary proposer name along with the additional proposer list', async () => {
  const { client, state } = createSheetsMock()
  setGoogleSheetsClientForTests(client)
  const payload = applicationPayload(50, 2)
  payload.proposerType = 'others'
  payload.proposerSequence = 12
  payload.primaryMember.fullName = 'Primary Proposer Name'

  await appendFormSubmission({ formType: 'Health Application', payload })

  const row = state.rows[0]
  assert.equal(row[state.headers.indexOf('Proposer Type')], 'others')
  assert.equal(row[state.headers.indexOf('Proposer Sequence')], '12')
  assert.equal(row[state.headers.indexOf('Proposer Name')], 'Primary Proposer Name')
  assert.equal(JSON.parse(row[state.headers.indexOf('Additional Proposers')]).length, 2)
})
