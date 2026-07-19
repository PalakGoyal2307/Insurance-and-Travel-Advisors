import { useState } from 'react'
import type { PageId } from '../App'
import { buildAutoReplyMessage, sendEmailWithAutoReply } from '../formEmail.ts'
import { CONTACT_EMAIL } from '../constants/contact'

interface Props {
  navigate: (p: PageId) => void
}

type ReligiousPopupType = 'trip-enquiry' | 'plan-pilgrimage'

interface ReligiousFormState {
  name: string
  phone: string
  email: string
  city: string
  pilgrims: string
  travelMonth: string
  specialRequirements: string
}

const religiousTrips = [
  {
    name: 'Char Dham Yatra',
    icon: '⛰️',
    location: 'Uttarakhand',
    img: 'https://images.unsplash.com/photo-1706186839147-0d708602587b?w=700&h=500&fit=crop&auto=format',
    description: 'The most sacred pilgrimage of Hinduism — four holy shrines nestled in the majestic Himalayas. Kedarnath (Lord Shiva), Badrinath (Lord Vishnu), Gangotri (Goddess Ganga), and Yamunotri (Goddess Yamuna).',
    highlights: ['Kedarnath by Helicopter Option', 'VVIP Darshan Arrangements', 'Himalayan Camp Stays', 'Panda / Local Priest Guide', 'Oxygen Kit Included', 'Medical Support Throughout'],
    bestTime: 'May – June & Sep – Oct',
  },
  {
    name: 'Kashi Vishwanath',
    icon: '🪔',
    location: 'Varanasi, Uttar Pradesh',
    img: 'https://images.unsplash.com/photo-1627938823193-fd13c1c867dd?w=700&h=500&fit=crop&auto=format',
    description: 'Visit the eternal city of Varanasi — the oldest living city on Earth. Witness the magnificent Ganga Aarti at Dashashwamedh Ghat, seek blessings at the Kashi Vishwanath Corridor, and take a sacred dip in the holy Ganga.',
    highlights: ['Kashi Vishwanath Corridor VIP Entry', 'Ganga Aarti Boat Ride', 'Sarnath Buddhist Circuit', 'Morning Sunrise Boat Tour', 'Traditional Banarasi Thali', 'Manikarnika Ghat Visit'],
    bestTime: 'Oct – March',
  },
  {
    name: 'Tirupati Balaji',
    icon: '🛕',
    location: 'Andhra Pradesh',
    img: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?w=700&h=500&fit=crop&auto=format',
    description: "Seek blessings at the world's richest and most visited temple — Sri Venkateswara Swamy Temple atop the seven hills of Tirumala. Over 80,000 pilgrims visit daily. PNP Advisors arranges Special Entry Darshan tickets for our clients.",
    highlights: ['Special Entry Darshan Tickets', 'Tirumala Laddu Prasadam', 'Kalyanakatta Hair Offering', 'Padmavathi Temple Visit', 'Accommodation on Tirumala Hill', 'Helicopter Booking Support'],
    bestTime: 'All Year Round',
  },
  {
    name: 'Shirdi Sai Baba',
    icon: '⭐',
    location: 'Shirdi, Maharashtra',
    img: 'https://sai.org.in/sites/default/files/DARSHAN%20QUEUE%20COMPLEX%20SSST%20Web%20Slider.jpg.jpeg',
    description: "Visit the divine abode of Sai Baba in Shirdi — one of India's most visited pilgrimage sites. Experience the magical Kakad Aarti (dawn prayer) and Shej Aarti (night prayer) at the Samadhi Mandir, and feel the spiritual serenity of Shirdi.",
    highlights: ['VIP Darshan Pass', 'All 5 Daily Aartis', 'Dwarkamai Visit', 'Chavadi Night Stay', 'Nashik Trimbakeshwar', 'Shani Shingnapur'],
    bestTime: 'All Year Round',
  },
  {
    name: 'Golden Temple',
    icon: '🌟',
    location: 'Amritsar, Punjab',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBkQTGr8JAbcBLM5cdjDJQ_UGGLvl-bo-CSQFOGCUZXA&s=10',
    description: "Harmandir Sahib — the Golden Temple — is the holiest Gurdwara and the most important pilgrimage site of Sikhism. Its stunning golden facade reflects in the sacred Sarovar (holy pool). Experience the world's largest free community kitchen — Langar.",
    highlights: ['Amrit Vela Morning Prayer', 'Free Langar (Community Meal)', 'Jallianwala Bagh Memorial', 'Wagah Border Ceremony', 'Akal Takht Visit', 'Heritage Walk'],
    bestTime: 'Oct – March',
  },
  {
    name: 'Vrindavan & Mathura',
    icon: '🦚',
    location: 'Uttar Pradesh',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0dfA6KQR36b1b5KwQy3B3XGTCdkvqkXi7MiTleNQVGw&s=10',
    description: 'Walk in the footsteps of Lord Krishna in his birthplace Mathura and his playground Vrindavan. Experience the vibrant Holi and Janmashtami celebrations that are unlike anywhere else in the world. Visit 5,000+ temples in these twin sacred cities.',
    highlights: ['Krishna Janmabhoomi Temple', 'Banke Bihari Temple', 'Prem Mandir Light Show', 'Govardhan Parikrama', 'Yamuna Aarti', 'Braj 84 Kos Yatra'],
    bestTime: 'Oct – March; Holi Season',
  },
  {
    name: 'Ayodhya Ram Mandir',
    icon: '🏛️',
    location: 'Ayodhya, Uttar Pradesh',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdDlMX9se0UayLb4i0iYBepohcbM-waQft6y6MpCQ00g&s=10',
    description: 'Visit the newly consecrated Ram Mandir in Ayodhya — one of the most sacred events in modern Hindu history. The grand temple marks the birthplace of Lord Ram, and draws millions of devotees from across India and the world.',
    highlights: ['Ram Lalla Darshan', 'Ram Ki Paidi Ghat', 'Saryu Aarti', 'Hanuman Garhi Temple', 'Kanak Bhawan', 'Ramayan Circuit Tour'],
    bestTime: 'Oct – April; Ram Navami',
  },
  {
    name: 'Haridwar & Rishikesh',
    icon: '🌊',
    location: 'Uttarakhand',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRChAD3PM9Ze0SrWKcFbQIEGohB1rB2w0XD7XXHXWtyOw&s=10',
    description: 'The gateway to the Himalayas and the yoga capital of the world. Experience the iconic Ganga Aarti at Har Ki Pauri in Haridwar, river rafting on the Ganga in Rishikesh, and the spiritual serenity of the Beatles Ashram.',
    highlights: ['Har Ki Pauri Ganga Aarti', 'River Rafting (Rishikesh)', 'Beatles Ashram', 'Triveni Ghat', 'Laxman Jhula', 'Yoga & Meditation Sessions'],
    bestTime: 'Oct – June; Kumbh Mela',
  },
  {
    name: 'Puri Jagannath',
    icon: '🐚',
    location: 'Odisha',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUHCh-4wVNRStlmz0jLGpBn3RWTt815ITrTMI4AFwcfA&s=10',
    description: 'Seek blessings at the famous Jagannath Temple in Puri — one of the four sacred dhams of Hinduism. Witness the spectacular Rath Yatra festival where massive chariots carry the deities through the city streets attended by millions.',
    highlights: ['Jagannath Temple Darshan', 'Mahaprasad (Temple Food)', 'Chilika Lake Day Trip', 'Puri Golden Beach', 'Konark Sun Temple', 'Rath Yatra Festival'],
    bestTime: 'Oct – March; Rath Yatra in July',
  },
  {
    name: 'Somnath Dwarka',
    icon: '🌊',
    location: 'Gujarat',
    img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZlcexCMpQXPkqLT1qBxyHlaz3hZaVUygUV4y_LGicsA&s=10',
    description: "Visit two of India's most sacred Jyotirlinga — Somnath, the first of 12 Jyotirlingas on the Arabian Sea, and Dwarkadhish Temple in Dwarka, the mystical city of Lord Krishna that allegedly submerged into the sea.",
    highlights: ['Somnath Jyotirlinga Temple', 'Sound & Light Show', 'Dwarkadhish Temple', 'Bet Dwarka Island', 'Nageshwar Jyotirlinga', 'Gir National Park'],
    bestTime: 'Oct – March',
  },
]

export default function ReligiousTripsPage({ navigate }: Props) {
  const [popupType, setPopupType] = useState<ReligiousPopupType | null>(null)
  const [selectedTrip, setSelectedTrip] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSent, setFormSent] = useState(false)
  const [form, setForm] = useState<ReligiousFormState>({
    name: '',
    phone: '',
    email: '',
    city: '',
    pilgrims: '',
    travelMonth: '',
    specialRequirements: '',
  })

  const openReligiousPopup = (type: ReligiousPopupType, tripName = '') => {
    setPopupType(type)
    setSelectedTrip(tripName)
    setFormError('')
    setFormSent(false)
  }

  const closeReligiousPopup = () => {
    setPopupType(null)
    setSelectedTrip('')
    setFormError('')
  }

  const updateForm = (field: keyof ReligiousFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const popupMeta = popupType === 'trip-enquiry'
    ? { title: 'Enquire For Pilgrimage Place', context: 'religious:popup:trip-enquiry', submitLabel: 'Submit Place Enquiry' }
    : { title: 'Plan My Pilgrimage', context: 'religious:popup:plan-pilgrimage', submitLabel: 'Submit Pilgrimage Plan' }

  const handleReligiousSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const name = form.name.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const city = form.city.trim()
    const pilgrims = form.pilgrims.trim()
    const travelMonth = form.travelMonth.trim()
    const specialRequirements = form.specialRequirements.trim()

    if (!popupType) return

    if (!name || !phone || !email) {
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

    const inquiryType = popupType === 'trip-enquiry' ? 'Religious Place Enquiry' : 'Pilgrimage Planning Request'
    const subject = `[${inquiryType}] ${name}${selectedTrip ? ` - ${selectedTrip}` : ''}`
    const fullMessage = [
      `Inquiry Type: ${inquiryType}`,
     
      `Selected Place: ${selectedTrip || 'General Pilgrimage Plan'}`,
      
      `City: ${city || 'N/A'}`,
      `Number of Pilgrims: ${pilgrims || 'N/A'}`,
      `Preferred Travel Month/Dates: ${travelMonth || 'N/A'}`,
      `Special Requirements: ${specialRequirements || 'N/A'}`,
    ].join('\n')

    try {
      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: name,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: 'Thank you for your pilgrimage enquiry - PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(name, fullMessage),
        ownerTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          selected_place: selectedTrip || 'General Pilgrimage Plan',
          city: city || 'N/A',
          pilgrims: pilgrims || 'N/A',
          travel_month: travelMonth || 'N/A',
          requirements: specialRequirements || 'N/A',
        },
        autoReplyTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          selected_place: selectedTrip || 'General Pilgrimage Plan',
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setFormSent(true)
      setForm({
        name: '',
        phone: '',
        email: '',
        city: '',
        pilgrims: '',
        travelMonth: '',
        specialRequirements: '',
      })
      setTimeout(() => {
        closeReligiousPopup()
      }, 1400)
    } catch (error) {
      console.error('Religious query send failed', error)
      window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      closeReligiousPopup()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-20">
      {popupType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closeReligiousPopup}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8 border-b border-amber-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-[#0D2B5E] font-bold">{popupMeta.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">Religious query form with clear context for founder visibility.</p>
                </div>
                <button onClick={closeReligiousPopup} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">✕</button>
              </div>
            </div>

            <form onSubmit={handleReligiousSubmit} className="p-6 sm:p-8 space-y-4">
              {formSent && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Religious query sent successfully.</div>}
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

              <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-[#0D2B5E]">
                Selected Place: <span className="font-bold">{selectedTrip || 'General Pilgrimage Planning'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={form.name} onChange={e => updateForm('name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Full Name*" required />
                <input value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Phone Number*" required />
                <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Email*" required />
                <input value={form.city} onChange={e => updateForm('city', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="City (Optional)" />
                <input value={form.pilgrims} onChange={e => updateForm('pilgrims', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Number of Pilgrims (Optional)" />
                <input value={form.travelMonth} onChange={e => updateForm('travelMonth', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Travel Month / Dates (Optional)" />
              </div>

              <textarea value={form.specialRequirements} onChange={e => updateForm('specialRequirements', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Special Requirements (Optional)" />

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
                {isSubmitting ? 'Sending...' : popupMeta.submitLabel}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative min-h-[22rem] flex items-center justify-center text-center px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0a00, #6b2c00, #F47B20)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='white' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
        <div className="relative z-10">
          <div className="text-6xl mb-4">🕌</div>
          <h1 className="font-display text-4xl sm:text-5xl text-white font-bold mb-3">Religious & Spiritual Trips</h1>
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto">
            Journey to the sacred, the divine, and the eternal. PNP Advisors crafts spiritual pilgrimage tours with VIP darshan arrangements, comfortable stays, and experienced local guides.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 text-[#0D2B5E] font-bold text-sm hover:text-[#F47B20] transition-colors mb-10">
          ← Back to Home
        </button>

        {/* Intro */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8 mb-12 text-center">
          <h2 className="font-display text-2xl text-[#0D2B5E] font-bold mb-3">Your Sacred Journey, Handled with Devotion 🙏</h2>
          <p className="text-gray-700 text-sm leading-relaxed max-w-3xl mx-auto">
            PNP Advisors has successfully facilitated spiritual journeys for thousands of pilgrims across India. We understand the emotional and spiritual significance of these trips, which is why we go beyond logistics — arranging VIP darshan passes, comfortable accommodations near temples, local priests for rituals, and medical support for senior pilgrims.
          </p>
        </div>

        {/* Trips grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14">
          {religiousTrips.map((trip) => (
            <div key={trip.name} className="card-hover bg-white rounded-3xl shadow-xl border border-amber-100 overflow-hidden">
              <div className="relative h-52 bg-gray-200 overflow-hidden">
                <img src={trip.img} alt={trip.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <div className="absolute top-3 left-3 bg-[#F47B20] text-white text-xs font-bold px-3 py-1 rounded-full">
                  {trip.location}
                </div>
                <div className="absolute bottom-3 left-3">
                  <div className="text-3xl">{trip.icon}</div>
                  <div className="font-display text-white text-xl font-bold">{trip.name}</div>
                </div>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{trip.description}</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {trip.highlights.map(h => (
                    <div key={h} className="text-xs text-gray-600 flex items-center gap-1.5">
                      <span className="text-[#F47B20] font-bold">✓</span> {h}
                    </div>
                  ))}
                </div>
                <div className="text-xs text-gray-400 border-t border-gray-100 pt-4 mb-4">
                  <span>📅 Best: {trip.bestTime}</span>
                </div>
                <button
                  onClick={() => openReligiousPopup('trip-enquiry', trip.name)}
                  className="block w-full text-center py-3.5 rounded-2xl font-bold text-white text-sm transition-all hover:opacity-90"
                  style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}
                >
                  🙏 Enquire for {trip.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Why book religious trips with PNP */}
        <div className="bg-gradient-to-br from-[#0D2B5E] to-[#0e4f7a] rounded-3xl p-10 text-white text-center">
          <h3 className="font-display text-3xl font-bold mb-4">Why Pilgrims Trust PNP Advisors 🙏</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { icon: '🎟️', title: 'VIP Darshan', desc: 'Priority entry passes at all major temples — no long queues' },
              { icon: '🧓', title: 'Senior Care', desc: 'Wheelchair assistance, oxygen kits, and medical support throughout' },
              { icon: '🏠', title: 'Sacred Stays', desc: 'Accommodation near temples — dharamshalas to 4-star hotels' },
              { icon: '📿', title: 'Spiritual Guide', desc: 'Experienced local pandits and guides for every ritual and puja' },
            ].map(item => (
              <div key={item.title} className="bg-white/10 rounded-2xl p-5 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="font-bold text-sm mb-1">{item.title}</div>
                <div className="text-white/70 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={() => openReligiousPopup('plan-pilgrimage')} className="inline-block px-10 py-4 rounded-full font-bold text-[#0D2B5E] shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
              📧 Plan My Pilgrimage
            </button>
            <button onClick={() => navigate('travel-cab')} className="inline-block px-10 py-4 rounded-full font-bold text-white border-2 border-white/40 hover:bg-white/10 transition-colors">
              🚘 Private Cab Booking
            </button>
            <a href={`mailto:${CONTACT_EMAIL}`} className="inline-block px-10 py-4 rounded-full font-bold text-white border-2 border-white/40 hover:bg-white/10 transition-colors">
              📧 Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
