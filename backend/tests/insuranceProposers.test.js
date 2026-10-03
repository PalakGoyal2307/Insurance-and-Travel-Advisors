import assert from 'node:assert/strict'
import test from 'node:test'
import mongoose from 'mongoose'
import { validationResult } from 'express-validator'
import { HealthApplication } from '../src/models/HealthApplication.js'
import { LifeApplication } from '../src/models/LifeApplication.js'
import { createHealthApplicationValidator } from '../src/validators/applicationValidators.js'

const proposerList = (count) => Array.from({ length: count }, (_, index) => ({
  sequence: index + 1,
  fullName: `Additional Proposer ${index + 1}`,
  email: `proposer${index + 1}@example.com`,
  phone: `9876543${String(index).padStart(3, '0')}`,
}))

const validPrimaryMember = () => ({
  memberNumber: 1,
  fullName: 'Primary Member',
  address: '42 Example Road',
  pincode: '451442',
  heightFeet: 5,
  heightInch: 7,
  weightKg: 68,
  dob: new Date('1990-01-01'),
  age: 36,
  aadhaar: { mode: 'single', singleDocumentId: new mongoose.Types.ObjectId() },
  diseases: { mode: 'notApplicable', names: [] },
})

for (const [kind, Model] of [['health', HealthApplication], ['life', LifeApplication]]) {
  test(`${kind} applications validate and retain 2, 3, 5, and 8 associated proposers`, () => {
    for (const count of [2, 3, 5, 8]) {
      const application = new Model({
        userId: new mongoose.Types.ObjectId(),
        fullName: 'Head User',
        email: 'head@example.com',
        phone: '9876543210',
        proposerType: 'self',
        primaryMember: validPrimaryMember(),
        additionalProposers: proposerList(count),
      })

      const validationError = application.validateSync()
      assert.equal(validationError?.errors.additionalProposers, undefined, validationError?.message)
      assert.equal(application.additionalProposers.length, count)
      assert.ok(application.additionalProposers.every((proposer) => proposer.userId === undefined))
      assert.equal(application.userId.toString().length, 24)
    }
  })
}

test('health submission validator accepts an unbounded proposer list and rejects incomplete entries', async () => {
  const documentId = () => new mongoose.Types.ObjectId().toString()
  const dateOfBirth = new Date()
  dateOfBirth.setFullYear(dateOfBirth.getFullYear() - 30)
  const request = {
    body: {
      fullName: 'Head User',
      email: 'head@example.com',
      phone: '9876543210',
      proposerType: 'self',
      primaryMember: {
        fullName: 'Primary Member',
        address: '42 Example Road',
        pincode: '451442',
        heightFeet: 5,
        heightInch: 7,
        weightKg: 68,
        dob: dateOfBirth.toISOString(),
        age: 30,
        aadhaar: { mode: 'single', singleDocumentId: documentId() },
        diseases: { mode: 'notApplicable', names: [] },
        panCardDocumentId: documentId(),
        bankProofDocumentId: documentId(),
      },
      additionalProposers: proposerList(8),
    },
  }

  for (const validator of createHealthApplicationValidator) {
    await validator.run(request)
  }
  assert.deepEqual(validationResult(request).array(), [])

  request.body.additionalProposers[4].email = 'not-an-email'
  for (const validator of createHealthApplicationValidator) {
    await validator.run(request)
  }
  assert.ok(validationResult(request).array().some((error) => error.path === 'additionalProposers[4].email'))
})
