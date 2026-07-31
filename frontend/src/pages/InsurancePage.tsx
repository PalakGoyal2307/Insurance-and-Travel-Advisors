import type { PageId } from '../App'
import type { AuthUser } from '../utils/authApi'

interface Props {
  page: PageId
  navigate: (p: PageId) => void
  openQueryForm?: (context?: string) => void
  currentUser: AuthUser | null
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

function openInsuranceForm(action: string, plan = '') {
  const params = new URLSearchParams({ action })
  if (plan) {
    params.set('plan', plan)
  }
  const query = params.toString()
  window.location.href = query ? `/insurance/form?${query}` : '/insurance/form'
}

function InsuranceOverview({ navigate }: { navigate: (p: PageId) => void }) {
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
          <div className="card-hover bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
            <div className="h-4 w-full" style={{ background: 'linear-gradient(90deg, #FF6B00, #FF9A00)' }} />
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A00)' }}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgpLqxq1LznO6UhVff-_RFoGteMwwe2Gk0qC8p1geKFA&s=10" alt="Care Health Insurance" className="h-12 w-12 object-contain" />
              </div>
              <div className="mb-1"><span className="text-xs text-orange-400 font-bold tracking-widest uppercase">Care Insurance</span></div>
              <h3 className="font-display text-[#0D2B5E] text-2xl font-bold mb-3">Health Insurance</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">Comprehensive health coverage for individuals & families.</p>
              <button onClick={() => navigate('insurance-health')} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A00)' }}>
                Explore Health Plans
              </button>
            </div>
          </div>

          <div className="card-hover bg-white rounded-3xl shadow-xl border border-blue-100 overflow-hidden">
            <div className="h-4 w-full" style={{ background: 'linear-gradient(90deg, #003366, #0066CC)' }} />
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #003366, #0066CC)' }}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXREkopB09rB7EhHxfTIhg2KYxAiD8yblPS21rlaBcUQ&s=10" alt="LIC of India" className="h-12 w-12 object-contain" />
              </div>
              <div className="mb-1"><span className="text-xs text-blue-600 font-bold tracking-widest uppercase">LIC of India</span></div>
              <h3 className="font-display text-[#0D2B5E] text-2xl font-bold mb-3">Life Insurance</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">Financial security with trusted LIC plans.</p>
              <button onClick={() => navigate('insurance-life')} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #003366, #0066CC)' }}>
                Explore LIC Plans
              </button>
            </div>
          </div>

          <div className="card-hover bg-white rounded-3xl shadow-xl border border-teal-100 overflow-hidden">
            <div className="h-4 w-full" style={{ background: 'linear-gradient(90deg, #005555, #00897B)' }} />
            <div className="p-8">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden shadow-lg" style={{ background: 'linear-gradient(135deg, #005555, #00897B)' }}>
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDlEqzARCTyQG4tKytXk7I2Pj74bow96iDaZuGucjBSw&s=10" alt="Tata AIG General Insurance" className="h-12 w-12 object-contain" />
              </div>
              <div className="mb-1"><span className="text-xs text-teal-600 font-bold tracking-widest uppercase">Tata AIG</span></div>
              <h3 className="font-display text-[#0D2B5E] text-2xl font-bold mb-3">General Insurance</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-5">Asset and business protection from Tata AIG.</p>
              <button onClick={() => navigate('insurance-general')} className="w-full py-3.5 rounded-2xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #005555, #00897B)' }}>
                Explore General Plans
              </button>
            </div>
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

  return (
    <div className="pt-20">
      <PageHero title="Health Insurance" subtitle="Care Insurance — India's Most Comprehensive Health Cover" emoji="❤️" bg="linear-gradient(135deg, #7f1d1d, #FF6B00, #FF9A00)" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="insurance" label="All Insurance Solutions" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {plans.map(plan => (
            <div key={plan.name} className="card-hover bg-white rounded-2xl shadow-lg border border-orange-100 p-6">
              <div className="text-xs font-bold text-orange-500 uppercase tracking-wider mb-1">{plan.for}</div>
              <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-1">{plan.name}</h3>
              <ul className="space-y-1.5 mb-5">
                {plan.highlights.map(h => <li key={h} className="text-gray-600 text-xs flex gap-2"><span className="text-orange-400">✓</span>{h}</li>)}
              </ul>
              <button onClick={() => openInsuranceForm('health-quote', plan.name)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, #FF6B00, #FF9A00)' }}>
                Get Quote
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[#0D2B5E] to-[#0e4f7a] rounded-3xl p-8 text-white text-center">
          <h3 className="font-display text-2xl font-bold mb-3">Need Help Choosing a Health Plan?</h3>
          <p className="text-white/80 mb-5 text-sm max-w-xl mx-auto">Our insurance advisors will recommend the best fit after reviewing your profile and budget.</p>
          <button onClick={() => openInsuranceForm('health-consultation')} className="inline-block px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
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

  return (
    <div className="pt-20">
      <PageHero title="Life Insurance" subtitle="LIC of India — Protecting Generations Since 1956" emoji="🌿" bg="linear-gradient(135deg, #001a33, #003366, #0066CC)" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="insurance" label="All Insurance Solutions" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {plans.map(plan => (
            <div key={plan.name} className="card-hover bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
              <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">{plan.type}</div>
              <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-1">{plan.name}</h3>
              <div className="text-gray-500 text-xs mb-4">Term: {plan.maturity}</div>
              <ul className="space-y-1.5 mb-5">
                {plan.features.map(f => <li key={f} className="text-gray-600 text-xs flex gap-2"><span className="text-blue-400">✓</span>{f}</li>)}
              </ul>
              <button onClick={() => openInsuranceForm('life-quote', plan.name)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, #003366, #0066CC)' }}>
                Get Quote
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-blue-900 to-[#0D2B5E] rounded-3xl p-8 text-white text-center">
          <h3 className="font-display text-2xl font-bold mb-3">Secure Your Family&apos;s Future Today</h3>
          <p className="text-white/80 mb-5 text-sm max-w-xl mx-auto">Our LIC advisors will help you choose the right policy based on your goals.</p>
          <button onClick={() => openInsuranceForm('life-consultation')} className="inline-block px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
            📧 Book Free LIC Consultation
          </button>
        </div>
      </div>
    </div>
  )
}

function GeneralInsurancePage({ navigate, currentUser }: { navigate: (p: PageId) => void; currentUser: AuthUser | null }) {
  const plans = [
    { name: 'Motor Insurance', icon: '🚗', desc: 'Comprehensive & third-party car/bike insurance.', color: '#005555' },
    { name: 'Travel Insurance', icon: '✈️', desc: 'Trip cancellation, medical emergencies, baggage loss cover.', color: '#007B5E' },
    { name: 'Home Insurance', icon: '🏠', desc: 'Protection for home structure and contents.', color: '#005555' },
    { name: 'Commercial Insurance', icon: '🏭', desc: 'Business cover for shops, offices, and MSMEs.', color: '#007B5E' },
    { name: 'Marine Insurance', icon: '🚢', desc: 'Cargo and inland transit coverage.', color: '#005555' },
    { name: 'SME & Startup Cover', icon: '📊', desc: 'Business bundle cover with liability options.', color: '#007B5E' },
  ]

  return (
    <div className="pt-20">
      <PageHero title="General Insurance" subtitle="Tata AIG — Protecting Assets, Vehicles, Travel & Business" emoji="🏢" bg="linear-gradient(135deg, #001a1a, #005555, #00897B)" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="insurance" label="All Insurance Solutions" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {plans.map(plan => (
            <div key={plan.name} className="card-hover bg-white rounded-2xl shadow-lg border border-teal-100 p-6">
              <div className="text-4xl mb-3">{plan.icon}</div>
              <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{plan.desc}</p>
              <button onClick={() => {
                if (!currentUser) {
                  navigate('login')
                  return
                }
                openInsuranceForm('general-enquiry', plan.name)
              }} className="block w-full text-center py-3 rounded-xl font-bold text-white text-xs" style={{ background: `linear-gradient(135deg, ${plan.color}, #00897B)` }}>
                Enquire Now
              </button>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-teal-900 to-[#005555] rounded-3xl p-8 text-white text-center">
          <h3 className="font-display text-2xl font-bold mb-3">Get the Best Tata AIG Plan for You</h3>
          <p className="text-white/80 mb-5 text-sm max-w-xl mx-auto">We will assess your assets and business risk profile for better coverage decisions.</p>
          <button onClick={() => {
            if (!currentUser) {
              navigate('login')
              return
            }
            openInsuranceForm('general-audit')
          }} className="inline-block px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
            📧 Free Insurance Audit
          </button>
        </div>
      </div>
    </div>
  )
}

export default function InsurancePage({ page, navigate, openQueryForm: _openQueryForm, currentUser }: Props) {
  if (page === 'insurance-health') return <HealthInsurancePage navigate={navigate} />
  if (page === 'insurance-life') return <LifeInsurancePage navigate={navigate} />
  if (page === 'insurance-general') return <GeneralInsurancePage navigate={navigate} currentUser={currentUser} />
  return <InsuranceOverview navigate={navigate} />
}
