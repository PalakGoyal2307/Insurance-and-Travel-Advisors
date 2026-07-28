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

  // Fire-and-forget email sending so form submission is not blocked by network latency.
  void Promise.allSettled([
    emailjs.send(serviceId, adminTemplateId, {
      from_name: userName,
      from_email: userEmail,
      to_email: ownerEmail,
      subject: ownerSubject,
      message: ownerMessage,
      ...ownerTemplateParams,
    }),
    emailjs.send(serviceId, autoReplyTemplateId, {
      from_name: userName,
      from_email: userEmail,
      subject: autoReplySubject,
      message: autoReplyMessage,
      ...autoReplyTemplateParams,
    }),
  ]).then((results) => {
    const rejected = results.filter((result) => result.status === 'rejected')
    if (rejected.length > 0) {
      console.error('EmailJS background send failed for one or more messages', rejected)
    }
  })

  return true
}