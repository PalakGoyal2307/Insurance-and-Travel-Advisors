import { useRef, useState } from 'react'
import type { PageId } from '../App'
import LogoMark from './LogoMark'

interface Props {
  navigate: (p: PageId) => void
  openQueryForm?: (context?: string) => void
  currentPage?: PageId
}

const travelItems: { id: PageId; label: string }[] = [
  { id: 'travel-international', label: '🌍 International Tour Packages' },
  { id: 'travel-domestic', label: '🇮🇳 Domestic Tour Packages' },
  { id: 'travel-honeymoon', label: '💑 Honeymoon Packages' },
  { id: 'travel-flights', label: '✈️ Flight / Train / Bus Ticket Booking' },
  { id: 'travel-cab', label: '🚘 Private Cab Booking' },
  { id: 'travel-hotels', label: '🏨 Hotel / Villa Reservations' },
  { id: 'religious', label: '🕌 Religious & Spiritual Trips' },
  { id: 'corporate', label: '💼 Corporate Tours' },
]

const insuranceItems: { id: PageId; label: string }[] = [
  { id: 'insurance-health', label: '❤️ Health Insurance ' },
  { id: 'insurance-life', label: '🌿 Life Insurance ' },
  { id: 'insurance-general', label: '🏢 General Insurance ' },
]

export default function Navbar({ navigate, openQueryForm }: Props) {
  const [travelOpen, setTravelOpen] = useState(false)
  const [insuranceOpen, setInsuranceOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileTravel, setMobileTravel] = useState(false)
  const [mobileInsurance, setMobileInsurance] = useState(false)
  const travelCloseTimer = useRef<number | null>(null)
  const insuranceCloseTimer = useRef<number | null>(null)

  const clearTravelCloseTimer = () => {
    if (travelCloseTimer.current) {
      window.clearTimeout(travelCloseTimer.current)
      travelCloseTimer.current = null
    }
  }

  const clearInsuranceCloseTimer = () => {
    if (insuranceCloseTimer.current) {
      window.clearTimeout(insuranceCloseTimer.current)
      insuranceCloseTimer.current = null
    }
  }

  const openTravelMenu = () => {
    clearTravelCloseTimer()
    setTravelOpen(true)
    setInsuranceOpen(false)
  }

  const closeTravelMenuDelayed = () => {
    clearTravelCloseTimer()
    travelCloseTimer.current = window.setTimeout(() => setTravelOpen(false), 220)
  }

  const openInsuranceMenu = () => {
    clearInsuranceCloseTimer()
    setInsuranceOpen(true)
    setTravelOpen(false)
  }

  const closeInsuranceMenuDelayed = () => {
    clearInsuranceCloseTimer()
    insuranceCloseTimer.current = window.setTimeout(() => setInsuranceOpen(false), 220)
  }

  const goHome = () => {
    navigate('home')
    setMobileOpen(false)
  }

  const goTravel = () => {
    navigate('travel')
    setTravelOpen(false)
    setInsuranceOpen(false)
  }

  const goInsurance = () => {
    navigate('insurance')
    setInsuranceOpen(false)
    setTravelOpen(false)
  }

  const scrollToContact = () => {
    navigate('home')
    setMobileOpen(false)
    setTimeout(() => {
      document.getElementById('contact-section')?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-lg shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">

          {/* Logo */}
          <button onClick={goHome} className="flex items-center gap-2 sm:gap-3 min-w-0">
            <LogoMark className="shrink-0" sizeClassName="w-22 h-14" />
            <div className="text-left leading-none min-w-0">
              <div className="font-display text-[#0D2B5E] text-base sm:text-xl font-bold leading-tight">Peaks & Protection</div>
              <div className="text-[#F47B20] text-[10px] sm:text-xs font-bold tracking-[0.14em] sm:tracking-widest uppercase mt-0.5 leading-tight">Insurance & Travel Advisors</div>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center gap-1">

            {/* Travel Solutions */}
            <div
              className="relative"
              onMouseEnter={openTravelMenu}
              onMouseLeave={closeTravelMenuDelayed}
            >
              <button
                onClick={goTravel}
                className="flex items-center gap-1.5 px-4 py-2.5 text-[#0D2B5E] font-bold text-sm hover:text-[#F47B20] transition-colors rounded-xl hover:bg-blue-50"
              >
                <span>✈️</span> Travel Solutions
                <svg className={`w-3.5 h-3.5 transition-transform ${travelOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {travelOpen && (
                <div
                  className="nav-dropdown absolute top-full left-0 pt-2 w-80"
                  onMouseEnter={openTravelMenu}
                  onMouseLeave={closeTravelMenuDelayed}
                >
                  <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
                    <div className="p-2">
                      {travelItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => { navigate(item.id); setTravelOpen(false) }}
                          className="w-full text-left px-4 py-3 text-[#0D2B5E] hover:bg-blue-50 hover:text-[#F47B20] rounded-xl transition-all font-semibold text-sm"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Insurance Solutions */}
            <div
              className="relative"
              onMouseEnter={openInsuranceMenu}
              onMouseLeave={closeInsuranceMenuDelayed}
            >
              <button
                onClick={goInsurance}
                className="flex items-center gap-1.5 px-4 py-2.5 text-[#0D2B5E] font-bold text-sm hover:text-[#F47B20] transition-colors rounded-xl hover:bg-blue-50"
              >
                <span>🛡️</span> Insurance Solutions
                <svg className={`w-3.5 h-3.5 transition-transform ${insuranceOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {insuranceOpen && (
                <div
                  className="nav-dropdown absolute top-full left-0 pt-2 w-80"
                  onMouseEnter={openInsuranceMenu}
                  onMouseLeave={closeInsuranceMenuDelayed}
                >
                  <div className="bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden">
                    <div className="p-2">
                      {insuranceItems.map(item => (
                        <button
                          key={item.id}
                          onClick={() => { navigate(item.id); setInsuranceOpen(false) }}
                          className="w-full text-left px-4 py-3 text-[#0D2B5E] hover:bg-blue-50 hover:text-[#F47B20] rounded-xl transition-all font-semibold text-sm"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => openQueryForm?.('navbar-query')}
              className="px-4 py-2.5 text-[#0D2B5E] font-bold text-sm hover:text-[#F47B20] transition-colors rounded-xl hover:bg-blue-50"
            >
              📧 Send a Query
            </button>

            <button
              onClick={scrollToContact}
              className="ml-2 px-6 py-2.5 rounded-full font-bold text-sm text-white transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}
            >
              Contact Us
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="xl:hidden shrink-0 p-2 rounded-xl text-[#0D2B5E] hover:bg-blue-50 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="xl:hidden bg-white border-t border-blue-100 max-h-[80vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            <button onClick={goHome} className="block w-full text-left py-3 px-4 text-[#0D2B5E] font-bold rounded-xl hover:bg-blue-50">🏠 Home</button>

            {/* Travel accordion */}
            <div>
              <button
                onClick={() => setMobileTravel(!mobileTravel)}
                className="flex items-center justify-between w-full py-3 px-4 text-[#0D2B5E] font-bold rounded-xl hover:bg-blue-50"
              >
                <span>✈️ Travel Solutions</span>
                <svg className={`w-4 h-4 transition-transform ${mobileTravel ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileTravel && (
                <div className="ml-4 space-y-1">
                  <button onClick={() => { navigate('travel'); setMobileOpen(false) }} className="block w-full text-left py-2.5 px-4 text-[#0D2B5E] font-semibold text-sm rounded-xl hover:bg-blue-50 hover:text-[#F47B20]">All Travel Solutions</button>
                  {travelItems.map(item => (
                    <button key={item.id} onClick={() => { navigate(item.id); setMobileOpen(false) }} className="block w-full text-left py-2.5 px-4 text-gray-600 text-sm rounded-xl hover:bg-blue-50 hover:text-[#F47B20]">{item.label}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Insurance accordion */}
            <div>
              <button
                onClick={() => setMobileInsurance(!mobileInsurance)}
                className="flex items-center justify-between w-full py-3 px-4 text-[#0D2B5E] font-bold rounded-xl hover:bg-blue-50"
              >
                <span>🛡️ Insurance Solutions</span>
                <svg className={`w-4 h-4 transition-transform ${mobileInsurance ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {mobileInsurance && (
                <div className="ml-4 space-y-1">
                  <button onClick={() => { navigate('insurance'); setMobileOpen(false) }} className="block w-full text-left py-2.5 px-4 text-[#0D2B5E] font-semibold text-sm rounded-xl hover:bg-blue-50 hover:text-[#F47B20]">All Insurance Solutions</button>
                  {insuranceItems.map(item => (
                    <button key={item.id} onClick={() => { navigate(item.id); setMobileOpen(false) }} className="block w-full text-left py-2.5 px-4 text-gray-600 text-sm rounded-xl hover:bg-blue-50 hover:text-[#F47B20]">{item.label}</button>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { setMobileOpen(false); openQueryForm?.('navbar-query') }} className="block w-full text-left py-3 px-4 text-[#0D2B5E] font-bold rounded-xl hover:bg-blue-50">📧 Send a Query</button>
            <button onClick={scrollToContact} className="block w-full py-3 px-4 rounded-xl font-bold text-white text-center" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>Contact Us</button>
          </div>
        </div>
      )}
    </nav>
  )
}
