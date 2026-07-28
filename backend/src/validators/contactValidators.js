import { body } from 'express-validator'

const phoneRegex = /^\+?\d{10,15}$/

export const createContactValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .matches(phoneRegex)
    .withMessage('Phone must be a valid number with 10 to 15 digits'),
  body('message')
    .trim()
    .isLength({ min: 10, max: 4000 })
    .withMessage('Message must be between 10 and 4000 characters'),
  body('context')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Context must be between 2 and 120 characters'),
  body('source')
    .optional()
    .isIn(['website', 'google-form'])
    .withMessage('Source must be either website or google-form'),
]

export const updateContactStatusValidator = [
  body('status')
    .isIn(['new', 'in-progress', 'resolved'])
    .withMessage('Status must be one of: new, in-progress, resolved'),
]
