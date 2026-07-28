import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

let cachedTransporter = null

const getTransporter = () => {
  if (cachedTransporter) return cachedTransporter

  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFromEmail) {
    return null
  }

  cachedTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  })

  return cachedTransporter
}

export const sendPasswordResetEmail = async ({ toEmail, fullName, resetUrl }) => {
  const transporter = getTransporter()
  if (!transporter) {
    throw new Error('SMTP is not configured on the server')
  }

  const safeName = fullName || 'Customer'
  const subject = 'Reset your PNP Advisors account password'
  const text = [
    `Hello ${safeName},`,
    '',
    'We received a request to reset your password.',
    `Use this link to set a new password: ${resetUrl}`,
    '',
    `This link will expire in ${env.passwordResetTokenExpiresMinutes} minutes.`,
    'If you did not request this, please ignore this email.',
    '',
    'Regards,',
    'PNP Advisors Team',
  ].join('\n')

  await transporter.sendMail({
    from: `${env.smtpFromName} <${env.smtpFromEmail}>`,
    to: toEmail,
    subject,
    text,
  })
}
