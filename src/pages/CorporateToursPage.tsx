import { useState } from 'react'
import type { PageId } from '../App'
import { buildAutoReplyMessage, sendEmailWithAutoReply } from '../formEmail.ts'
import { CONTACT_EMAIL, PHONE_NUMBER, PHONE_TEL } from '../constants/contact'

interface Props {
  navigate: (p: PageId) => void
}

type CorporatePopupType = 'plan-trip' | 'get-quote' | 'proposal'

interface CorporateFormState {
  companyName: string
  contactPerson: string
  phone: string
  email: string
  employees: string
  destination: string
  travelMonth: string
  budget: string
  requirements: string
}

const corporatePackages = [
  {
    icon: '🏆',
    title: 'Team Building Retreats',
    desc: 'Carefully designed team outings to destinations like Coorg, Lonavala, Goa & Manali. Activities include adventure sports, workshops, bonfire nights, and collaborative challenges that strengthen bonds.',
    features: ['Adventure Activities', 'Group Workshops', 'Leadership Games', 'Bonfire & Entertainment', 'Team Meals', 'Photography & Memories'],
    img: 'https://images.unsplash.com/photo-1561489413-985b06da5bee?w=700&h=500&fit=crop&auto=format',
  },
  {
    icon: '🎯',
    title: 'Incentive Tours',
    desc: 'Reward your top performers with luxurious international or domestic incentive trips. Destinations like Bali, Maldives, Singapore, Thailand & Europe are popular choices that motivate and inspire.',
    features: ['Luxury 5★ Stays', 'Custom Trophies', 'Gala Dinner', 'International Destinations', 'Personalized Experiences', 'Event Photography'],
    img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=700&h=500&fit=crop&auto=format',
  },
  {
    icon: '🎪',
    title: 'MICE Events',
    desc: 'Full-service Meetings, Incentives, Conferences & Exhibitions management. From venue sourcing and A/V setup to delegate management and post-event tours — we handle it all.',
    features: ['Venue Sourcing', 'A/V & Stage Setup', 'Delegate Management', 'Airport Transfers', 'Conference Materials', 'Post-Event Tours'],
    img: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=700&h=500&fit=crop&auto=format',
  },
  {
    icon: '✈️',
    title: 'International Corporate Retreats',
    desc: 'Multi-day international retreats combining business sessions with leisure. Popular destinations include Singapore, Dubai, Thailand, Switzerland, and Southeast Asia.',
    features: ['Business + Leisure Mix', 'Conference Rooms', 'Cultural Experiences', 'Group Flight Bookings', 'Visa Coordination', 'Local Business Tours'],
    img: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=700&h=500&fit=crop&auto=format',
  },
  {
    icon: '🚌',
    title: 'Office Picnic & Day Trips',
    desc: 'One-day and weekend office picnics to nearby destinations. We arrange transportation, meals, activities, and entertainment for groups of 20 to 2,000+.',
    features: ['A/C Transport', 'Meals & Snacks', 'Fun Activities', 'DJ & Entertainment', 'Group Insurance', 'Flexible Dates'],
    img: 'https://images.unsplash.com/photo-1504814532849-cff240bbc503?w=700&h=500&fit=crop&auto=format',
  },
  {
    icon: '🏢',
    title: 'Annual Day Events',
    desc: 'Make your company\'s annual day truly memorable. We manage venue, stage, décor, entertainment, awards ceremonies, and group dinners at premium hotel banquets.',
    features: ['Premium Venue', 'Stage & Décor', 'Awards Ceremony', 'Entertainment Show', 'Group Dinner', 'Event Photography'],
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI3SNlrZ2HdnDQyohw654xQOf_5WwyE7_3JESVCzUc7A&s=10',
  },
]

const destinations = [
  { name: 'Goa', type: 'Domestic', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=280&fit=crop&auto=format', tag: '🏖️ Beach' },
  { name: 'Manali', type: 'Domestic', img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=280&fit=crop&auto=format', tag: '⛷️ Adventure' },
  { name: 'Coorg', type: 'Domestic', img: 'https://images.unsplash.com/photo-1633145284780-c8fda4f11464?w=400&h=280&fit=crop&auto=format', tag: '☕ Nature' },
  { name: 'Singapore', type: 'International', img: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=280&fit=crop&auto=format', tag: '🌆 City' },
  { name: 'Dubai', type: 'International', img: 'https://images.unsplash.com/flagged/photo-1559717201-fbb671ff56b7?w=400&h=280&fit=crop&auto=format', tag: '🌟 Luxury' },
  { name: 'Thailand', type: 'International', img: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&h=280&fit=crop&auto=format', tag: '🐘 Culture' },
]

const stats = [
  { num: '500+', label: 'Corporate Trips Done' },
  { num: '200+', label: 'Companies Served' },
  { num: '25,000+', label: 'Corporate Travellers' },
  { num: '15+', label: 'Years Experience' },
]

export default function CorporateToursPage({ navigate }: Props) {
  const [popupType, setPopupType] = useState<CorporatePopupType | null>(null)
  const [selectedService, setSelectedService] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSent, setFormSent] = useState(false)
  const [form, setForm] = useState<CorporateFormState>({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    employees: '',
    destination: '',
    travelMonth: '',
    budget: '',
    requirements: '',
  })

  const openCorporatePopup = (type: CorporatePopupType, service = '') => {
    setPopupType(type)
    setSelectedService(service)
    setFormError('')
    setFormSent(false)
    setForm(prev => ({ ...prev, requirements: service && type === 'get-quote' ? `Interested Service: ${service}` : '' }))
  }

  const closeCorporatePopup = () => {
    setPopupType(null)
    setSelectedService('')
    setFormError('')
  }

  const popupMeta = popupType === 'plan-trip'
    ? { title: 'Request Plan Corporate Trips', context: 'corporate:popup:plan-trip', submitLabel: 'Submit Trip Plan Request' }
    : popupType === 'get-quote'
      ? { title: 'Get Quote', context: 'corporate:popup:get-quote', submitLabel: 'Submit Quote Request' }
      : { title: 'Request Corporate Proposal', context: 'corporate:popup:proposal', submitLabel: 'Submit Proposal Request' }

  const updateForm = (field: keyof CorporateFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleCorporateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const companyName = form.companyName.trim()
    const contactPerson = form.contactPerson.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const employees = form.employees.trim()
    const destination = form.destination.trim()
    const travelMonth = form.travelMonth.trim()
    const budget = form.budget.trim()
    const requirements = form.requirements.trim()

    if (!popupType) return

    if (!companyName || !contactPerson || !phone || !email) {
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

    const inquiryType = popupType === 'plan-trip'
      ? 'Corporate Trip Planning'
      : popupType === 'get-quote'
        ? 'Corporate Service Quote'
        : 'Corporate Proposal Request'

    const subject = `[${inquiryType}] ${companyName} - ${contactPerson}`
    const fullMessage = [
      `Inquiry Type: ${inquiryType}`,
      
      `Selected Service: ${selectedService || 'N/A'}`,
      `Company Name: ${companyName}`,
      `Contact Person: ${contactPerson}`,
      
      `Employees: ${employees || 'N/A'}`,
      `Preferred Destination: ${destination || 'N/A'}`,
      `Preferred Travel Month: ${travelMonth || 'N/A'}`,
      `Estimated Budget: ${budget || 'N/A'}`,
      `Additional Requirements: ${requirements || 'N/A'}`,
    ].join('\n')

    try {
      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: contactPerson,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: 'Thank you for your corporate travel enquiry - PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(contactPerson, fullMessage),
        ownerTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          company_name: companyName,
          selected_service: selectedService || 'N/A',
          employees: employees || 'N/A',
          destination: destination || 'N/A',
          travel_month: travelMonth || 'N/A',
          budget: budget || 'N/A',
          requirements: requirements || 'N/A',
        },
        autoReplyTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          company_name: companyName,
          selected_service: selectedService || 'N/A',
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setFormSent(true)
      setForm({
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        employees: '',
        destination: '',
        travelMonth: '',
        budget: '',
        requirements: '',
      })
      setTimeout(() => {
        closeCorporatePopup()
      }, 1400)
    } catch (error) {
      console.error('Corporate query send failed', error)
      window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      closeCorporatePopup()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-20">
      {popupType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closeCorporatePopup}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8 border-b border-blue-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-[#0D2B5E] font-bold">{popupMeta.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">Corporate query form with category-specific details for founder identification.</p>
                </div>
                <button onClick={closeCorporatePopup} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">✕</button>
              </div>
            </div>

            <form onSubmit={handleCorporateSubmit} className="p-6 sm:p-8 space-y-4">
              {formSent && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Corporate request sent successfully.</div>}
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

              {popupType === 'get-quote' && (
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#0D2B5E]">
                  Selected Service: <span className="font-bold">{selectedService || 'General Corporate Service'}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={form.companyName} onChange={e => updateForm('companyName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Company Name*" required />
                <input value={form.contactPerson} onChange={e => updateForm('contactPerson', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Contact Person*" required />
                <input value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Phone Number*" required />
                <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Business Email*" required />
                <input value={form.employees} onChange={e => updateForm('employees', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Team Size / Employees (Optional)" />
                <input value={form.destination} onChange={e => updateForm('destination', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Preferred Destination (Optional)" />
                <input value={form.travelMonth} onChange={e => updateForm('travelMonth', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Travel Month / Dates (Optional)" />
                <input value={form.budget} onChange={e => updateForm('budget', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Estimated Budget (Optional)" />
              </div>

              <textarea value={form.requirements} onChange={e => updateForm('requirements', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Additional Requirements" />

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
                {isSubmitting ? 'Sending...' : popupMeta.submitLabel}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative min-h-[28rem] bg-gray-900 overflow-hidden flex items-center">
        <img
          src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1400&h=700&fit=crop&auto=format"
          alt="Corporate event"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(13,43,94,0.9) 0%, rgba(13,43,94,0.7) 60%, rgba(8,145,178,0.5) 100%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-white py-20">
          <div className="text-6xl mb-4">💼</div>
          <h1 className="font-display text-5xl sm:text-6xl font-bold mb-4">Corporate Travel Solutions</h1>
          <p className="text-white/85 text-base sm:text-lg leading-relaxed max-w-2xl mb-8">
            From team building retreats to MICE events, annual day celebrations to international incentive tours — PNP Advisors is your trusted corporate travel partner with end-to-end expertise.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => openCorporatePopup('plan-trip')} className="px-8 py-4 rounded-full font-bold text-[#0D2B5E] shadow-xl hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
              Request Plan Corporate Trips
            </button>
            <a href={`tel:${PHONE_TEL}`} className="px-8 py-4 rounded-full font-bold text-white border-2 border-white/60 hover:bg-white/10 transition-colors">
              📞 Call Us Now
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 text-[#0D2B5E] font-bold text-sm hover:text-[#F47B20] transition-colors mb-10">
          ← Back to Home
        </button>

        {/* Stats 
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {stats.map(stat => (
            <div key={stat.label} className="text-center p-6 bg-white rounded-2xl shadow-lg border border-blue-100 card-hover">
              <div className="font-display text-[#0D2B5E] text-4xl font-bold">{stat.num}</div>
              <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div> */}

        {/* Why choose PNP for corporate */}
        <div className="mb-14">
          <div className="text-center mb-10">
            <span className="text-[#F47B20] font-bold tracking-widest uppercase text-sm">Our Expertise</span>
            <h2 className="font-display text-3xl sm:text-4xl text-[#0D2B5E] font-bold mt-2">Corporate Travel Services</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#F47B20] to-[#F0C060] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {corporatePackages.map(pkg => (
              <div key={pkg.title} className="card-hover bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
                <div className="relative h-44 bg-gray-200 overflow-hidden">
                  <img src={pkg.img} alt={pkg.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3">
                    <span className="text-2xl">{pkg.icon}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-2">{pkg.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{pkg.desc}</p>
                  <div className="grid grid-cols-2 gap-1.5 mb-4">
                    {pkg.features.map(f => (
                      <div key={f} className="text-xs text-gray-600 flex items-center gap-1">
                        <span className="text-[#F47B20]">✓</span> {f}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => openCorporatePopup('get-quote', pkg.title)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
                    Get Quote
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular corporate destinations */}
        <div className="mb-14">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl text-[#0D2B5E] font-bold">Popular Corporate Destinations</h2>
            <p className="text-gray-500 mt-2 text-sm">Our most booked destinations for corporate groups</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {destinations.map(dest => (
              <div key={dest.name} className="card-hover rounded-2xl overflow-hidden shadow-lg group cursor-pointer">
                <div className="relative h-36 bg-gray-200">
                  <img src={dest.img} alt={dest.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-2 left-2">
                    <div className="text-white font-bold text-sm">{dest.name}</div>
                    <div className="text-white/70 text-xs">{dest.tag}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#0D2B5E] to-[#0e4f7a] rounded-3xl p-10 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="font-display text-3xl font-bold mb-3">Ready to Plan Your Corporate Trip?</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Share your requirements — number of employees, destination preference, budget, and dates. Our corporate travel specialists will design a perfect proposal within 24 hours.
              </p>
              <div className="space-y-2 text-sm">
                {['Customised proposals within 24 hours', 'Dedicated relationship manager', 'GST-compliant invoicing for companies', 'EMI options for large groups'].map(item => (
                  <div key={item} className="flex items-center gap-2 text-white/90">
                    <span className="text-[#F47B20]">✓</span> {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <button onClick={() => openCorporatePopup('proposal')} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-[#0D2B5E] shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
                📧 Request Corporate Proposal
              </button>
              <button onClick={() => navigate('travel-cab')} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-colors">
                🚘 Private Cab Booking
              </button>
              <a href={`tel:${PHONE_TEL}`} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-colors">
                📞 Call: {PHONE_NUMBER}
              </a>
              <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-white border-2 border-white/30 hover:bg-white/10 transition-colors">
                📧 Email: {CONTACT_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
