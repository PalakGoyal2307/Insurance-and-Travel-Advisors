import emailjs from '@emailjs/browser'

interface SendEmailWithAutoReplyParams {
  ownerEmail: string
  userEmail: string
  userName: string
  ownerSubject: string
  ownerMessage: string
  autoReplySubject: string
  autoReplyMessage: string
  ownerTemplateParams?: Record<string, string>
  autoReplyTemplateParams?: Record<string, string>
}

export function buildAutoReplyMessage(
  userName: string,
  submittedDetails: string
) {
  return [
    submittedDetails,
  ].join('\n')
}

export async function sendEmailWithAutoReply({
  ownerEmail,
  userEmail,
  userName,
  ownerSubject,
  ownerMessage,
  autoReplySubject,
  autoReplyMessage,
  ownerTemplateParams,
  autoReplyTemplateParams,
}: SendEmailWithAutoReplyParams) {
  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as
    | string
    | undefined

  const adminTemplateId = import.meta.env
    .VITE_EMAILJS_TEMPLATE_ID as string | undefined

  const autoReplyTemplateId = import.meta.env
    .VITE_EMAILJS_AUTOREPLY_TEMPLATE_ID as string | undefined

  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as
    | string
    | undefined

  if (
    !serviceId ||
    !adminTemplateId ||
    !autoReplyTemplateId ||
    !publicKey
  ) {
    console.error('EmailJS environment variables are missing.')
    return false
  }

  emailjs.init(publicKey)

  try {
    // ==========================
    // 1. Send email to Admin
    // ==========================
    await emailjs.send(serviceId, adminTemplateId, {
      from_name: userName,
      from_email: userEmail,
      to_email: ownerEmail,
      subject: ownerSubject,
      message: ownerMessage,
      ...ownerTemplateParams,
    })

    // ==========================
    // 2. Send Auto Reply to User
    // ==========================
    await emailjs.send(serviceId, autoReplyTemplateId, {
      from_name: userName,
      from_email: userEmail,
      subject: autoReplySubject,
      message: autoReplyMessage,
      ...autoReplyTemplateParams,
    })

    return true
  } catch (error) {
    console.error('EmailJS Error:', error)
    return false
  }
}