import { useState } from 'react'
import type { PageId } from '../App'
import { buildAutoReplyMessage, sendEmailWithAutoReply } from '../formEmail.ts'
import { CONTACT_EMAIL } from '../constants/contact'

interface Props {
  page: PageId
  navigate: (p: PageId) => void
  openQueryForm?: (context?: string) => void
}

type HealthPopupType = 'health-quote' | 'health-consultation'

type LifePopupType = 'life-quote' | 'life-consultation'

type GeneralPopupType = 'general-enquiry' | 'general-audit'

interface HealthFormState {
  fullName: string
  phone: string
  email: string
  city: string
  age: string
  familyMembers: string
  requirements: string
}

interface LifeFormState {
  fullName: string
  phone: string
  email: string
  city: string
  age: string
  annualIncome: string
  requirements: string
}

interface GeneralFormState {
  fullName: string
  phone: string
  email: string
  city: string
  businessType: string
  coverageType: string
  requirements: string
}

function PageHero({ title, subtitle, emoji, bg }: { title: string; subtitle: string; emoji: string; bg: string }) {
  return (
    <div className="relative h-72 sm:h-80 flex items-center justify-center text-center px-4" style={{ background: bg }}>
      <div className="relative z-10">
        <div className="text-6xl mb-4">{emoji}</div>
        <h1 className="font-display text-4xl sm:text-5xl text-white font-bold mb-3">{title}</h1>
        <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto">{subtitle}</p>
      </div>
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E\")" }} />
    </div>
  )
}

function BackBtn({ navigate, to, label }: { navigate: (p: PageId) => void; to: PageId; label: string }) {
  return (
    <button onClick={() => navigate(to)} className="flex items-center gap-2 text-[#0D2B5E] font-bold text-sm hover:text-[#F47B20] transition-colors mb-6">
      ← {label}
    </button>
  )
}

function InsuranceOverview({ navigate, openQueryForm }: { navigate: (p: PageId) => void; openQueryForm?: (context?: string) => void }) {
  return (
    <div className="pt-20">
      <div className="relative min-h-[28rem] flex items-center justify-center text-center px-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #050f1f 0%, #0D2B5E 50%, #0e4f7a 100%)' }}>
        <div className="relative z-10 max-w-3xl">
          <div className="text-6xl mb-4">🛡️</div>
          <h1 className="font-display text-4xl sm:text-5xl text-white font-bold mb-4">Insurance Solutions</h1>
          <p className="text-white/80 text-base sm:text-lg leading-relaxed">
            Protect what matters most. PNP Advisors partners with India&apos;s most trusted insurance brands — Care, LIC & Tata AIG — to offer you comprehensive coverage for health, life, and everything in between.
          </p>
        </div>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='white' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/svg%3E\")" }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-[#0D2B5E] font-bold">Our Insurance Partners</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">We bring you plans from India&apos;s most trusted and highest-rated insurance providers. Select a category to explore plans.</p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#F47B20] to-[#F0C060] mx-auto mt-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {/* Care Health */}
          <div className="card-hover bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            <div className="h-4 w-full" style={{ background: 'linear-gradient(90deg, #FF6B00, #FF9A00)' }} />
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A00)' }}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgpLqxq1LznO6UhVff-_RFoGteMwwe2Gk0qC8p1geKFA&s=10" alt="Care Health Insurance" className="h-12 w-12 object-contain" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=200&h=200&fit=crop' }} />
              </div>
              <div className="mb-1">
                <span className="text-xs text-orange-400 font-bold tracking-widest uppercase">Care Insurance</span>
              </div>
              <h3 className="font-display text-[#0D2B5E] text-2xl font-bold mb-3">Health Insurance</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Comprehensive health coverage for individuals & families. Cashless hospitalization at 16,000+ network hospitals pan-India. No pre-policy medical check-up up to 45 years.
              </p>
              <ul className="space-y-2 mb-6">
                {['Cashless Treatment', 'Pre & Post Hospitalization', 'Day Care Procedures', 'Ambulance Cover', 'Mental Health Cover', 'Annual Health Check-up'].map(f => (
                  <li key={f} className="text-gray-700 text-sm flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('insurance-health')} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A00)' }}>
                Explore Health Plans
              </button>
            </div>
          </div>

          {/* LIC Life */}
          <div className="card-hover bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="h-4 w-full" style={{ background: 'linear-gradient(90deg, #003366, #0066CC)' }} />
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #003366, #0066CC)' }}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXREkopB09rB7EhHxfTIhg2KYxAiD8yblPS21rlaBcUQ&s=10" alt="LIC of India" className="h-12 w-12 object-contain" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=200&h=200&fit=crop' }} />
              </div>
              <div className="mb-1">
                <span className="text-xs text-blue-600 font-bold tracking-widest uppercase">LIC of India</span>
              </div>
              <h3 className="font-display text-[#0D2B5E] text-2xl font-bold mb-3">Life Insurance</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                India&apos;s most trusted life insurer since 1956. LIC provides financial security and peace of mind with a wide range of endowment, term, ULIP, and pension plans.
              </p>
              <ul className="space-y-2 mb-6">
                {['Term Life Plans', 'Endowment Policies', 'ULIP Plans', 'Pension & Retirement', 'Child Plans', 'Whole Life Policy'].map(f => (
                  <li key={f} className="text-gray-700 text-sm flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('insurance-life')} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #003366, #0066CC)' }}>
                Explore LIC Plans
              </button>
            </div>
          </div>

          {/* Tata AIG General */}
          <div className="card-hover bg-white rounded-3xl shadow-xl border border-teal-100 overflow-hidden">
            <div className="h-4 w-full" style={{ background: 'linear-gradient(90deg, #005555, #00897B)' }} />
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #005555, #00897B)' }}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDlEqzARCTyQG4tKytXk7I2Pj74bow96iDaZuGucjBSw&s=10" alt="Tata AIG General Insurance" className="h-12 w-12 object-contain" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=200&h=200&fit=crop' }} />
              </div>
              <div className="mb-1">
                <span className="text-xs text-teal-600 font-bold tracking-widest uppercase">Tata AIG</span>
              </div>
              <h3 className="font-display text-[#0D2B5E] text-2xl font-bold mb-3">General Insurance</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">
                Tata AIG is India&apos;s leading general insurer, a joint venture between Tata Group and American International Group. Protecting your assets, business, and travel globally.
              </p>
              <ul className="space-y-2 mb-6">
                {['Motor Insurance', 'Travel Insurance', 'Home Insurance', 'Commercial Insurance', 'Marine Insurance', 'SME Business Cover'].map(f => (
                  <li key={f} className="text-gray-700 text-sm flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs font-bold shrink-0">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <button onClick={() => navigate('insurance-general')} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #005555, #00897B)' }}>
                Explore General Plans
              </button>
            </div>
          </div>
        </div>

        {/* Why choose us */}
        <div className="bg-gradient-to-br from-[#EFF6FF] to-white border border-blue-100 rounded-3xl p-10">
          <h3 className="font-display text-2xl text-[#0D2B5E] font-bold text-center mb-8">Why Get Insurance Through PNP Advisors?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '🤝', title: 'Unbiased Advice', desc: 'We compare plans across providers to find what truly fits your needs.' },
              { icon: '⚡', title: 'Quick Processing', desc: 'Policy issuance and claims support done swiftly without bureaucracy.' },
              { icon: '📞', title: 'Lifetime Support', desc: 'From purchase to claims, we are always one call away for you.' },
              { icon: '💰', title: 'Best Premiums', desc: 'We negotiate exclusive rates and rebates available only through advisors.' },
            ].map(item => (
              <div key={item.title} className="text-center p-5 bg-white rounded-2xl shadow-sm border border-blue-50">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h4 className="font-display text-[#0D2B5E] font-bold mb-2">{item.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function HealthInsurancePage({ navigate }: { navigate: (p: PageId) => void }) {
  const plans = [
    { name: 'Care Supreme', for: 'Individual', highlights: ['Unlimited Restoration', 'No Sub-limits', 'Global Cover Add-on', 'OPD Included'] },
    { name: 'Care Family Floater', for: 'Family (4 members)', highlights: ['Entire Family Covered', 'Maternity Benefit', 'Newborn Cover', 'Cashless Pan-India'] },
    { name: 'Care Senior', for: 'Senior Citizen (60+)', highlights: ['No Upper Age Limit', 'Pre-existing Disease Cover', 'Ambulance 24/7', 'Second Opinion Cover'] },
    { name: 'Care Critical Illness', for: 'Individual', highlights: ['32 Critical Diseases', 'Lump Sum Payout', 'Cancer & Heart Cover', 'Income Replacement'] },
  ]

  const [popupType, setPopupType] = useState<HealthPopupType | null>(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSent, setFormSent] = useState(false)
  const [form, setForm] = useState<HealthFormState>({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    age: '',
    familyMembers: '',
    requirements: '',
  })

  const openPopup = (type: HealthPopupType, planName = '') => {
    setPopupType(type)
    setSelectedPlan(planName)
    setFormError('')
    setFormSent(false)
  }

  const closePopup = () => {
    setPopupType(null)
    setSelectedPlan('')
    setFormError('')
  }

  const updateForm = (field: keyof HealthFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const popupMeta = popupType === 'health-quote'
    ? { title: 'Get Quote', context: 'insurance:popup:health-quote', submitLabel: 'Submit Quote Request' }
    : { title: 'Free Consultation', context: 'insurance:popup:health-consultation', submitLabel: 'Submit Consultation Request' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const fullName = form.fullName.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const city = form.city.trim()
    const age = form.age.trim()
    const familyMembers = form.familyMembers.trim()
    const requirements = form.requirements.trim()

    if (!popupType) return

    if (!fullName || !phone || !email) {
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

    const inquiryType = popupType === 'health-quote' ? 'Health Insurance Quote Request' : 'Health Insurance Consultation Request'
    const planLabel = selectedPlan || 'General Health Insurance Consultation'
    const subject = `[${inquiryType}] ${fullName} - ${planLabel}`
    const fullMessage = [
      `Inquiry Type: ${inquiryType}`,
      
      `Selected Plan: ${planLabel}`,
      
      `City: ${city || 'N/A'}`,
      `Age: ${age || 'N/A'}`,
      `Family Members: ${familyMembers || 'N/A'}`,
      `Requirements: ${requirements || 'N/A'}`,
    ].join('\n')

    try {
      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: fullName,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: 'Thank you for your health insurance enquiry - PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(fullName, fullMessage),
        ownerTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          selected_plan: planLabel,
          city: city || 'N/A',
          age: age || 'N/A',
          family_members: familyMembers || 'N/A',
          requirements: requirements || 'N/A',
        },
        autoReplyTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          selected_plan: planLabel,
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setFormSent(true)
      setForm({ fullName: '', phone: '', email: '', city: '', age: '', familyMembers: '', requirements: '' })
      setTimeout(() => {
        closePopup()
      }, 1400)
    } catch (error) {
      console.error('Health insurance query send failed', error)
      window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      closePopup()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-20">
      {popupType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closePopup}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8 border-b border-orange-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-[#0D2B5E] font-bold">{popupMeta.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">Health insurance query form with clear context for founder identification.</p>
                </div>
                <button onClick={closePopup} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">✕</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
              {formSent && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Health insurance query sent successfully.</div>}
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

              <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-[#0D2B5E]">
                Selected Plan: <span className="font-bold">{selectedPlan || 'General Health Insurance Consultation'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Full Name*" required />
                <input value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Phone Number*" required />
                <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Email*" required />
                <input value={form.city} onChange={e => updateForm('city', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="City (Optional)" />
                <input value={form.age} onChange={e => updateForm('age', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Age (Optional)" />
                <input value={form.familyMembers} onChange={e => updateForm('familyMembers', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Family Members (Optional)" />
              </div>

              <textarea value={form.requirements} onChange={e => updateForm('requirements', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Requirements / Medical Needs (Optional)" />

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A00)' }}>
                {isSubmitting ? 'Sending...' : popupMeta.submitLabel}
              </button>
            </form>
          </div>
        </div>
      )}

      <PageHero title="Health Insurance" subtitle="Care Insurance — India's Most Comprehensive Health Cover" emoji="❤️" bg="linear-gradient(135deg, #7f1d1d, #FF6B00, #FF9A00)" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="insurance" label="All Insurance Solutions" />

        {/* Care Brand Box */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-3xl p-8 mb-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A00)' }}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgpLqxq1LznO6UhVff-_RFoGteMwwe2Gk0qC8p1geKFA&s=10" alt="Care Health Insurance" className="h-16 w-16 object-contain" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&h=300&fit=crop' }} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-[#0D2B5E] font-bold mb-2">Care Health Insurance</h2>
            <p className="text-gray-700 text-sm leading-relaxed max-w-2xl">
              Formerly Religare Health Insurance, Care Insurance is one of India&apos;s fastest-growing standalone health insurers with <strong>9.8 Crore+ lives covered</strong>, a 95%+ claim settlement ratio, and 16,000+ cashless hospitals. Whether you need basic hospitalisation cover or a comprehensive plan with OPD and international coverage, Care has a plan for you.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {plans.map(plan => (
            <div key={plan.name} className="card-hover bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
              <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">{plan.for}</div>
              <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-1">{plan.name}</h3>
              <ul className="space-y-1.5 mb-5">
                {plan.highlights.map(h => <li key={h} className="text-gray-600 text-xs flex gap-2"><span className="text-orange-400">✓</span>{h}</li>)}
              </ul>
              <button onClick={() => openPopup('health-quote', plan.name)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A00)' }}>
                Get Quote
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[#0D2B5E] to-[#0e4f7a] rounded-3xl p-8 text-white text-center">
          <h3 className="font-display text-2xl font-bold mb-3">Need Help Choosing a Health Plan?</h3>
          <p className="text-white/80 mb-5 text-sm max-w-xl mx-auto">Our insurance advisors will analyse your health profile, family size, and budget to recommend the most suitable Care plan.</p>
          <button onClick={() => openPopup('health-consultation')} className="inline-block px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
            📧 Free Consultation
          </button>
        </div>
      </div>
    </div>
  )
}

function LifeInsurancePage({ navigate }: { navigate: (p: PageId) => void }) {
  const plans = [
    { name: 'Jeevan Anand', type: 'Endowment', maturity: '20 years', features: ['Death + Maturity Benefit', 'Bonus Added Yearly', 'Loan Facility', 'Tax Saving u/s 80C'] },
    { name: 'Tech Term', type: 'Term Plan', maturity: 'Till age 75', features: ['Pure Life Cover', 'High Sum Assured', 'Online Purchase', 'Accidental Rider'] },
    { name: 'New Jeevan Umang', type: 'Whole Life', maturity: 'Whole Life', features: ['Survival Benefits', 'Death Benefit', 'Annual Survival Payout', 'Children Education'] },
    { name: 'Jeevan Labh', type: 'Endowment', maturity: '16/21/25 years', features: ['Guaranteed Additions', 'Flexible Premium Term', 'Rebates Available', 'Joint Life Option'] },
  ]

  const [popupType, setPopupType] = useState<LifePopupType | null>(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSent, setFormSent] = useState(false)
  const [form, setForm] = useState<LifeFormState>({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    age: '',
    annualIncome: '',
    requirements: '',
  })

  const openPopup = (type: LifePopupType, planName = '') => {
    setPopupType(type)
    setSelectedPlan(planName)
    setFormError('')
    setFormSent(false)
  }

  const closePopup = () => {
    setPopupType(null)
    setSelectedPlan('')
    setFormError('')
  }

  const updateForm = (field: keyof LifeFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const popupMeta = popupType === 'life-quote'
    ? { title: 'Get Quote', context: 'insurance:popup:life-quote', submitLabel: 'Submit Quote Request' }
    : { title: 'Book Free LIC Consultation', context: 'insurance:popup:life-consultation', submitLabel: 'Submit Consultation Request' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const fullName = form.fullName.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const city = form.city.trim()
    const age = form.age.trim()
    const annualIncome = form.annualIncome.trim()
    const requirements = form.requirements.trim()

    if (!popupType) return

    if (!fullName || !phone || !email) {
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

    const inquiryType = popupType === 'life-quote' ? 'Life Insurance Quote Request' : 'Life Insurance Consultation Request'
    const planLabel = selectedPlan || 'General LIC Consultation'
    const subject = `[${inquiryType}] ${fullName} - ${planLabel}`
    const fullMessage = [
      `Inquiry Type: ${inquiryType}`,
      `Context: ${popupMeta.context}`,
      `Selected Plan: ${planLabel}`,
      `Full Name: ${fullName}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `City: ${city || 'N/A'}`,
      `Age: ${age || 'N/A'}`,
      `Annual Income: ${annualIncome || 'N/A'}`,
      `Requirements: ${requirements || 'N/A'}`,
    ].join('\n')

    try {
      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: fullName,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: 'Thank you for your life insurance enquiry - PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(fullName, fullMessage),
        ownerTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          selected_plan: planLabel,
          city: city || 'N/A',
          age: age || 'N/A',
          annual_income: annualIncome || 'N/A',
          requirements: requirements || 'N/A',
        },
        autoReplyTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          selected_plan: planLabel,
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setFormSent(true)
      setForm({ fullName: '', phone: '', email: '', city: '', age: '', annualIncome: '', requirements: '' })
      setTimeout(() => {
        closePopup()
      }, 1400)
    } catch (error) {
      console.error('Life insurance query send failed', error)
      window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      closePopup()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-20">
      {popupType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closePopup}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8 border-b border-blue-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-[#0D2B5E] font-bold">{popupMeta.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">Life insurance query form with clear context for founder identification.</p>
                </div>
                <button onClick={closePopup} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">✕</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
              {formSent && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">Life insurance query sent successfully.</div>}
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

              <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-[#0D2B5E]">
                Selected Plan: <span className="font-bold">{selectedPlan || 'General LIC Consultation'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Full Name*" required />
                <input value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Phone Number*" required />
                <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Email*" required />
                <input value={form.city} onChange={e => updateForm('city', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="City (Optional)" />
                <input value={form.age} onChange={e => updateForm('age', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Age (Optional)" />
                <input value={form.annualIncome} onChange={e => updateForm('annualIncome', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Annual Income (Optional)" />
              </div>

              <textarea value={form.requirements} onChange={e => updateForm('requirements', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Requirements / Financial Goals (Optional)" />

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #003366, #0066CC)' }}>
                {isSubmitting ? 'Sending...' : popupMeta.submitLabel}
              </button>
            </form>
          </div>
        </div>
      )}

      <PageHero title="Life Insurance" subtitle="LIC of India — Protecting Generations Since 1956" emoji="🌿" bg="linear-gradient(135deg, #001a33, #003366, #0066CC)" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="insurance" label="All Insurance Solutions" />

        {/* LIC Brand Box */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-3xl p-8 mb-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #003366, #0066CC)' }}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXREkopB09rB7EhHxfTIhg2KYxAiD8yblPS21rlaBcUQ&s=10" alt="LIC of India" className="h-16 w-16 object-contain" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=300&h=300&fit=crop' }} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-[#0D2B5E] font-bold mb-2">Life Insurance Corporation of India</h2>
            <p className="text-gray-700 text-sm leading-relaxed max-w-2xl">
              LIC is India&apos;s largest and most trusted life insurance corporation, founded in 1956 and owned by the Government of India. With <strong>over 28 Crore policies</strong> in force, ₹44 Lakh Crore in life fund, and one of the highest claim settlement ratios in the industry at <strong>98%+</strong>, LIC remains the gold standard in life insurance security.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {plans.map(plan => (
            <div key={plan.name} className="card-hover bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{plan.type}</div>
              <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-1">{plan.name}</h3>
              <div className="text-gray-500 text-xs mb-4">Term: {plan.maturity}</div>
              <ul className="space-y-1.5 mb-5">
                {plan.features.map(f => <li key={f} className="text-gray-600 text-xs flex gap-2"><span className="text-blue-400">✓</span>{f}</li>)}
              </ul>
              <button onClick={() => openPopup('life-quote', plan.name)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, #003366, #0066CC)' }}>
                Get Quote
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-[#0D2B5E] rounded-3xl p-8 text-white text-center">
          <h3 className="font-display text-2xl font-bold mb-3">Secure Your Family&apos;s Future Today</h3>
          <p className="text-white/80 mb-5 text-sm max-w-xl mx-auto">Our LIC advisors will help you choose the best policy based on your financial goals, dependants, and risk appetite.</p>
          <button onClick={() => openPopup('life-consultation')} className="inline-block px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
            📧 Book Free LIC Consultation
          </button>
        </div>
      </div>
    </div>
  )
}

function GeneralInsurancePage({ navigate }: { navigate: (p: PageId) => void }) {
  const plans = [
    { name: 'Motor Insurance', icon: '🚗', desc: 'Comprehensive & third-party car/bike insurance. Cashless repairs at 7,500+ garages. Zero depreciation add-on.', color: '#005555' },
    { name: 'Travel Insurance', icon: '✈️', desc: 'International & domestic travel protection. Trip cancellation, medical emergencies, baggage loss & flight delays covered.', color: '#007B5E' },
    { name: 'Home Insurance', icon: '🏠', desc: 'Protect your home and contents from fire, flood, theft, and natural disasters. Structures and valuables covered.', color: '#005555' },
    { name: 'Commercial Insurance', icon: '🏭', desc: 'Business insurance for shops, offices, factories, and MSMEs. Fire, burglary, liability, and employee cover.', color: '#007B5E' },
    { name: 'Marine Insurance', icon: '🚢', desc: 'Import/export cargo and inland transit insurance for businesses moving goods across India and internationally.', color: '#005555' },
    { name: 'SME & Startup Cover', icon: '📊', desc: 'Comprehensive business insurance bundle for small businesses. Directors liability, cyber cover, and property protection.', color: '#007B5E' },
  ]

  const [popupType, setPopupType] = useState<GeneralPopupType | null>(null)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSent, setFormSent] = useState(false)
  const [form, setForm] = useState<GeneralFormState>({
    fullName: '',
    phone: '',
    email: '',
    city: '',
    businessType: '',
    coverageType: '',
    requirements: '',
  })

  const openPopup = (type: GeneralPopupType, planName = '') => {
    setPopupType(type)
    setSelectedPlan(planName)
    setFormError('')
    setFormSent(false)
  }

  const closePopup = () => {
    setPopupType(null)
    setSelectedPlan('')
    setFormError('')
  }

  const updateForm = (field: keyof GeneralFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const popupMeta = popupType === 'general-enquiry'
    ? { title: 'Enquire Now', context: 'insurance:popup:general-enquiry', submitLabel: 'Submit Enquiry' }
    : { title: 'Free Insurance Audit', context: 'insurance:popup:general-audit', submitLabel: 'Submit Audit Request' }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const fullName = form.fullName.trim()
    const phone = form.phone.trim()
    const email = form.email.trim()
    const city = form.city.trim()
    const businessType = form.businessType.trim()
    const coverageType = form.coverageType.trim()
    const requirements = form.requirements.trim()

    if (!popupType) return

    if (!fullName || !phone || !email) {
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

    const inquiryType = popupType === 'general-enquiry' ? 'General Insurance Enquiry Request' : 'General Insurance Audit Request'
    const planLabel = selectedPlan || 'General Insurance Audit'
    const subject = `[${inquiryType}] ${fullName} - ${planLabel}`
    const fullMessage = [
      `Inquiry Type: ${inquiryType}`,
      `Context: ${popupMeta.context}`,
      `Selected Plan: ${planLabel}`,
      `Full Name: ${fullName}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `City: ${city || 'N/A'}`,
      `Business Type: ${businessType || 'N/A'}`,
      `Coverage Type: ${coverageType || 'N/A'}`,
      `Requirements: ${requirements || 'N/A'}`,
    ].join('\n')

    try {
      const sentByEmailJs = await sendEmailWithAutoReply({
        ownerEmail: CONTACT_EMAIL,
        userEmail: email,
        userName: fullName,
        ownerSubject: subject,
        ownerMessage: fullMessage,
        autoReplySubject: 'Thank you for your general insurance enquiry - PNP Advisors',
        autoReplyMessage: buildAutoReplyMessage(fullName, fullMessage),
        ownerTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          selected_plan: planLabel,
          city: city || 'N/A',
          business_type: businessType || 'N/A',
          coverage_type: coverageType || 'N/A',
          requirements: requirements || 'N/A',
        },
        autoReplyTemplateParams: {
          phone,
          context: popupMeta.context,
          inquiry_type: inquiryType,
          selected_plan: planLabel,
        },
      })

      if (!sentByEmailJs) {
        window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      }

      setFormSent(true)
      setForm({ fullName: '', phone: '', email: '', city: '', businessType: '', coverageType: '', requirements: '' })
      setTimeout(() => {
        closePopup()
      }, 1400)
    } catch (error) {
      console.error('General insurance query send failed', error)
      window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`
      closePopup()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-20">
      {popupType && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={closePopup}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 sm:p-8 border-b border-teal-100">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-[#0D2B5E] font-bold">{popupMeta.title}</h2>
                  <p className="text-gray-500 text-sm mt-1">General insurance query form with clear context for founder identification.</p>
                </div>
                <button onClick={closePopup} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">✕</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
              {formSent && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">General insurance query sent successfully.</div>}
              {formError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>}

              <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-[#0D2B5E]">
                Selected Plan: <span className="font-bold">{selectedPlan || 'General Insurance Audit'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input value={form.fullName} onChange={e => updateForm('fullName', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Full Name*" required />
                <input value={form.phone} onChange={e => updateForm('phone', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Phone Number*" required />
                <input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Email*" required />
                <input value={form.city} onChange={e => updateForm('city', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="City (Optional)" />
                <input value={form.businessType} onChange={e => updateForm('businessType', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Business Type (Optional)" />
                <input value={form.coverageType} onChange={e => updateForm('coverageType', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Coverage Type (Optional)" />
              </div>

              <textarea value={form.requirements} onChange={e => updateForm('requirements', e.target.value)} rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" placeholder="Requirements / Asset Details (Optional)" />

              <button type="submit" disabled={isSubmitting} className="w-full py-3.5 rounded-xl font-bold text-white text-sm disabled:opacity-70" style={{ background: 'linear-gradient(135deg, #005555, #00897B)' }}>
                {isSubmitting ? 'Sending...' : popupMeta.submitLabel}
              </button>
            </form>
          </div>
        </div>
      )}

      <PageHero title="General Insurance" subtitle="Tata AIG — Protecting Assets, Vehicles, Travel & Business" emoji="🏢" bg="linear-gradient(135deg, #001a1a, #005555, #00897B)" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="insurance" label="All Insurance Solutions" />

        {/* Tata AIG Brand Box */}
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-3xl p-8 mb-10 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 shadow-lg" style={{ background: 'linear-gradient(135deg, #005555, #00897B)' }}>
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDlEqzARCTyQG4tKytXk7I2Pj74bow96iDaZuGucjBSw&s=10" alt="Tata AIG General Insurance" className="h-16 w-16 object-contain" onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=300&h=300&fit=crop' }} />
          </div>
          <div>
            <h2 className="font-display text-2xl text-[#0D2B5E] font-bold mb-2">Tata AIG General Insurance</h2>
            <p className="text-gray-700 text-sm leading-relaxed max-w-2xl">
              Tata AIG General Insurance Company is a joint venture between the Tata Group and American International Group (AIG). With a <strong>99%+ claim settlement ratio</strong>, 8,800+ network garages, and 16,000+ healthcare providers, Tata AIG offers comprehensive general insurance solutions for individuals, families, and businesses across India and globally.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {plans.map(plan => (
            <div key={plan.name} className="card-hover bg-white rounded-2xl shadow-lg border border-teal-100 p-6">
              <div className="text-4xl mb-3">{plan.icon}</div>
              <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{plan.desc}</p>
              <button onClick={() => openPopup('general-enquiry', plan.name)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-xs" style={{ background: `linear-gradient(135deg, ${plan.color}, #00897B)` }}>
                Enquire Now
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-teal-900 to-[#005555] rounded-3xl p-8 text-white text-center">
          <h3 className="font-display text-2xl font-bold mb-3">Get the Best Tata AIG Plan for You</h3>
          <p className="text-white/80 mb-5 text-sm max-w-xl mx-auto">Our advisors will assess your assets, business, and travel needs to recommend the most value-for-money Tata AIG plan.</p>
          <button onClick={() => openPopup('general-audit')} className="inline-block px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
            📧 Free Insurance Audit
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InsurancePage({ page, navigate, openQueryForm }: Props) {
  if (page === 'insurance-health') return <HealthInsurancePage navigate={navigate} />
  if (page === 'insurance-life') return <LifeInsurancePage navigate={navigate} />
  if (page === 'insurance-general') return <GeneralInsurancePage navigate={navigate} />
  return <InsuranceOverview navigate={navigate} openQueryForm={openQueryForm} />
}
