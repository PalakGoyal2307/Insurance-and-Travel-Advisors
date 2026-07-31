import { useEffect, useMemo, useState } from 'react'
import type { PageId } from '../App'
import { buildAutoReplyMessage, sendEmailWithAutoReply } from '../formEmail.ts'
import { CONTACT_EMAIL } from '../constants/contact'
import type { AuthUser } from '../utils/authApi'

interface Props {
  navigate: (p: PageId) => void
  currentUser: AuthUser | null
  authReady: boolean
}

interface TravelFormState {
  fullName: string
  phone: string
  email: string
  companyName: string
  contactPerson: string
  city: string
  destination: string
  travelers: string
  travelMonth: string
  budget: string
  requirements: string
}

interface FormConfig {
  title: string
  subtitle: string
  submitLabel: string
  context: string
  inquiryType: string
  defaultPackage: string
  category: 'corporate' | 'general'
}

const FORM_CONFIGS: Record<string, FormConfig> = {
  'intl-enquire-now': {
    title: 'International Tour Enquiry',
    subtitle: 'Share your plan and our travel experts will get back to you quickly.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:intl-enquire-now',
    inquiryType: 'International Tours Enquire Now',
    defaultPackage: 'General International Tours',
    category: 'general',
  },
  'intl-quote': {
    title: 'International Tour Quote',
    subtitle: 'Get a tailored quote for your selected destination or package.',
    submitLabel: 'Submit Quote Request',
    context: 'travel:page:intl-quote',
    inquiryType: 'International Tours Quote Request',
    defaultPackage: 'General International Tours',
    category: 'general',
  },
  'intl-custom-package': {
    title: 'Custom International Package',
    subtitle: 'Tell us your dream itinerary and we will craft it for you.',
    submitLabel: 'Submit Custom Package Request',
    context: 'travel:page:intl-custom-package',
    inquiryType: 'International Tours Custom Package Request',
    defaultPackage: 'Custom International Package',
    category: 'general',
  },
  'dom-enquire-now': {
    title: 'Domestic Tour Enquiry',
    subtitle: 'Tell us where in India you want to travel and we will assist.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:dom-enquire-now',
    inquiryType: 'Domestic Tours Enquire Now',
    defaultPackage: 'General Domestic Tours',
    category: 'general',
  },
  'dom-quote': {
    title: 'Domestic Tour Quote',
    subtitle: 'Get an exact quote for your chosen domestic destination.',
    submitLabel: 'Submit Quote Request',
    context: 'travel:page:dom-quote',
    inquiryType: 'Domestic Tours Quote Request',
    defaultPackage: 'General Domestic Tours',
    category: 'general',
  },
  'dom-custom-package': {
    title: 'Custom Domestic Itinerary',
    subtitle: 'Need a custom India itinerary? Share your requirements here.',
    submitLabel: 'Submit Custom Itinerary Request',
    context: 'travel:page:dom-custom-package',
    inquiryType: 'Domestic Tours Custom Itinerary Request',
    defaultPackage: 'Custom Domestic Itinerary',
    category: 'general',
  },
  'hotel-enquire-now': {
    title: 'Hotel Reservation Enquiry',
    subtitle: 'Share your stay requirements for curated accommodation options.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:hotel-enquire-now',
    inquiryType: 'Hotel & Villa Enquire Now',
    defaultPackage: 'General Hotel & Villa Reservations',
    category: 'general',
  },
  'hotel-availability': {
    title: 'Check Hotel Availability',
    subtitle: 'We will confirm room availability and best pricing for you.',
    submitLabel: 'Submit Availability Request',
    context: 'travel:page:hotel-availability',
    inquiryType: 'Hotel & Villa Availability Request',
    defaultPackage: 'General Hotel & Villa Reservations',
    category: 'general',
  },
  'hotel-perfect-stay': {
    title: 'Find My Perfect Stay',
    subtitle: 'Tell us your budget and style, and we will shortlist stays.',
    submitLabel: 'Submit Stay Request',
    context: 'travel:page:hotel-perfect-stay',
    inquiryType: 'Hotel & Villa Perfect Stay Request',
    defaultPackage: 'Perfect Stay Assistance',
    category: 'general',
  },
  'honeymoon-enquire-now': {
    title: 'Honeymoon Enquiry',
    subtitle: 'Plan your romantic getaway with personalized curation.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:honeymoon-enquire-now',
    inquiryType: 'Honeymoon Enquire Now',
    defaultPackage: 'Honeymoon Packages',
    category: 'general',
  },
  'honeymoon-book-package': {
    title: 'Book Honeymoon Package',
    subtitle: 'Share your dates and preferences to reserve your package.',
    submitLabel: 'Submit Romantic Package Request',
    context: 'travel:page:honeymoon-book-package',
    inquiryType: 'Honeymoon Romantic Package Request',
    defaultPackage: 'Romantic Honeymoon Package',
    category: 'general',
  },
  'flights-enquire-now': {
    title: 'Transport Enquiry',
    subtitle: 'Need help with flights, trains, or buses? We can handle it.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:flights-enquire-now',
    inquiryType: 'Flight / Train / Bus Enquire Now',
    defaultPackage: 'Flight / Train / Bus Ticket Booking',
    category: 'general',
  },
  'flights-book': {
    title: 'Transport Booking Request',
    subtitle: 'Submit your travel leg and we will assist with ticket booking.',
    submitLabel: 'Submit Booking Request',
    context: 'travel:page:flights-book',
    inquiryType: 'Flight / Train / Bus Booking Request',
    defaultPackage: 'Transport Booking Request',
    category: 'general',
  },
  'cab-enquire-now': {
    title: 'Private Cab Enquiry',
    subtitle: 'Share pickup/drop details and we will arrange the right cab.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:cab-enquire-now',
    inquiryType: 'Private Cab Enquiry',
    defaultPackage: 'Private Cab Booking',
    category: 'general',
  },
  'cab-book': {
    title: 'Private Cab Booking',
    subtitle: 'Submit your route and schedule for confirmed cab booking support.',
    submitLabel: 'Submit Cab Request',
    context: 'travel:page:cab-book',
    inquiryType: 'Private Cab Booking',
    defaultPackage: 'Private Cab Booking',
    category: 'general',
  },
  'cab-custom': {
    title: 'Custom Cab Plan',
    subtitle: 'Need multi-leg or hourly routing? Tell us and we will tailor it.',
    submitLabel: 'Submit Cab Request',
    context: 'travel:page:cab-custom',
    inquiryType: 'Private Cab Custom Plan',
    defaultPackage: 'Custom Private Cab Booking',
    category: 'general',
  },
  'religious-enquire-now': {
    title: 'Religious Trip Enquiry',
    subtitle: 'Plan your pilgrimage with comfort and trusted support.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:religious-enquire-now',
    inquiryType: 'Religious & Spiritual Trips Enquiry',
    defaultPackage: 'Religious & Spiritual Trips',
    category: 'general',
  },
  'corporate-enquire-now': {
    title: 'Corporate Trip Enquiry',
    subtitle: 'Share company details and our team will design a proposal.',
    submitLabel: 'Submit Corporate Request',
    context: 'travel:page:corporate-enquire-now',
    inquiryType: 'Corporate Trip Enquiry',
    defaultPackage: 'Corporate Trip',
    category: 'corporate',
  },
  'travel-overview-intl-enquire': {
    title: 'International Travel Enquiry',
    subtitle: 'Quick enquiry from travel overview for international tours.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:overview-intl-enquire',
    inquiryType: 'Travel International Enquire Now',
    defaultPackage: 'International Tours - Travel',
    category: 'general',
  },
  'travel-overview-dom-enquire': {
    title: 'Domestic Travel Enquiry',
    subtitle: 'Quick enquiry from travel overview for domestic tours.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:overview-dom-enquire',
    inquiryType: 'Travel Domestic Enquire Now',
    defaultPackage: 'Domestic Tours - Travel',
    category: 'general',
  },
  'travel-overview-hotel-enquire': {
    title: 'Hotel & Villa Enquiry',
    subtitle: 'Quick enquiry from travel overview for stays and villas.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:overview-hotel-enquire',
    inquiryType: 'Travel Hotel & Villa Enquire Now',
    defaultPackage: 'Hotel & Villa - Travel',
    category: 'general',
  },
  'travel-overview-honeymoon-enquire': {
    title: 'Honeymoon Travel Enquiry',
    subtitle: 'Quick enquiry from travel overview for honeymoon trips.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:overview-honeymoon-enquire',
    inquiryType: 'Travel Honeymoon Enquire Now',
    defaultPackage: 'Honeymoon Packages - Travel',
    category: 'general',
  },
  'travel-overview-flights-enquire': {
    title: 'Ticket Booking Enquiry',
    subtitle: 'Quick enquiry from travel overview for flights/trains/buses.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:overview-flights-enquire',
    inquiryType: 'Travel Flight / Train / Bus Enquire Now',
    defaultPackage: 'Flight / Train / Bus - Travel',
    category: 'general',
  },
  'travel-overview-cab-enquire': {
    title: 'Cab Booking Enquiry',
    subtitle: 'Quick enquiry from travel overview for private cab booking.',
    submitLabel: 'Submit Enquiry',
    context: 'travel:page:overview-cab-enquire',
    inquiryType: 'Private Cab Booking',
    defaultPackage: 'Private Cab Booking',
    category: 'general',
  },
  'trip-enquiry': {
    title: 'Religious Place Enquiry',
    subtitle: 'Choose a place and we will help plan your pilgrimage.',
    submitLabel: 'Submit Place Enquiry',
    context: 'religious:page:trip-enquiry',
    inquiryType: 'Religious Place Enquiry',
    defaultPackage: 'General Pilgrimage Planning',
    category: 'general',
  },
  'plan-pilgrimage': {
    title: 'Plan My Pilgrimage',
    subtitle: 'Share your pilgrimage preferences and receive guidance.',
    submitLabel: 'Submit Pilgrimage Plan',
    context: 'religious:page:plan-pilgrimage',
    inquiryType: 'Pilgrimage Planning Request',
    defaultPackage: 'General Pilgrimage Plan',
    category: 'general',
  },
  'plan-trip': {
    title: 'Plan Corporate Trips',
    subtitle: 'Tell us your team objective and destination preferences.',
    submitLabel: 'Submit Trip Plan Request',
    context: 'corporate:page:plan-trip',
    inquiryType: 'Corporate Trip Planning',
    defaultPackage: 'General Corporate Service',
    category: 'corporate',
  },
  'get-quote': {
    title: 'Corporate Service Quote',
    subtitle: 'Get a quote for the selected corporate service package.',
    submitLabel: 'Submit Quote Request',
    context: 'corporate:page:get-quote',
    inquiryType: 'Corporate Service Quote',
    defaultPackage: 'General Corporate Service',
    category: 'corporate',
  },
  proposal: {
    title: 'Corporate Proposal Request',
    subtitle: 'Request a complete corporate itinerary proposal.',
    submitLabel: 'Submit Proposal Request',
    context: 'corporate:page:proposal',
    inquiryType: 'Corporate Proposal Request',
    defaultPackage: 'General Corporate Service',
    category: 'corporate',
  },
}

function getBackPage(action: string): PageId {
  if (action.startsWith('intl') || action.startsWith('dom')) return 'travel-international'
  if (action.startsWith('hotel')) return 'travel-hotels'
  if (action.startsWith('honeymoon')) return 'travel-honeymoon'
  if (action.startsWith('flights')) return 'travel-flights'
  if (action.startsWith('cab')) return 'travel-cab'
  if (action.startsWith('travel-overview')) return 'travel'
  if (action.startsWith('trip-') || action.startsWith('plan-pilgrimage')) return 'religious'
  if (action.startsWith('plan-trip') || action.startsWith('get-quote') || action.startsWith('proposal')) return 'corporate'
  if (action.startsWith('religious')) return 'religious'
  if (action.startsWith('corporate')) return 'corporate'
  return 'travel'
}

export default function TravelFormPage({ navigate, currentUser, authReady }: Props) {
  const returnTo = useMemo(() => window.location.pathname + window.location.search, [])
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSent, setFormSent] = useState(false)
  const [form, setForm] = useState<TravelFormState>({
    fullName: currentUser?.fullName || '',
    phone: currentUser?.phone || '',
    email: currentUser?.email || '',
    companyName: '',
    contactPerson: '',
    city: '',
    destination: '',
    travelers: '',
    travelMonth: '',
    budget: '',
    requirements: '',
  })

  useEffect(() => {
    if (!currentUser) return

    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || currentUser.fullName,
      phone: prev.phone || currentUser.phone,
      email: prev.email || currentUser.email,
      contactPerson: prev.contactPerson || currentUser.fullName,
    }))
  }, [authReady, currentUser, navigate])

  const { action, packageName, backPage, config } = useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const rawAction = params.get('action') || 'intl-enquire-now'
    const rawPackage = params.get('pkg') || ''
    const normalizedAction = FORM_CONFIGS[rawAction] ? rawAction : 'intl-enquire-now'
    const resolvedConfig = FORM_CONFIGS[normalizedAction]
    return {
      action: normalizedAction,
      packageName: rawPackage,
      backPage: getBackPage(normalizedAction),
      config: resolvedConfig,
    }
  }, [window.location.search])

  const selectedPackage = packageName || config.defaultPackage

  const updateForm = (field: keyof TravelFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    const fullName = form.fullName.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const companyName = form.companyName.trim()
    const contactPerson = form.contactPerson.trim()
    const city = form.city.trim()
    const destination = form.destination.trim()
    const travelers = form.travelers.trim()
    const travelMonth = form.travelMonth.trim()
    const budget = form.budget.trim()
    const requirements = form.requirements.trim()

    if (config.category === 'corporate') {
      if (!companyName || !contactPerson || !phone || !email) {
        setFormError('Please fill all required fields.')
        return
      }
    } else if (!fullName || !phone || !email) {
      setFormError('Please fill all required fields.')
      return
    }

    if (!/^\+?\d{10,15}$/.test(phone.replace(/\s+/g, ''))) {
      setFormError('Please enter a valid phone number with 10 to 15 digits.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFormError('Please enter a valid email address.')
      return
    }

    setFormError('')
    setIsSubmitting(true)

    const subjectName = config.category === 'corporate' ? (contactPerson || companyName || fullName) : fullName
    const subject = `[${config.inquiryType}] ${subjectName} - ${selectedPackage}`
    const fullMessage = [
      `Inquiry Type: ${config.inquiryType}`,
      `Selected Package: ${selectedPackage}`,
      config.category === 'corporate' ? `Company Name: ${companyName || 'N/A'}` : '',
      config.category === 'corporate' ? `Contact Person: ${contactPerson || 'N/A'}` : '',
      `Departure City: ${city || 'N/A'}`,
      `Destination: ${destination || 'N/A'}`,
      `No. of Travelers: ${travelers || 'N/A'}`,
      `Preferred Travel Month/Dates: ${travelMonth || 'N/A'}`,
      `Estimated Budget: ${budget || 'N/A'}`,
      `Additional Requirements: ${requirements || 'N/A'}`,
    ]
      .filter(Boolean)
      .join('\n')

    try {
      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: subjectName,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: config.category === 'corporate' ? 'Thank you for your corporate trip enquiry - PNP Advisors' : 'Thank you for your travel enquiry - PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(subjectName, fullMessage),
        ownerTemplateParams: {
          phone,
          context: config.context,
          inquiry_type: config.inquiryType,
          selected_package: selectedPackage,
          service_category: action,
          departure_city: city || 'N/A',
          destination: destination || 'N/A',
          travelers: travelers || 'N/A',
          travel_month: travelMonth || 'N/A',
          budget: budget || 'N/A',
          requirements: requirements || 'N/A',
          company_name: companyName || 'N/A',
          contact_person: contactPerson || 'N/A',
        },
        autoReplyTemplateParams: {
          phone,
          context: config.context,
          inquiry_type: config.inquiryType,
          selected_package: selectedPackage,
          destination: destination || 'N/A',
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setFormSent(true)
      setForm({
        fullName: currentUser?.fullName || '',
        phone: currentUser?.phone || '',
        email: currentUser?.email || '',
        companyName: '',
        contactPerson: currentUser?.fullName || '',
        city: '',
        destination: '',
        travelers: '',
        travelMonth: '',
        budget: '',
        requirements: '',
      })
      setTimeout(() => {
        navigate(backPage)
      }, 1200)
    } catch (error) {
      console.error('Travel query send failed', error)
      window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      navigate(backPage)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-20 pb-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(backPage)} className="flex items-center gap-2 text-[#0D2B5E] font-bold text-sm hover:text-[#F47B20] transition-colors mb-6">
          ← Back
        </button>

        <div className="bg-white rounded-3xl border border-blue-100 shadow-xl overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-blue-100 bg-gradient-to-r from-[#0D2B5E] to-[#1a4a9e] text-white">
            <h1 className="font-display text-3xl font-bold">{config.title}</h1>
            <p className="text-white/80 text-sm mt-2">{config.subtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
            {formSent && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Request sent successfully.</div>}
            {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#0D2B5E]">
              Selected Package: <span className="font-bold">{selectedPackage}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {config.category === 'corporate' ? (
                <>
                  <input value={form.companyName} onChange={(e) => updateForm('companyName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Company Name*" required />
                  <input value={form.contactPerson} onChange={(e) => updateForm('contactPerson', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Contact Person*" required />
                </>
              ) : (
                <input value={form.fullName} onChange={(e) => updateForm('fullName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm sm:col-span-2" placeholder="Full Name*" required />
              )}

              <input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Phone Number*" required />
              <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Email*" required />
              <input value={form.city} onChange={(e) => updateForm('city', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Departure City (Optional)" />
              <input value={form.destination} onChange={(e) => updateForm('destination', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Destination (Optional)" />
              <input value={form.travelers} onChange={(e) => updateForm('travelers', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="No. of Travelers (Optional)" />
              <input value={form.travelMonth} onChange={(e) => updateForm('travelMonth', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Travel Month / Dates (Optional)" />
              <input value={form.budget} onChange={(e) => updateForm('budget', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm sm:col-span-2" placeholder="Estimated Budget (Optional)" />
            </div>

            <textarea value={form.requirements} onChange={(e) => updateForm('requirements', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Additional Requirements (Optional)" />

            <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
              {isSubmitting ? 'Sending...' : config.submitLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
