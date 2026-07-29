import dotenv from 'dotenv'

dotenv.config()

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase())
}

const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET']

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  frontendUrl: process.env.FRONTEND_URL || 'https://pnpadvisors.co.in/',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtAccessExpires: process.env.JWT_ACCESS_EXPIRES || '1d',
  cookieName: process.env.COOKIE_NAME || 'pnp_access_token',
  cookieSecure: parseBoolean(process.env.COOKIE_SECURE, false),
  trustProxy: parseBoolean(process.env.TRUST_PROXY, false),
  googleDriveClientEmail: process.env.GOOGLE_DRIVE_CLIENT_EMAIL || '',
  googleDrivePrivateKey: process.env.GOOGLE_DRIVE_PRIVATE_KEY
    ? process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : '',
  googleDriveRootFolderId: process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || '',
  googleSheetsSpreadsheetId: process.env.GOOGLE_SHEETS_SPREADSHEET_ID || '',
  googleSheetsSheetName: process.env.GOOGLE_SHEETS_SHEET_NAME || 'Form Submissions',
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpSecure: parseBoolean(process.env.SMTP_SECURE, false),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFromEmail: process.env.SMTP_FROM_EMAIL || '',
  smtpFromName: process.env.SMTP_FROM_NAME || 'PNP Advisors',
  passwordResetTokenExpiresMinutes: Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MINUTES || 30),
}
