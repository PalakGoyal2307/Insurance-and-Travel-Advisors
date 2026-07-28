import { body } from 'express-validator'

const phoneRegex = /^\+?\d{10,15}$/

export const registerValidator = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .matches(phoneRegex)
    .withMessage('Phone must be a valid number with 10 to 15 digits'),
  body('password')
    .isLength({ min: 8, max: 64 })
    .withMessage('Password must be between 8 and 64 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must include at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('Password must include at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must include at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('Password must include at least one special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Confirm password does not match password'),
]

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password is required'),
]

export const changePasswordValidator = [
  body('currentPassword').isString().isLength({ min: 1 }).withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8, max: 64 })
    .withMessage('New password must be between 8 and 64 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must include at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must include at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must include at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('New password must include at least one special character'),
  body('confirmNewPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Confirm new password does not match new password'),
]

export const forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Please provide a valid email address').normalizeEmail(),
]

export const resetPasswordValidator = [
  body('token').trim().isLength({ min: 20 }).withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8, max: 64 })
    .withMessage('New password must be between 8 and 64 characters')
    .matches(/[A-Z]/)
    .withMessage('New password must include at least one uppercase letter')
    .matches(/[a-z]/)
    .withMessage('New password must include at least one lowercase letter')
    .matches(/[0-9]/)
    .withMessage('New password must include at least one number')
    .matches(/[^A-Za-z0-9]/)
    .withMessage('New password must include at least one special character'),
  body('confirmNewPassword')
    .custom((value, { req }) => value === req.body.newPassword)
    .withMessage('Confirm new password does not match new password'),
]
