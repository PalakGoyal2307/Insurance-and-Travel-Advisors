import { useState, useEffect } from 'react'
import type { PageId } from '../App'
import { buildAutoReplyMessage, sendEmailWithAutoReply } from '../formEmail.ts'
import { CONTACT_EMAIL, LINKEDIN_URL, PHONE_NUMBER, PHONE_TEL } from '../constants/contact'

interface Props {
  navigate: (p: PageId) => void
  openQueryForm?: (context?: string) => void
  queryContext?: string
  setQueryContext?: React.Dispatch<React.SetStateAction<string>>
}

const fallbackImage = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&h=800&fit=crop&auto=format'

const handleImageError = (event: React.SyntheticEvent<HTMLImageElement>) => {
  const target = event.currentTarget
  if (target.dataset.fallbackApplied === 'true') return
  target.dataset.fallbackApplied = 'true'
  target.src = fallbackImage
}

const floatingImages = [
  { url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=360&h=240&fit=crop&auto=format', alt: 'Taj Mahal India', cls: 'animate-float1', style: { top: '8%', left: '2%', width: 220, height: 150, rotate: '-4deg' } },
  { url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=360&h=240&fit=crop&auto=format', alt: 'Eiffel Tower Paris', cls: 'animate-float2', style: { top: '5%', right: '3%', width: 200, height: 140, rotate: '5deg' } },
  { url: 'https://images.unsplash.com/photo-1603477849227-705c424d1d80?w=360&h=240&fit=crop&auto=format', alt: 'Maldives resort', cls: 'animate-float3', style: { bottom: '20%', left: '1%', width: 200, height: 135, rotate: '-6deg' } },
  { url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?w=360&h=240&fit=crop&auto=format', alt: 'Bali temple', cls: 'animate-float4', style: { bottom: '18%', right: '2%', width: 210, height: 145, rotate: '4deg' } },
  { url: 'https://images.unsplash.com/photo-1575388104683-e076ee9ccaa0?w=360&h=240&fit=crop&auto=format', alt: 'Honeymoon beach couple', cls: 'animate-float5', style: { top: '42%', left: '0%', width: 170, height: 115, rotate: '3deg' } },
  { url: 'https://images.unsplash.com/photo-1586752488885-6ce47fdfd874?w=360&h=240&fit=crop&auto=format', alt: 'Switzerland mountains', cls: 'animate-float1', style: { top: '35%', right: '1%', width: 175, height: 120, rotate: '-3deg' } },
]

const domesticDestinations = [
  { name: 'Goa', tagline: 'Beaches & Vibrant Nightlife', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiNiYKe3OziQyEEh6yoJltraLA0U2pLc6wgy2p9lmRqA&s=10', top10: ['Baga Beach', 'Calangute Beach', 'Dudhsagar Falls', 'Old Goa Churches', 'Fort Aguada', 'Anjuna Flea Market', 'Chapora Fort', 'Palolem Beach', 'Basilica of Bom Jesus', 'Casino Cruise Night'] },
  { name: 'Agra', tagline: 'The Taj Mahal & Mughal Heritage', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=600&h=400&fit=crop&auto=format&q=80', top10: ['Taj Mahal', 'Agra Fort', 'Fatehpur Sikri', 'Mehtab Bagh', 'Itimad-ud-Daula', "Akbar's Tomb", 'Jama Masjid Agra', 'Kinari Bazaar', 'Dayal Bagh', 'Soami Bagh Temple'] },
  { name: 'Kerala', tagline: "God's Own Country – Backwaters", img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsFBm24c8MFnAcctM85bu2fbnCDXRffa07XPCDPSUoNg&s=10', top10: ['Alleppey Backwaters', 'Munnar Tea Gardens', 'Varkala Beach', 'Fort Kochi', 'Periyar Wildlife Sanctuary', 'Thekkady', 'Wayanad Hills', 'Athirapally Falls', 'Kovalam Beach', 'Thrissur Pooram Festival'] },
  { name: 'Rajasthan', tagline: 'Land of Kings – Royal Forts', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbnzQ7Nh7YFUs-9b_uM5smpZuzVSa4MtuzKIfXeC9ckg&s=10', top10: ['Amber Fort Jaipur', 'Mehrangarh Fort Jodhpur', 'Lake Palace Udaipur', 'Jaisalmer Fort', 'Pushkar Lake', 'Ranthambhore Tiger Reserve', 'City Palace Jaipur', 'Chittorgarh Fort', 'Bikaner Camel Festival', 'Hawa Mahal'] },
  { name: 'Shimla', tagline: 'Queen of Hill Stations', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5OK_Gfdw3MKGiHUqudX7aBXAcj4emkFQ82oR9frSn0w&s=10', top10: ['The Ridge', 'Mall Road', 'Jakhu Temple', 'Kufri Snow Point', 'Naldehra Golf Course', 'Chail Palace', 'Tattapani Hot Springs', 'Narkanda Apple Orchards', 'Christ Church', 'Indian Institute of Advanced Study'] },
  { name: 'Andaman', tagline: 'Pristine Beaches & Coral Reefs', img: 'https://images.unsplash.com/photo-1542259009477-d625272157b7?w=600&h=400&fit=crop&auto=format&q=80', top10: ['Radhanagar Beach', 'Cellular Jail', 'Elephant Beach', 'Ross Island', 'Baratang Island', 'Neil Island', 'North Bay Island', 'Jolly Buoy Coral Park', 'Diglipur Mud Volcano', 'Mahatma Gandhi Marine Park'] },
  { name: 'Varanasi', tagline: 'The Spiritual Capital of India', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOvzV7HCEPfVxAHiyiG_f9qQnRurp_Zb04aXt8KpL5BA&s=10', top10: ['Kashi Vishwanath Temple', 'Dashashwamedh Ghat', 'Manikarnika Ghat', 'Sarnath Stupa', 'Assi Ghat', 'Ramnagar Fort', 'Bharat Mata Temple', 'Ganga Aarti Ceremony', 'Durga Temple', 'Sankat Mochan Hanuman Temple'] },
  { name: 'Manali', tagline: 'Himalayan Adventure Paradise', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkpjh1goQQfN4Si8PwIzQsB7IsBUCTSpX4ZhKD2mC6hQ&s=10', top10: ['Rohtang Pass', 'Solang Valley', 'Hadimba Devi Temple', 'Old Manali Village', 'Beas Kund Trek', 'Manikaran Gurudwara', 'Naggar Castle', 'Chandrakhani Pass', 'Kullu Dussehra Festival', 'Kullu River Rafting'] },
  { name: 'Darjeeling', tagline: 'Tea Gardens & Himalayan Views', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOSFm7-8OxOPoCuQBR73kmzQ-up9298Dr4JhFTy2NxUg&s=10', top10: ['Tiger Hill Sunrise', 'Darjeeling Himalayan Railway', 'Happy Valley Tea Estate', 'Batasia Loop', 'Peace Pagoda', 'Padmaja Naidu Zoo', 'Rock Garden', 'Makaibari Tea Garden', 'Ghoom Monastery', 'Observatory Hill'] },
  { name: 'Mumbai', tagline: 'City of Dreams & Bollywood', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpfjs4b2rOKux9Cq9KKXPylIOf65Nbqobnmq4P5jl9kQ&s=10', top10: ['Gateway of India', 'Marine Drive', 'Elephanta Caves', 'Chhatrapati Shivaji Terminus', 'Siddhivinayak Temple', 'Juhu Beach', 'Dharavi', 'Film City', 'Haji Ali Dargah', 'Sanjay Gandhi National Park'] },
]

const internationalDestinations = [
  { name: 'Maldives', tagline: 'Paradise on Earth – Crystal Waters', img: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop&auto=format&q=80', top10: ['Male Atoll', 'Baa Atoll Biosphere', 'Maafushi Island', 'Banana Reef Dive', 'Ari Atoll', 'Vaadhoo Bioluminescent Beach', 'Hulhumale Beach', 'Cocoa Island Resort', 'Fulidhoo Island', 'Local Market Male'] },
  { name: 'Paris', tagline: 'City of Love & Elegance', img: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop&auto=format&q=80', top10: ['Eiffel Tower', 'The Louvre Museum', 'Notre-Dame Cathedral', 'Champs-Élysées', 'Montmartre & Sacré-Cœur', 'Palace of Versailles', "Musée d'Orsay", 'Seine River Cruise', 'Arc de Triomphe', 'Moulin Rouge Show'] },
  { name: 'Bali', tagline: 'Island of Gods – Spiritual Beauty', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSS_zsXBavLOHyPsNnIp_DOBlhFb7vYo5_BJintpjNyYw&s=10', top10: ['Tanah Lot Temple', 'Ubud Monkey Forest', 'Tegallalang Rice Terrace', 'Kuta Beach', 'Uluwatu Cliff Temple', 'Mount Batur Sunrise Trek', 'Seminyak', 'Besakih Mother Temple', 'Nusa Penida Island', 'Tirta Empul Holy Spring'] },
  { name: 'Dubai', tagline: 'Luxury, Adventure & Desert Magic', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLkntRmp86BlCPN05KdT7OqXYLlrSjKQ7wYaSf0Jj88g&s=10', top10: ['Burj Khalifa Top', 'Dubai Mall', 'Desert Safari', 'Palm Jumeirah', 'Dubai Frame', 'Gold & Spice Souks', 'Burj Al Arab', 'Dubai Creek', 'Miracle Garden', 'Abu Dhabi Day Trip'] },
  { name: 'Singapore', tagline: 'Garden City & Modern Marvel', img: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop&auto=format&q=80', top10: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa Island', 'Universal Studios', 'Chinatown & Little India', 'Singapore Zoo', 'Night Safari', 'Orchard Road Shopping', 'Clarke Quay', 'Jurong Bird Park'] },
  { name: 'Thailand', tagline: 'Land of Smiles & Temples', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2hEure12sYWL4LmEfXxtNA23laW-QfFCU9RBmk317Zw&s=10', top10: ['Grand Palace Bangkok', 'Phi Phi Islands', 'Chiang Mai Old City', 'Wat Phra Kaew Temple', 'Phuket Beaches', 'Floating Market', 'Elephant Sanctuary', 'Railay Beach Krabi', 'Ayutthaya Historic Park', 'Koh Samui'] },
  { name: 'Switzerland', tagline: 'Alpine Wonderland & Pristine Lakes', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRatwcbACVb_YJP6fmOnNOw12Tv3Khw0d4higjTaskTg&s=10', top10: ['Jungfraujoch "Top of Europe"', 'Interlaken Adventure Hub', 'Lake Geneva', 'Zermatt & Matterhorn', 'Lucerne Old Town', 'Rhine Falls', 'Zurich Old Town', 'Bern Old City', 'Grindelwald Glacier', 'Montreux Jazz Festival'] },
  { name: 'Japan', tagline: 'Tradition Meets Futurism', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHqdTYAbZpCa93fUzU_ZRMaPSkjWfOvlcqBWo3pYIThw&s=10', top10: ['Mount Fuji', 'Tokyo Shibuya Crossing', 'Kyoto Arashiyama', 'Osaka Castle', 'Nara Deer Park', 'Hiroshima Peace Memorial', 'Fushimi Inari Shrine', 'Akihabara Electronics Town', 'Hakone Onsen', 'Tokyo Disneyland'] },
  { name: 'Australia', tagline: 'Land Down Under – Wild & Beautiful', img: 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=400&fit=crop&auto=format&q=80', top10: ['Sydney Opera House', 'Great Barrier Reef', 'Uluru (Ayers Rock)', 'Bondi Beach', 'Great Ocean Road', 'Daintree Rainforest', 'Melbourne CBD', 'Blue Mountains', 'Kakadu National Park', 'Whitsunday Islands'] },
  { name: 'New York', tagline: 'The City That Never Sleeps', img: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop&auto=format&q=80', top10: ['Statue of Liberty', 'Times Square', 'Central Park', 'Empire State Building', 'Brooklyn Bridge', 'Metropolitan Museum', 'Broadway Shows', '9/11 Memorial', 'High Line Park', 'Coney Island Beach'] },
]

interface Destination {
  name: string
  tagline: string
  img: string
  top10: string[]
}

function DestinationCard({ dest, onOpen }: { dest: Destination; onOpen: (d: Destination) => void }) {
  return (
    <div
      onClick={() => onOpen(dest)}
      className="card-hover rounded-2xl overflow-hidden cursor-pointer shadow-lg group"
    >
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        <img
          src={dest.img}
          alt={dest.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
          onError={handleImageError}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-display text-white text-xl font-bold">{dest.name}</h3>
          <p className="text-white/80 text-xs mt-0.5">{dest.tagline}</p>
        </div>
        <div className="absolute top-3 right-3 bg-[#F47B20] text-white text-xs font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          Top 10 ▸
        </div>
      </div>
    </div>
  )
}

function DestinationModal({ dest, onClose }: { dest: Destination; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative h-52 bg-gray-200">
          <img src={dest.img} alt={dest.name} className="w-full h-full object-cover" onError={handleImageError} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <h2 className="font-display text-white text-2xl font-bold">{dest.name}</h2>
            <p className="text-white/80 text-sm">{dest.tagline}</p>
          </div>
          <button onClick={onClose} className="absolute top-4 right-4 bg-white/90 rounded-full p-2 hover:bg-white transition-colors">
            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-4">Top 10 Places to Visit</h3>
          <div className="space-y-2.5">
            {dest.top10.map((place, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
                  {i + 1}
                </div>
                <span className="text-[#0D2B5E] font-semibold text-sm">{place}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-destination-enquiry', { detail: { destination: dest.name } }))}
            className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white font-bold transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}
          >
            📧 Enquire for {dest.name} Package
          </button>
        </div>
      </div>
    </div>
  )
}

function DestinationEnquiryPopup({
  destination,
  form,
  formError,
  formSent,
  isSubmitting,
  onChange,
  onClose,
  onSubmit,
}: {
  destination: string
  form: { name: string; phone: string; email: string; message: string }
  formError: string
  formSent: boolean
  isSubmitting: boolean
  onChange: (field: 'name' | 'phone' | 'email' | 'message', value: string) => void
  onClose: () => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 sm:p-8 border-b border-blue-100 flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl text-[#0D2B5E] font-bold">Enquire for {destination}</h3>
            <p className="text-sm text-gray-500 mt-1">Share your details and we will get back with the best package options.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">✕</button>
        </div>

        <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-4">
          {formSent && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Destination enquiry sent successfully.</div>}
          {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#0D2B5E]">
            Destination: <span className="font-bold">{destination}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input value={form.name} onChange={e => onChange('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Full Name*" required />
            <input value={form.phone} onChange={e => onChange('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Phone Number*" required />
          </div>
          <input type="email" value={form.email} onChange={e => onChange('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Email*" required />
          <textarea value={form.message} onChange={e => onChange('message', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Travel dates, people count, budget, and other requirements*" required />

          <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
            {isSubmitting ? 'Sending...' : 'Submit Enquiry'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function HomePage({ navigate, queryContext, setQueryContext }: Props) {
  const [activeModal, setActiveModal] = useState<Destination | null>(null)
  const [destinationEnquiryOpen, setDestinationEnquiryOpen] = useState(false)
  const [selectedDestination, setSelectedDestination] = useState('')
  const [destinationForm, setDestinationForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [destinationFormError, setDestinationFormError] = useState('')
  const [destinationFormSent, setDestinationFormSent] = useState(false)
  const [destinationSubmitting, setDestinationSubmitting] = useState(false)
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', message: '' })
  const [formSent, setFormSent] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ context?: string }>
      const context = customEvent.detail?.context ?? 'general'
      setQueryContext?.(context)
      const target = document.getElementById('contact-section')
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    window.addEventListener('open-query', handler)
    return () => window.removeEventListener('open-query', handler)
  }, [setQueryContext])

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{ destination?: string }>
      const destination = customEvent.detail?.destination
      if (!destination) return
      setActiveModal(null)
      setSelectedDestination(destination)
      setDestinationFormError('')
      setDestinationFormSent(false)
      setDestinationEnquiryOpen(true)
    }

    window.addEventListener('open-destination-enquiry', handler)
    return () => window.removeEventListener('open-destination-enquiry', handler)
  }, [])

  useEffect(() => {
    if (!queryContext || queryContext === 'general') return
    const target = document.getElementById('contact-section')
    target?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [queryContext])

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = contactForm.name.trim()
    const trimmedPhone = contactForm.phone.trim()
    const trimmedEmail = contactForm.email.trim()
    const trimmedMessage = contactForm.message.trim()

    if (!/^[A-Za-z\s.'-]+$/.test(trimmedName)) {
      setFormError('Name can only contain letters, spaces, dots, apostrophes, or hyphens.')
      return
    }

    if (!/^\+?\d{10,15}$/.test(trimmedPhone.replace(/\s+/g, ''))) {
      setFormError('Please enter a valid phone number with 10 to 15 digits.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setFormError('Please enter a valid email address.')
      return
    }

    if (trimmedMessage.length < 10) {
      setFormError('Please share a little more detail so we can help you better.')
      return
    }

    setFormError('')
    const subject = `Query from ${trimmedName} - PNP Advisors Website`
    const fullMessage = [
    
      
      trimmedMessage,
    ].join('\n')
    const body = encodeURIComponent(fullMessage)

    try {
      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: trimmedEmail,
        userName: trimmedName,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: 'Thank you for contacting PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(trimmedName, fullMessage),
        ownerTemplateParams: {
          phone: trimmedPhone,
          context: queryContext || 'general',
        },
        autoReplyTemplateParams: {
          phone: trimmedPhone,
          context: queryContext || 'general',
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`
      }

      setContactForm({ name: '', phone: '', email: '', message: '' })
      setFormSent(true)
      setTimeout(() => setFormSent(false), 4000)
      setTimeout(() => setQueryContext?.('general'), 4000)
    } catch (error) {
      console.error('Email send failed', error)
      window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${body}`
      setContactForm({ name: '', phone: '', email: '', message: '' })
      setFormSent(true)
      setTimeout(() => setFormSent(false), 4000)
      setTimeout(() => setQueryContext?.('general'), 4000)
    }
  }

  const handleDestinationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = destinationForm.name.trim()
    const phone = destinationForm.phone.trim()
    const email = destinationForm.email.trim()
    const message = destinationForm.message.trim()

    if (!name || !phone || !email || !message) {
      setDestinationFormError('Please fill all required fields.')
      return
    }

    if (!/^[A-Za-z\s.'-]+$/.test(name)) {
      setDestinationFormError('Name can only contain letters, spaces, dots, apostrophes, or hyphens.')
      return
    }

    if (!/^\+?\d{10,15}$/.test(phone.replace(/\s+/g, ''))) {
      setDestinationFormError('Please enter a valid phone number with 10 to 15 digits.')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setDestinationFormError('Please enter a valid email address.')
      return
    }

    if (message.length < 10) {
      setDestinationFormError('Please share a little more detail so we can help you better.')
      return
    }

    setDestinationFormError('')
    setDestinationSubmitting(true)

    const subject = `[Top 10 Destination Enquiry] ${name} - ${selectedDestination}`
    const fullMessage = [
      `Destination: ${selectedDestination}`,
      '',
      message,
    ].join('\n')

    try {
      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: name,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: `Thank you for your ${selectedDestination} enquiry - PNP Advisors`,
        autoReplyMessage: buildAutoReplyMessage(name, fullMessage),
        ownerTemplateParams: {
          phone,
          context: `top10-destination:${selectedDestination}`,
          destination: selectedDestination,
        },
        autoReplyTemplateParams: {
          phone,
          context: `top10-destination:${selectedDestination}`,
          destination: selectedDestination,
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setDestinationForm({ name: '', phone: '', email: '', message: '' })
      setDestinationFormSent(true)
      setTimeout(() => {
        setDestinationEnquiryOpen(false)
      }, 1400)
    } catch (error) {
      console.error('Destination enquiry send failed', error)
      window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      setDestinationEnquiryOpen(false)
    } finally {
      setDestinationSubmitting(false)
    }
  }

  return (
    <div className="pt-10">
      {activeModal && <DestinationModal dest={activeModal} onClose={() => setActiveModal(null)} />}
      {destinationEnquiryOpen && (
        <DestinationEnquiryPopup
          destination={selectedDestination}
          form={destinationForm}
          formError={destinationFormError}
          formSent={destinationFormSent}
          isSubmitting={destinationSubmitting}
          onChange={(field, value) => setDestinationForm(prev => ({ ...prev, [field]: value }))}
          onClose={() => setDestinationEnquiryOpen(false)}
          onSubmit={handleDestinationSubmit}
        />
      )}

      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[100svh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-12 sm:py-0" style={{ background: 'linear-gradient(135deg, #050f1f 0%, #0D2B5E 50%, #0e4f7a 100%)' }}>
        {/* Floating image cards */}
        {floatingImages.map((img, i) => (
          <div
            key={i}
            className={`absolute hidden md:block ${img.cls} rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 pointer-events-none`}
            style={{ ...img.style, position: 'absolute', zIndex: 1 }}
          >
            <img src={img.url} alt={img.alt} className="w-full h-full object-cover" style={{ width: img.style.width, height: img.style.height }} onError={handleImageError} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D2B5E]/10 to-transparent" />
          </div>
        ))}

        {/* Bokeh circles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute rounded-full opacity-70" style={{
              background: i % 2 === 0 ? '#F47B20' : '#60a5fa',
              width: `${40 + (i * 23) % 80}px`,
              height: `${40 + (i * 23) % 80}px`,
              top: `${(i * 37) % 90}%`,
              left: `${(i * 53) % 95}%`,
              filter: 'blur(8px)',
              animation: `float${(i % 5) + 1} ${5 + i * 0.7}s ease-in-out infinite`,
              animationDelay: `${i * 0.4}s`,
            }} />
          ))}
        </div>



        {/* Overlay gradient */}
        <div className="absolute inset-0 hero-overlay pt-0" style={{ zIndex: 2 }} />

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto animate-fade-in-up w-full">
          
           <h1 className="font-display text-3xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-3 sm:mb-2 break-words">
            Peaks & Protection
             <span className="block mt-1 gold-gradient text-xl sm:text-4xl leading-tight">Insurance & Travel Advisors</span>
          </h1>
           <p className="italic text-[#f0ece9] text-xs sm:text-lg font-bold tracking-[0.16em] sm:tracking-[0.2em] uppercase mb-6 sm:mb-8">Heights You Seek, Security You Deserve</p>

          {/* About Us Paragraph */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl sm:rounded-3xl p-4 sm:p-8 text-left mb-6 sm:mb-8">
            <p className="text-white text-base sm:text-base leading-relaxed font-medium pb-1">
              Your trusted partner for comprehensive <strong className="text-[#F47B20]">Insurance 🛡️</strong> and <strong className="text-[#F47B20]">Travel Solutions 🧳</strong> under one roof.
            </p>
            
            <p className="text-white/90 text-sm sm:text-base leading-relaxed pb-1">
              We help individuals, families, and businesses secure their future through Health, Life, Motor, Travel, Home, and Commercial Insurance while also creating seamless travel experiences through International/Domestic Tour Packages, Flight/Train/Bus Ticket Bookings, and Hotel Reservations.
            </p>
            
            <p className="text-white text-sm sm:text-base leading-relaxed font-medium">
              Whether you&apos;re planning life&apos;s next adventure or protecting what matters most, we&apos;re here to guide you every step of the way 😄
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap justify-center gap-3 sm:gap-4 max-w-md sm:max-w-none mx-auto">
            <button onClick={() => navigate('travel')} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-white text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
              ✈️ Explore Travel
            </button>
            <button onClick={() => navigate('insurance')} className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-full font-bold text-[#0D2B5E] bg-white text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all hover:scale-105 border-2 border-white">
              🛡️ Get Insured
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-10 text-white/60 animate-bounce text-center hidden sm:block">
          <div className="text-xs mb-1 tracking-wider uppercase">Scroll Down</div>
          <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── SERVICES OVERVIEW ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 pt-5 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-7">
            <h2 className="font-display text-4xl sm:text-5xl text-[#0D2B5E] font-bold ">Our Core Services</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#F47B20] to-[#F0C060] mx-auto mt-6 mb-2 rounded-full" />
            <span className="text-[#F47B20] font-bold tracking-widest uppercase text-sm">What We Offer</span>
          </div>

          <div className="mb-5">
            <h3 className="font-display text-2xl sm:text-3xl text-[#0D2B5E] font-bold text-center">Travel Services</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🌍',title: 'International Tours', desc: 'Explore world-class destinations across Europe, Asia, America & beyond with fully customized itineraries.', page: 'travel-international' as PageId },
              { icon: '🇮🇳', title: 'Domestic Tours', desc: "Discover the incredible diversity of India — from Goa's beaches to Rajasthan's royal forts.", page: 'travel-domestic' as PageId },
              { icon: '💑', title: 'Honeymoon Packages', desc: 'Romantic, handcrafted getaways for newlyweds. Luxury stays, candlelight dinners & more.', page: 'travel-honeymoon' as PageId },
              { icon: '✈️', title: 'Flight / Train / Bus Ticket Booking', desc: 'Hassle-free ticket bookings for all modes of travel. Best prices, instant confirmation.', page: 'travel-flights' as PageId },
              { icon: '🚘', title: 'Private Cab Booking', desc: 'Comfortable local, airport, outstation, and city cab bookings with flexible travel options.', page: 'travel-cab' as PageId },
              { icon: '🏨', title: 'Hotel & Villa Stays', desc: 'Curated accommodations from budget to ultra-luxury. Exclusive deals for our clients.', page: 'travel-hotels' as PageId },
              { icon: '🕌', title: 'Religious Trips', desc: 'Char Dham, Tirupati, Shirdi, Golden Temple & more. Spiritual journeys made seamless.', page: 'religious' as PageId },
              { icon: '💼', title: 'Corporate Tours', desc: 'Team outings, incentive trips, MICE events & conferences. Professional end-to-end management.', page: 'corporate' as PageId },
            ].map(svc => (
              <button
                key={svc.title}
                onClick={() => navigate(svc.page)}
                className="card-hover bg-gradient-to-br from-[#EFF6FF] to-white border border-blue-100 rounded-2xl p-6 text-left group"
              >
                <div className="text-4xl mb-3">{svc.icon}</div>
                <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-2 group-hover:text-[#F47B20] transition-colors">{svc.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{svc.desc}</p>
                <div className="mt-4 text-[#F47B20] font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More →
                </div>
              </button>
            ))}
          </div>

          <div className="mt-12 mb-5">
            <h3 className="font-display text-2xl sm:text-3xl text-[#0D2B5E] font-bold text-center">Insurance Services</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '❤️', title: 'Health Insurance', desc: 'Comprehensive health coverage with Care Insurance. Cashless hospitalization across India.', page: 'insurance-health' as PageId },
              { icon: '🌿', title: 'Life Insurance', desc: 'Trusted LIC life plans to protect your family and build long-term financial security.', page: 'insurance-life' as PageId },
              { icon: '🏢', title: 'General Insurance', desc: 'Motor, travel, home, and business protection through reliable general insurance solutions.', page: 'insurance-general' as PageId },
            ].map(svc => (
              <button
                key={svc.title}
                onClick={() => navigate(svc.page)}
                className="card-hover bg-gradient-to-br from-[#EFF6FF] to-white border border-blue-100 rounded-2xl p-6 text-left group"
              >
                <div className="text-4xl mb-3">{svc.icon}</div>
                <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-2 group-hover:text-[#F47B20] transition-colors">{svc.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{svc.desc}</p>
                <div className="mt-4 text-[#F47B20] font-bold text-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn More →
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── DOMESTIC DESTINATIONS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #EFF6FF 0%, #dbeafe 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#F47B20] font-bold tracking-widest uppercase text-sm">Explore India</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0D2B5E] font-bold mt-2">Top 10 Domestic Destinations</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Click any destination to explore it's top 10 must-visit places</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#F47B20] to-[#F0C060] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {domesticDestinations.map(dest => (
              <DestinationCard key={dest.name} dest={dest} onOpen={setActiveModal} />
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate('travel-domestic')} className="px-8 py-3.5 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
              View All Domestic Packages →
            </button>
          </div>
        </div>
      </section>

      {/* ── INTERNATIONAL DESTINATIONS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#F47B20] font-bold tracking-widest uppercase text-sm">World Beyond</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0D2B5E] font-bold mt-2">Top 10 International Destinations</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">The world is waiting — click to discover the best places at each destination</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#F47B20] to-[#F0C060] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {internationalDestinations.map(dest => (
              <DestinationCard key={dest.name} dest={dest} onOpen={setActiveModal} />
            ))}
          </div>
          <div className="text-center mt-10">
            <button onClick={() => navigate('travel-international')} className="px-8 py-3.5 rounded-full font-bold text-white shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
              View All International Packages →
            </button>
          </div>
        </div>
      </section>

      {/* ── RELIGIOUS TRIPS PREVIEW ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7, #FFFBEB)' }}>
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C8962A' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            <span className="text-[#F47B20] font-bold tracking-widest uppercase text-sm">Sacred Journeys</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0D2B5E] font-bold mt-2">Religious & Spiritual Trips 🕌</h2>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">Experience divine blessings through our thoughtfully crafted spiritual journeys</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#F47B20] to-[#F0C060] mx-auto mt-4 rounded-full" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {[
              { icon: '⛰️', name: 'Char Dham Yatra', desc: 'Kedarnath · Badrinath · Gangotri · Yamunotri', img: 'https://images.unsplash.com/photo-1706186839147-0d708602587b?w=400&h=280&fit=crop&auto=format' },
              { icon: '🪔', name: 'Kashi Vishwanath', desc: 'Varanasi – The Eternal City of Shiva', img: 'https://images.unsplash.com/photo-1627938823193-fd13c1c867dd?w=400&h=280&fit=crop&auto=format' },
              { icon: '🛕', name: 'Tirupati Balaji', desc: "World's Most Visited Temple", img: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=400&h=280&fit=crop&auto=format' },
              { icon: '⭐', name: 'Golden Temple', desc: 'Amritsar – The Sikh Holy Shrine', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqH2lfKbHTjfK5_otc7Tphy7uLHTB_IKNodhvDnfLbew&s=10' },
            ].map(trip => (
              <button key={trip.name} onClick={() => navigate('religious')} className="card-hover bg-white rounded-2xl overflow-hidden shadow-lg text-left group">
                <div className="h-40 relative bg-gray-200 overflow-hidden">
                  <img src={trip.img} alt={trip.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={handleImageError} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-3xl">{trip.icon}</div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-[#0D2B5E] font-bold text-base">{trip.name}</h3>
                  <p className="text-gray-500 text-xs mt-1">{trip.desc}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="text-center">
            <button onClick={() => navigate('religious')} className="px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all shadow-lg hover:shadow-xl">
              Explore All Religious Trips 🙏
            </button>
          </div>
        </div>
      </section>

      {/* ── CORPORATE TOURS PREVIEW ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #0D2B5E 0%, #0e4f7a 100%)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="text-[#F47B20] font-bold tracking-widest uppercase text-sm">For Businesses</span>
              <h2 className="font-display text-4xl sm:text-5xl text-white font-bold mt-2 mb-6">Corporate Travel Solutions 💼</h2>
              <p className="text-blue-200 text-base leading-relaxed mb-6">
                We specialize in managing corporate travel with precision and professionalism. From team outings to international incentive tours, we handle everything so your team can focus on what matters.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {['Team Building Events', 'Incentive Tours', 'MICE Events', 'Conference Travel', 'International Retreats', 'Airport Transfers'].map(f => (
                  <div key={f} className="flex items-center gap-2 text-white/90 text-sm">
                    <span className="text-[#F47B20] font-bold">✓</span> {f}
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('corporate')} className="px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
                Plan Corporate Trip →
              </button>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-white/20">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROYIkIw_kwzWIQVxI5ygx-tFxFhu9pZnMKaifGhR4edQ&s=10" alt="Corporate conference" className="w-full h-80 object-cover" onError={handleImageError} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HONEYMOON BANNER ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img src="https://images.unsplash.com/photo-1701401942416-bea590efe2ad?w=1400&h=500&fit=crop&auto=format" alt="Honeymoon couple sunset" className="w-full h-80 sm:h-96 object-cover" onError={handleImageError} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(13,43,94,0.85) 0%, rgba(13,43,94,0.5) 60%, transparent 100%)' }} />
            <div className="absolute inset-0 flex items-center px-8 sm:px-16">
              <div className="max-w-lg">
                <div className="text-4xl mb-3">💑</div>
                <h2 className="font-display text-3xl sm:text-4xl text-white font-bold mb-3">Honeymoon Packages</h2>
                <p className="text-white/80 text-sm sm:text-base mb-6 leading-relaxed">
                  Begin your forever with a magical getaway. Maldives, Bali, Paris, Kerala & more — we craft love stories into unforgettable journeys.
                </p>
                <button onClick={() => navigate('travel-honeymoon')} className="px-7 py-3 rounded-full font-bold text-[#0D2B5E] shadow-xl hover:scale-105 transition-transform" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
                  Plan Your Honeymoon ❤️
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOUNDER SECTION ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(180deg, #EFF6FF 0%, #dbeafe 100%)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-[#F47B20] font-bold tracking-widest uppercase text-sm">Our Leadership</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0D2B5E] font-bold mt-2">Meet The Founder</h2>
            <div className="w-20 h-1 bg-gradient-to-r from-[#F47B20] to-[#F0C060] mx-auto mt-4 rounded-full" />
          </div>
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative bg-gradient-to-br from-[#0D2B5E] to-[#0e4f7a] p-10 flex flex-col justify-center items-center text-center">
                {/* Founder Image */}
                <div className="w-50 h-58 rounded-full border-4 border-[#F47B20]/60 mb-6 overflow-hidden bg-white flex items-center justify-center shadow-2xl">
                  <img src="https://drive.google.com/thumbnail?id=1ZBFnoqgrrG4CVlF6TmBDnOq4vEdYuuYO&sz=w1000" alt="Akash Goyal - Founder" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = 'https://drive.google.com/thumbnail?id=1ZBFnoqgrrG4CVlF6TmBDnOq4vEdYuuYO&sz=w1000' }} />
                </div>
                <h3 className="font-display text-white text-2xl font-bold">Akash Goyal</h3>
                <p className="text-[#F47B20] font-bold text-sm tracking-wider uppercase mt-1">Founder & Principal Advisor</p>
                <p className="text-white/70 text-sm mt-1">PNP Advisors</p>
                <div className="flex gap-3 mt-6">
                  <a href="https://instagram.com/akashgoyal063" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#C13584] flex items-center justify-center transition-colors" aria-label="Visit Instagram">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                  <a href="https://www.linkedin.com/in/akashgoyal063/" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#0077B5] flex items-center justify-center transition-colors" aria-label="Visit LinkedIn">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                </div>
              </div>
              <div className="p-10 flex flex-col justify-center bg-gradient-to-br from-white via-blue-50 to-white">
                <div className="text-6xl text-[#F47B20] font-display leading-none mb-0 drop-shadow-sm">"</div>
                <p className="text-gray-800 text-lg leading-relaxed mb-6 font-semibold">
                 At the heart of Peaks & Protection Insurance & Travel Advisors is Akash Goyal, an insurance professional driven by integrity, knowledge, and a genuine commitment to client success. With a strong foundation in the insurance industry and an unwavering passion for continuous learning, he believes that every recommendation should be guided by transparency, expertise, and the pursuit of long-term relationships built on trust.
                </p>
                <div className="h-1 w-12 bg-gradient-to-r from-[#F47B20] to-[#F0C060] rounded-full my-4" />
                <p className="text-gray-700 text-base leading-relaxed">
                  ●  Former Chief Manager, Tata AIG General Insurance
                </p>
                <p className="text-gray-700 text-base leading-relaxed">
                  ●  CFA Level I Cleared
                </p>
                <p className="text-gray-700 text-base leading-relaxed mb-5">
                  ●  MBA, NMIMS Mumbai
                </p>
                <p className="text-gray-700 text-base leading-relaxed mb-8 italic border-l-4 border-[#F47B20] pl-4">
                  At PNP Advisors, we don&apos;t just sell policies or book tickets — we build lifelong relationships and become your family&apos;s most trusted advisor for every milestone.
                </p>
                
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT SECTION ── */}
      <section id="contact-section" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-[#F47B20] font-bold tracking-widest uppercase text-sm">Get In Touch</span>
            <h2 className="font-display text-4xl sm:text-5xl text-[#0D2B5E] font-bold mt-2">Contact Us</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Ready to plan your next adventure or protect what matters? We are just a message away.</p>
            <div className="w-20 h-1 bg-gradient-to-r from-[#F47B20] to-[#F0C060] mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div>
              <div className="space-y-5 mb-8">
                {[
                  { icon: '📧', label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
                  { icon: '📞', label: 'Phone', value: PHONE_NUMBER, href: `tel:${PHONE_TEL}` },
                  { icon: '📍', label: 'Address', value: 'Peaks and Protection Insurance and Travel Advisors, Lonara Road, Segaon, Madhya Pradesh 451442', href: 'https://maps.google.com?q=Peaks%20and%20Protection%20Insurance%20and%20Travel%20Advisors,%20Lonara%20Road,%20Segaon,%20Madhya%20Pradesh%20451442&ftid=0x3bd8a1abb9ca576b:0x34132163fda99fc3&entry=gps&shh=CAE&lucs=,94297699,94231188,94280568,47071704,94218641,94282134,100813464,94286869,100820247,100813014&g_st=iw' },
                ].map(item => (
                  <a
  key={item.label}
  href={item.href}
  target={item.label === "Email" ? "_blank" : undefined}
  rel={item.label === "Email" ? "noopener noreferrer" : undefined}
  className="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-colors group"
>
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-[#0D2B5E] font-bold text-sm">{item.label}</div>
                      <div className="text-gray-600 text-sm group-hover:text-[#0D2B5E] transition-colors">{item.value}</div>
                    </div>
                  </a>
                ))}
              </div>

              <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-4">Follow Us</h3>
              <div className="flex gap-3 flex-wrap">
                <a href="https://instagram.com/pnpadvisors" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white text-sm transition-all hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  @pnpadvisors
                </a>
                <a href="https://wa.me/+919284476387" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white text-sm bg-[#25D366] transition-all hover:scale-105 shadow-lg">
                  <svg
  className="w-5 h-5"
  fill="currentColor"
  viewBox="0 0 24 24"
>
  <path d="M20.52 3.48A11.82 11.82 0 0012.06 0C5.5 0 .16 5.34.16 11.9c0 2.1.55 4.15 1.6 5.97L0 24l6.3-1.65a11.87 11.87 0 005.76 1.47h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.45-8.44zM12.07 21.8a9.82 9.82 0 01-5.01-1.37l-.36-.21-3.74.98 1-3.64-.24-.38a9.8 9.8 0 01-1.5-5.28c0-5.43 4.42-9.85 9.86-9.85 2.63 0 5.1 1.02 6.95 2.89a9.77 9.77 0 012.88 6.95c0 5.44-4.42 9.86-9.84 9.86zm5.4-7.37c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.08-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.62-.92-2.22-.24-.58-.48-.5-.67-.5h-.57c-.2 0-.52.08-.8.38-.28.3-1.05 1.03-1.05 2.5 0 1.48 1.08 2.9 1.23 3.1.15.2 2.13 3.25 5.17 4.55.72.31 1.28.5 1.72.64.72.23 1.38.2 1.9.12.58-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.08-.12-.28-.2-.58-.35z" />
</svg>
                  WhatsApp
                </a>
                <a href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-white text-sm bg-[#0077B5] transition-all hover:scale-105 shadow-lg">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-gradient-to-br from-[#EFF6FF] to-white border border-blue-100 rounded-3xl p-8">
              <h3 className="font-display text-[#0D2B5E] text-xl font-bold mb-6">Send Us a Query</h3>
              {formSent ? (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">✅</div>
                  <h4 className="font-display text-[#0D2B5E] text-xl font-bold">Query Sent!</h4>
                  <p className="text-gray-500 text-sm mt-2">Your email has been sent successfully. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#0D2B5E] text-sm font-bold block mb-1.5">Full Name *</label>
                      <input
                        required
                        type="text"
                        value={contactForm.name}
                        onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20 bg-white"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="text-[#0D2B5E] text-sm font-bold block mb-1.5">Phone Number *</label>
                      <input
                        required
                        type="tel"
                        value={contactForm.phone}
                        onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                        className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20 bg-white"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[#0D2B5E] text-sm font-bold block mb-1.5">Email Address *</label>
                    <input
                      required
                      type="email"
                      value={contactForm.email}
                      onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                      className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20 bg-white"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div>
                    <label className="text-[#0D2B5E] text-sm font-bold block mb-1.5">Your Query *</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full border border-blue-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0D2B5E] focus:ring-2 focus:ring-[#0D2B5E]/20 bg-white resize-none"
                      placeholder="Tell us about your travel plans or insurance needs..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl font-bold text-white transition-all hover:opacity-90 hover:scale-[1.01] shadow-lg text-sm"
                    style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}
                  >
                    📧 Send a Query to <span className="underline">{CONTACT_EMAIL}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'linear-gradient(135deg, #050f1f 0%, #0D2B5E 100%)' }} className="py-10 px-6 text-center">
        <div className="max-w-5xl mx-auto">
          <div className="font-display text-white text-xl font-bold">Peaks & Protection</div>
          <div className="text-[#F47B20] text-xs font-bold tracking-widest uppercase mt-1 mb-4">Insurance & Travel Advisors </div>
          <div className="text-white/50 text-xs">
            © 2026 PNP Advisors. All rights reserved. | <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-[#F47B20] underline">{CONTACT_EMAIL}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
