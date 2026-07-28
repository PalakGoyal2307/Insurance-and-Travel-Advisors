import { body } from 'express-validator'

const phoneRegex = /^\+?\d{10,15}$/

export const updateProfileValidator = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim()
    .matches(phoneRegex)
    .withMessage('Phone must be a valid number with 10 to 15 digits'),
]
