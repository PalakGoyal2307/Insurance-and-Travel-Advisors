import { useMemo } from 'react'
import type { PageId } from '../App'
import { CONTACT_EMAIL, PHONE_NUMBER, PHONE_TEL } from '../constants/contact'
import type { AuthUser } from '../utils/authApi'
import { localPhoto } from '../assets/localPhoto'

interface Props {
  page: PageId
  navigate: (p: PageId) => void
  openQueryForm?: (context?: string) => void
  currentUser: AuthUser | null
}

function PageHero({ title, subtitle, img, emoji }: { title: string; subtitle: string; img: string; emoji: string }) {
  return (
    <div className="relative h-72 sm:h-96 bg-gray-800 overflow-hidden">
      <img src={img} alt={title} className="w-full h-full object-cover opacity-70" />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(13,43,94,0.6), rgba(13,43,94,0.85))' }} />
      <div className="absolute inset-0 flex items-center justify-center text-center px-4">
        <div>
          <div className="text-6xl mb-4">{emoji}</div>
          <h1 className="font-display text-4xl sm:text-5xl text-white font-bold mb-3">{title}</h1>
          <p className="text-white/80 text-base sm:text-lg max-w-xl mx-auto">{subtitle}</p>
        </div>
      </div>
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

function TravelOverview({ navigate, openQueryForm, openTravelForm }: { navigate: (p: PageId) => void; openQueryForm?: (context?: string) => void; openTravelForm: (action: string, pkg?: string) => void }) {
  const services = [
    { id: 'travel-international' as PageId, icon: '🌍', title: 'International Tour Packages', desc: 'Europe, Asia, America, Australia & beyond. Fully customised group and private tours with expert guides, luxury stays, and seamless logistics handled end-to-end by our team.', img: localPhoto("travel-international.avif"), highlights: ['Visa Assistance', 'Guided Tours', '4★/5★ Hotels', 'Travel Insurance'] },
    { id: 'travel-domestic' as PageId, icon: '🇮🇳', title: 'Domestic Tour Packages', desc: "Explore incredible India from Goa's golden beaches to Kashmir's snow-capped peaks. Our domestic packages cover every corner of India with comfort and care.", img: localPhoto("travel-domestic.avif"), highlights: ['All-India Coverage', 'Budget to Luxury', 'Local Guides', 'Flexible Itineraries'] },
    { id: 'travel-honeymoon' as PageId, icon: '💑', title: 'Honeymoon Packages', desc: 'Begin your forever beautifully. We craft personalised romantic getaways to destinations like Maldives, Bali, Paris, Kerala, and Switzerland with special surprises curated for newlyweds.', img: localPhoto("Honeymoon Packages.avif"), highlights: ['Romantic Setups', 'Candlelight Dinners', 'Couple Spa', 'Honeymoon Suites'] },
    { id: 'travel-flights' as PageId, icon: '✈️', title: 'Flight / Train / Bus Ticket Booking', desc: 'Instant ticket booking for flights, trains, and buses across India and internationally. We find the best fares, handle seat preferences, and ensure smooth transitions between your travel legs.', img: localPhoto("Seamless ticket bookings for all modes of travel.webp"), highlights: ['Best Fare Guarantee', 'All Airlines', 'Train & Bus Tickets', 'Instant Confirmation'] },
    { id: 'travel-cab' as PageId, icon: '🚘', title: 'Private Cab Booking', desc: 'Book airport pickups, local city rides, outstation cabs, and hourly rentals with trusted drivers and comfortable vehicles.', img: localPhoto("Private Cab Booking.avif"), highlights: ['Airport Transfers', 'Outstation Trips', 'Hourly Rentals', 'AC Cars & SUVs'] },
    { id: 'travel-hotels' as PageId, icon: '🏨', title: 'Hotel & Villa Reservations', desc: "From cozy budget stays to ultra-luxury 5-star resorts and private villas — we curate accommodations that match your taste, budget, and destination perfectly.", img: localPhoto("Hotel & Villa Reservations.avif"), highlights: ['Exclusive Deals', 'Early Check-in', 'Room Upgrades', 'All Categories'] },
    { id: 'religious' as PageId, icon: '🕌', title: 'Religious & Spiritual Trips', desc: 'Sacred pilgrimages, temple tours, and spiritual journeys with VIP arrangements and care.', img: localPhoto("religious.jpeg"), highlights: ['VIP Darshan', 'Senior Support', 'Comfort Stays', 'Spiritual Guidance'] },
    { id: 'corporate' as PageId, icon: '💼', title: 'Corporate Tours', desc: 'Team outings, incentive tours, and MICE events with end-to-end professional management.', img: localPhoto("corporate.avif"), highlights: ['Team Retreats', 'Incentive Trips', 'MICE Events', 'Dedicated Support'] },
  ]

  return (
    <div className="pt-20">
      <PageHero
        title="Travel Solutions"
        subtitle="Your complete travel partner — from flights to hotels, domestic to international, budget to luxury"
        img={localPhoto('Travel Solutions.avif')}
        emoji="✈️"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl sm:text-4xl text-[#0D2B5E] font-bold">Everything You Need for Travel</h2>
          <p className="text-gray-500 mt-3 max-w-2xl mx-auto">PNP Advisors handles every aspect of your journey — planning, booking, accommodation, and beyond. Select any service below to learn more.</p>
          <div className="w-20 h-1 bg-linear-to-r from-[#F47B20] to-[#F0C060] mx-auto mt-4 rounded-full" />
        </div>
        <div className="space-y-8">
          {services.map((svc, i) => (
            <div key={svc.id} className={`card-hover bg-white rounded-3xl shadow-lg border border-blue-100 overflow-hidden flex flex-col ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
              <div className="md:w-2/5 h-56 md:h-auto bg-gray-200 overflow-hidden shrink-0">
                <img src={svc.img} alt={svc.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-8 flex flex-col justify-center">
                <div className="text-4xl mb-3">{svc.icon}</div>
                <h3 className="font-display text-[#0D2B5E] text-2xl font-bold mb-3">{svc.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{svc.desc}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {svc.highlights.map(h => (
                    <span key={h} className="bg-blue-50 text-[#0D2B5E] text-xs font-bold px-3 py-1.5 rounded-full border border-blue-100">✓ {h}</span>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => navigate(svc.id)} className="px-6 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
                    Explore {svc.title.split(' ')[0]}
                  </button>
                  {svc.id === 'travel-international' ? (
                    <button onClick={() => openTravelForm('travel-overview-intl-enquire', 'International Tours - Travel')} className="px-6 py-3 rounded-full font-bold text-[#F47B20] text-sm border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all">
                      Enquire Now
                    </button>
                  ) : svc.id === 'travel-domestic' ? (
                    <button onClick={() => openTravelForm('travel-overview-dom-enquire', 'Domestic Tours - Travel')} className="px-6 py-3 rounded-full font-bold text-[#F47B20] text-sm border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all">
                      Enquire Now
                    </button>
                  ) : svc.id === 'travel-hotels' ? (
                    <button onClick={() => openTravelForm('travel-overview-hotel-enquire', 'Hotel & Villa - Travel')} className="px-6 py-3 rounded-full font-bold text-[#F47B20] text-sm border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all">
                      Enquire Now
                    </button>
                  ) : svc.id === 'travel-honeymoon' ? (
                    <button onClick={() => openTravelForm('travel-overview-honeymoon-enquire', 'Honeymoon Packages - Travel')} className="px-6 py-3 rounded-full font-bold text-[#F47B20] text-sm border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all">
                      Enquire Now
                    </button>
                  ) : svc.id === 'travel-flights' ? (
                    <button onClick={() => openTravelForm('travel-overview-flights-enquire', 'Flight / Train / Bus - Travel')} className="px-6 py-3 rounded-full font-bold text-[#F47B20] text-sm border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all">
                      Enquire Now
                    </button>
                  ) : svc.id === 'travel-cab' ? (
                    <button onClick={() => openTravelForm('cab-enquire-now', 'Private Cab Booking')} className="px-6 py-3 rounded-full font-bold text-[#F47B20] text-sm border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all">
                      Enquire Now
                    </button>
                  ) : svc.id === 'religious' ? (
                    <button onClick={() => openTravelForm('religious-enquire-now', 'Religious & Spiritual Trips')} className="px-6 py-3 rounded-full font-bold text-[#F47B20] text-sm border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all">
                      Enquire Now
                    </button>
                  ) : svc.id === 'corporate' ? (
                    <button onClick={() => openTravelForm('corporate-enquire-now', 'Corporate Trip')} className="px-6 py-3 rounded-full font-bold text-[#F47B20] text-sm border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all">
                      Enquire Now
                    </button>
                  ) : (
                    <button onClick={() => openQueryForm?.(`travel:${svc.title}`)} className="px-6 py-3 rounded-full font-bold text-[#F47B20] text-sm border-2 border-[#F47B20] hover:bg-[#F47B20] hover:text-white transition-all">
                      Enquire Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InternationalPage({ navigate, openTravelForm }: { navigate: (p: PageId) => void; openTravelForm: (action: string, pkg?: string) => void }) {
  const packages = [
    { name: 'Europe Splendour', countries: 'France · Italy · Switzerland', img: localPhoto("Europe Splendour.avif"), badge: '🔥 Most Popular' },
    { name: 'Maldives Escape', countries: 'Maldives', img: localPhoto("Maldives Escape.avif"), badge: '💑 Best for Honeymoon' },
    { name: 'Dubai Extravaganza', countries: 'UAE', img: localPhoto("Dubai Extravaganza.avif"), badge: '⭐ Premium' },
    { name: 'South East Asia', countries: 'Thailand · Singapore · Bali', img: localPhoto("South East Asia.avif"), badge: '🎯 Value Deal' },
    { name: 'Japan Discovery', countries: 'Japan', img: localPhoto("Japan Discovery.avif"), badge: '✨ Cultural Experience' },
    { name: 'Switzerland Alps', countries: 'Switzerland', img: localPhoto("Switzerland Alps.avif"), badge: '❄️ Winter Special' },
  ]

  return (
    <div className="pt-20">
      <PageHero title="International Tours" subtitle="Explore the world with expert guidance and curated experiences" img={localPhoto('International Tours.avif')} emoji="🌍" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="travel" label="All Travel Solutions" />
        <div className="mb-10">
          <h2 className="font-display text-3xl text-[#0D2B5E] font-bold mb-3">International Tour Packages</h2>
          <p className="text-gray-600 max-w-3xl leading-relaxed">
            Discover the world&apos;s most breathtaking destinations with PNP Advisors. We offer fully customised international packages covering visa assistance, flights, stays, guided tours, and travel insurance — so you travel worry-free.
          </p>
          <button onClick={() => openTravelForm('intl-enquire-now')} className="mt-5 inline-block px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
            Enquire Now
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {packages.map(pkg => (
            <div key={pkg.name} className="card-hover bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img src={pkg.img} alt={pkg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 bg-[#F47B20] text-white text-xs font-bold px-3 py-1 rounded-full">{pkg.badge}</div>
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="font-display font-bold text-lg">{pkg.name}</div>
                  <div className="text-white/80 text-xs">{pkg.countries}</div>
                </div>
              </div>
              <div className="p-5">
                <button onClick={() => openTravelForm('intl-quote', pkg.name)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-sm transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
                  Book Now / Enquire
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-linear-to-br from-[#0D2B5E] to-[#0e4f7a] rounded-3xl p-8 text-white text-center">
          <h3 className="font-display text-2xl font-bold mb-3">Need a Custom International Package?</h3>
          <p className="text-white/80 mb-5 max-w-xl mx-auto text-sm">Tell us your dream destination, budget, and dates — we will craft a bespoke itinerary just for you.</p>
          <button onClick={() => openTravelForm('intl-custom-package', 'Custom International Package')} className="inline-block px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] transition-all hover:scale-105 shadow-xl" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
            📧 Request Custom Package
          </button>
        </div>
      </div>
    </div>
  )
}

function DomesticPage({ navigate, openTravelForm }: { navigate: (p: PageId) => void; openTravelForm: (action: string, pkg?: string) => void }) {
  const packages = [
    { name: 'Kerala Backwaters', region: 'South India', img: localPhoto("Kerala Backwaters.avif"), badge: '🌿 Nature' },
    { name: 'Rajasthan Royal', region: 'West India', img: localPhoto("Rajasthan Royal.jpeg"), badge: '👑 Heritage' },
    { name: 'Goa Beach Getaway', region: 'West India', img: localPhoto("Goa Beach Getaway.avif"), badge: '🏖️ Beach Fun' },
    { name: 'Manali Adventure', region: 'North India', img: localPhoto("Manali Adventure.avif"), badge: '⛷️ Adventure' },
    { name: 'Golden Triangle', region: 'North India', img: localPhoto("Golden Triangle.avif"), badge: '🏛️ Iconic' },
    { name: 'Andaman Islands', region: 'Islands', img: localPhoto("Andaman Islands.jpeg"), badge: '🐠 Exotic' },
  ]

  return (
    <div className="pt-20">
      <PageHero title="Domestic Tours" subtitle="Explore the incredible diversity of Incredible India" img={localPhoto('Domestic Tours.avif')} emoji="🇮🇳" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="travel" label="All Travel Solutions" />
        <div className="mb-10">
          <h2 className="font-display text-3xl text-[#0D2B5E] font-bold mb-3">Domestic Tour Packages</h2>
          <p className="text-gray-600 max-w-3xl leading-relaxed">
            India is a land of a thousand stories. From the snow-covered peaks of the Himalayas to the palm-fringed beaches of Kerala, from the golden sands of Rajasthan to the lush backwaters of Alleppey — PNP Advisors covers every incredible inch of this beautiful country.
          </p>
          <button onClick={() => openTravelForm('dom-enquire-now')} className="mt-5 inline-block px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
            Enquire Now
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {packages.map(pkg => (
            <div key={pkg.name} className="card-hover bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img src={pkg.img} alt={pkg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 bg-[#F47B20] text-white text-xs font-bold px-3 py-1 rounded-full">{pkg.badge}</div>
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="font-display font-bold text-lg">{pkg.name}</div>
                  <div className="text-white/80 text-xs">📍 {pkg.region}</div>
                </div>
              </div>
              <div className="p-5">
                <button onClick={() => openTravelForm('dom-quote', pkg.name)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
                  Book Now / Enquire
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-linear-to-br from-[#EFF6FF] to-white border border-blue-100 rounded-3xl p-8 text-center">
          <h3 className="font-display text-2xl text-[#0D2B5E] font-bold mb-3">Plan a Custom India Trip</h3>
          <p className="text-gray-500 mb-5 text-sm max-w-xl mx-auto">Tell us where in India you want to explore — we will design the perfect itinerary for your group, family, or solo journey.</p>
          <button onClick={() => openTravelForm('dom-custom-package', 'Custom Domestic Itinerary')} className="inline-block px-8 py-3.5 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
            📧 Get Custom Itinerary
          </button>
        </div>
      </div>
    </div>
  )
}

function HoneymoonPage({ navigate, openTravelForm }: { navigate: (p: PageId) => void; openTravelForm: (action: string, pkg?: string) => void }) {
  const packages = [
    { name: 'Maldives Bliss', for: 'couple', img: localPhoto("Maldives Bliss.avif"), features: ['Overwater Bungalow', 'Sunset Cruise', 'Couple Spa', 'Candlelight Dinner'] },
    { name: 'Bali Romance', for: 'couple', img: localPhoto("Bali Romance.avif"), features: ['Private Villa Pool', 'Temple Tour', 'Rice Terrace Walk', 'Balinese Massage'] },
    { name: 'Paris in Love', for: 'couple', img: localPhoto("Paris in Love.jpeg"), features: ['Eiffel Tower Night', 'Seine River Cruise', 'Wine & Cheese Tour', 'Champs-Élysées'] },
    { name: 'Kerala Enchant', for: 'couple', img: localPhoto("Kerala Enchant.avif"), features: ['Houseboat Stay', 'Ayurvedic Spa', 'Tea Garden Walk', 'Beach Sunset'] },
    { name: 'Swiss Alps Escape', for: 'couple', img: localPhoto("Swiss Alps Escape.avif"), features: ['Mountain Cable Car', 'Chocolate Factory', 'Lake Geneva Cruise', 'Ski Adventure'] },
    { name: 'Shimla-Manali Duo', for: 'couple', img: localPhoto("Shimla-Manali Duo.avif"), features: ['Snow Play', 'Rohtang Pass', 'Romantic Bonfire', 'Solang Valley'] },
  ]

  return (
    <div className="pt-20">
      <PageHero title="Honeymoon Packages" subtitle="Begin forever beautifully — romantic getaways curated with love" img={localPhoto('Honeymoon Packages.avif')} emoji="💑" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="travel" label="All Travel Solutions" />
        <div className="mb-10 max-w-3xl">
          <h2 className="font-display text-3xl text-[#0D2B5E] font-bold mb-3">Honeymoon Packages</h2>
          <p className="text-gray-600 leading-relaxed">
            Your love story deserves the perfect setting. PNP Advisors crafts personalised honeymoon experiences with handpicked romantic stays, couple-exclusive activities, surprise arrangements, and memories that last a lifetime. Let us handle every detail while you focus on each other.
          </p>
          <button onClick={() => openTravelForm('honeymoon-enquire-now')} className="mt-5 inline-block px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
            Enquire Now
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {packages.map(pkg => (
            <div key={pkg.name} className="card-hover bg-white rounded-2xl shadow-lg border border-rose-100 overflow-hidden">
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img src={pkg.img} alt={pkg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">💑 Couple</div>
                <div className="absolute bottom-3 left-3 text-white font-display font-bold text-lg">{pkg.name}</div>
              </div>
              <div className="p-5">
                <div className="grid grid-cols-2 gap-1.5 mb-4">
                  {pkg.features.map(f => <div key={f} className="text-gray-600 text-xs flex items-center gap-1"><span className="text-rose-400">♥</span> {f}</div>)}
                </div>
                <button onClick={() => openTravelForm('honeymoon-book-package', pkg.name)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #be185d, #ec4899)' }}>
                  Book Romantic Package ❤️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function FlightsPage({ navigate, openTravelForm }: { navigate: (p: PageId) => void; openTravelForm: (action: string, pkg?: string) => void }) {
  return (
    <div className="pt-20">
      <PageHero title="Flight / Train / Bus Ticket Booking" subtitle="Seamless ticket bookings for all modes of travel" img={localPhoto('Seamless ticket bookings for all modes of travel.webp')} emoji="✈️" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="travel" label="All Travel Solutions" />
        <div className="mb-12 max-w-3xl">
          <h2 className="font-display text-3xl text-[#0D2B5E] font-bold mb-3">Hassle-Free Ticket Bookings</h2>
          <p className="text-gray-600 leading-relaxed">
            We handle all your transportation needs with precision. Whether it is an international flight, an AC train berth, or a luxury bus — PNP Advisors ensures you get the best seats at the best prices with zero stress.
          </p>
          <button onClick={() => openTravelForm('flights-enquire-now')} className="mt-5 inline-block px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
            Enquire Now
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {[
            { icon: '✈️', type: 'Flight Bookings', color: '#0D2B5E', img: localPhoto("Flight Bookings.avif"), points: ['Domestic & International', 'All Major Airlines', 'Best Fare Guarantee', 'Group Bookings', 'Business & Economy Class', 'Multi-city Itineraries'] },
            { icon: '🚂', type: 'Train Bookings', color: '#0e4f7a', img: localPhoto("Train Bookings.jpg"), points: ['IRCTC Tatkal & Regular', 'AC First to Sleeper', 'Pantry Car Arrangements', 'Group Train Bookings', 'Tourist Quota Access', 'Pan-India Coverage'] },
            { icon: '🚌', type: 'Bus Bookings', color: '#0D2B5E', img: localPhoto("Bus Bookings.avif"), points: ['Volvo & AC Sleepers', 'Seat Selection', 'Night Buses', 'Hill Station Routes', 'State & Private Buses', 'Real-Time Tracking'] },
          ].map(item => (
            <div key={item.type} className="card-hover bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="h-40 overflow-hidden bg-gray-200">
                <img src={item.img} alt={item.type} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-display text-[#0D2B5E] text-xl font-bold mb-3">{item.type}</h3>
                <ul className="space-y-2 mb-5">
                  {item.points.map(p => <li key={p} className="text-gray-600 text-xs flex items-center gap-2"><span className="text-[#F47B20]">✓</span> {p}</li>)}
                </ul>
                <button onClick={() => openTravelForm('flights-book', item.type)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
                  Book {item.icon}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-[#EFF6FF] border border-blue-100 rounded-2xl p-6 text-center">
          <p className="text-[#0D2B5E] font-bold">📞 For instant bookings, call <a href={`tel:${PHONE_TEL}`} className="text-[#F47B20] underline">{PHONE_NUMBER}</a> or email <a href={`https://mail.google.com/mail/?view=cm&fs=1&to=${CONTACT_EMAIL}`} className="text-[#F47B20] underline">{CONTACT_EMAIL}</a></p>
        </div>
      </div>
    </div>
  )
}

function PrivateCabPage({ navigate, openTravelForm }: { navigate: (p: PageId) => void; openTravelForm: (action: string, pkg?: string) => void }) {
  const cabServices = [
    { icon: '✈️', type: 'Airport Transfers', color: '#0D2B5E', img: localPhoto("Airport Transfers.avif"), points: ['Pickup & Drop', 'Flight Tracking Support', 'Meet & Greet', 'Sedan / SUV Options', '24x7 Availability', 'Professional Drivers'] },
    { icon: '🚗', type: 'Outstation Cabs', color: '#0e4f7a', img: localPhoto("Outstation Cabs.avif"), points: ['One Way & Round Trip', 'Multi-Day Rentals', 'Flexible Stops', 'AC Cars & SUVs', 'Transparent Pricing', 'Experienced Drivers'] },
    { icon: '⏱️', type: 'Hourly Rentals', color: '#0D2B5E', img: localPhoto("Hourly Rentals.png"), points: ['City Travel', 'Business Meetings', 'Shopping Trips', 'Multiple Destinations', 'Wait & Return', 'Hourly Packages'] },
  ]

  return (
    <div className="pt-20">
      <PageHero title="Private Cab Booking" subtitle="Book comfortable city rides, airport transfers, and outstation cabs" img={localPhoto('Private Cab Booking.avif')} emoji="🚘" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="travel" label="All Travel Solutions" />
        <div className="mb-12 max-w-3xl">
          <h2 className="font-display text-3xl text-[#0D2B5E] font-bold mb-3">Private Cab Booking</h2>
          <p className="text-gray-600 leading-relaxed">
            From airport pickups to local city travel and long-distance outstation trips, we arrange reliable private cab services with verified drivers and comfortable vehicles.
          </p>
          <button onClick={() => openTravelForm('cab-enquire-now')} className="mt-5 inline-block px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
            Enquire Now
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {cabServices.map(item => (
            <div key={item.type} className="card-hover bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden">
              <div className="h-40 overflow-hidden bg-gray-200">
                <img src={item.img} alt={item.type} className="w-full h-full object-cover" />
              </div>
              <div className="p-6">
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-display text-[#0D2B5E] text-xl font-bold mb-3">{item.type}</h3>
                <ul className="space-y-2 mb-5">
                  {item.points.map(point => <li key={point} className="text-gray-600 text-xs flex items-center gap-2"><span className="text-[#F47B20]">✓</span> {point}</li>)}
                </ul>
                <button onClick={() => openTravelForm('cab-book', item.type)} className="block w-full text-center py-3 rounded-xl font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
                  Book {item.icon}
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-linear-to-br from-[#EFF6FF] to-white border border-blue-100 rounded-3xl p-8 text-center">
          <h3 className="font-display text-2xl text-[#0D2B5E] font-bold mb-3">Need a Custom Cab Plan?</h3>
          <p className="text-gray-500 mb-5 text-sm max-w-xl mx-auto">Share your pickup point, destination, and schedule — we will arrange the right cab service for you.</p>
          <button onClick={() => openTravelForm('cab-custom', 'Custom Private Cab Booking')} className="inline-block px-8 py-3.5 rounded-full font-bold text-white shadow-lg transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
            📧 Request Custom Cab Plan
          </button>
        </div>
      </div>
    </div>
  )
}

function HotelsPage({ navigate, openTravelForm }: { navigate: (p: PageId) => void; openTravelForm: (action: string, pkg?: string) => void }) {
  const hotels = [
    { name: 'Luxury 5-Star Resorts', desc: 'Premium properties worldwide — Oberoi, Taj, ITC, Marriott, Hilton & more. Exclusive corporate rates and early check-in guaranteed.', icon: '⭐⭐⭐⭐⭐', img: localPhoto("Luxury 5-Star Resorts.avif") },
    { name: 'Boutique & Heritage Hotels', desc: 'Discover handpicked boutique properties, palace hotels in Rajasthan, heritage havelis, and eco-resorts for a unique stay experience.', icon: '🏰', img: localPhoto("Boutique & Heritage Hotels.avif") },
    { name: 'Private Villas', desc: 'Exclusive private villas in Bali, Maldives, Goa & Kerala with private pools, personal butler service, and complete privacy.', icon: '🏡', img: localPhoto("Private Villas.avif") },
    { name: 'Budget & Mid-Range Stays', desc: 'Comfortable, clean, and well-located hotels for budget-conscious travellers without compromising on quality or experience.', icon: '🏨', img: localPhoto("Budget & Mid-Range Stays.avif") },
  ]

  return (
    <div className="pt-20">
      <PageHero title="Hotel & Villa Reservations" subtitle="From budget comfort to ultra-luxury — we find your perfect stay" img={localPhoto('Hotel & Villa Reservations.avif')} emoji="🏨" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <BackBtn navigate={navigate} to="travel" label="All Travel Solutions" />
        <div className="mb-12 max-w-3xl">
          <h2 className="font-display text-3xl text-[#0D2B5E] font-bold mb-3">Hotel & Villa Reservations</h2>
          <p className="text-gray-600 leading-relaxed">
            A great stay completes a great trip. PNP Advisors has partnerships with thousands of hotels, resorts, and private villas across India and the world. We negotiate the best rates, arrange early check-ins, room upgrades, and special amenities exclusively for our clients.
          </p>
          <button onClick={() => openTravelForm('hotel-enquire-now')} className="mt-5 inline-block px-7 py-3 rounded-full font-bold text-white text-sm transition-all hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
            Enquire Now
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
          {hotels.map(hotel => (
            <div key={hotel.name} className="card-hover bg-white rounded-2xl shadow-lg border border-blue-100 overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-48 h-48 sm:h-auto bg-gray-200 overflow-hidden shrink-0">
                <img src={hotel.img} alt={hotel.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 flex flex-col justify-between">
                <div>
                  <div className="text-xl mb-1">{hotel.icon}</div>
                  <h3 className="font-display text-[#0D2B5E] text-lg font-bold mb-2">{hotel.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{hotel.desc}</p>
                </div>
                <button onClick={() => openTravelForm('hotel-availability', hotel.name)} className="mt-4 text-center py-2.5 rounded-xl font-bold text-white text-xs" style={{ background: 'linear-gradient(135deg, #0D2B5E, #1a4a9e)' }}>
                  Check Availability
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-linear-to-br from-[#0D2B5E] to-[#0e4f7a] rounded-3xl p-8 text-center text-white">
          <h3 className="font-display text-2xl font-bold mb-3">Need Help Choosing the Perfect Stay?</h3>
          <p className="text-white/80 mb-5 text-sm">Share your destination, dates, and budget — we will find and book the ideal property for you.</p>
          <button onClick={() => openTravelForm('hotel-perfect-stay', 'Perfect Stay Assistance')} className="inline-block px-8 py-3.5 rounded-full font-bold text-[#0D2B5E] shadow-xl transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #F47B20, #F0C060)' }}>
            Find My Perfect Stay
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TravelPage({ page, navigate, openQueryForm, currentUser: _currentUser }: Props) {
  const openTravelForm = useMemo(() => {
    return (action: string, pkg = '') => {
      const params = new URLSearchParams({ action })
      if (pkg) {
        params.set('pkg', pkg)
      }
      const query = params.toString()
      window.location.href = query ? `/travel/form?${query}` : '/travel/form'
    }
  }, [])

  if (page === 'travel-international') return (
    <InternationalPage navigate={navigate} openTravelForm={openTravelForm} />
  )
  if (page === 'travel-domestic') return (
    <DomesticPage navigate={navigate} openTravelForm={openTravelForm} />
  )
  if (page === 'travel-honeymoon') return (
    <HoneymoonPage navigate={navigate} openTravelForm={openTravelForm} />
  )
  if (page === 'travel-flights') return (
    <FlightsPage navigate={navigate} openTravelForm={openTravelForm} />
  )
  if (page === 'travel-cab') return (
    <PrivateCabPage navigate={navigate} openTravelForm={openTravelForm} />
  )
  if (page === 'travel-hotels') return (
    <HotelsPage navigate={navigate} openTravelForm={openTravelForm} />
  )
  return (
    <TravelOverview navigate={navigate} openQueryForm={openQueryForm} openTravelForm={openTravelForm} />
  )
}
