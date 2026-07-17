import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import TravelPage from './pages/TravelPage'
import InsurancePage from './pages/InsurancePage'
import ReligiousTripsPage from './pages/ReligiousTripsPage'
import CorporateToursPage from './pages/CorporateToursPage'

export type PageId =
  | 'home'
  | 'travel'
  | 'travel-international'
  | 'travel-domestic'
  | 'travel-honeymoon'
  | 'travel-flights'
  | 'travel-cab'
  | 'travel-hotels'
  | 'insurance'
  | 'insurance-health'
  | 'insurance-life'
  | 'insurance-general'
  | 'religious'
  | 'corporate'

export default function App() {
  const [page, setPage] = useState<PageId>('home')
  const [queryContext, setQueryContext] = useState('general')

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [page])

  const navigate = (p: PageId) => {
    if (p === 'home') {
      setQueryContext('general')
      window.history.replaceState({}, '', window.location.pathname + window.location.search)
    }
    setPage(p)
  }

  const openQueryForm = (context = 'general') => {
    setQueryContext(context)
    setPage('home')
    window.history.replaceState({}, '', '#contact-section')
  }

  const isTravelPage = page === 'travel' || page.startsWith('travel-')
  const isInsurancePage = page === 'insurance' || page.startsWith('insurance-')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFF6FF' }}>
      <Navbar navigate={navigate} openQueryForm={openQueryForm} currentPage={page} />
      {page === 'home' && <HomePage navigate={navigate} openQueryForm={openQueryForm} queryContext={queryContext} setQueryContext={setQueryContext} />}
      {isTravelPage && <TravelPage page={page} navigate={navigate} openQueryForm={openQueryForm} />}
      {isInsurancePage && <InsurancePage page={page} navigate={navigate} openQueryForm={openQueryForm} />}
      {page === 'religious' && <ReligiousTripsPage navigate={navigate} />}
      {page === 'corporate' && <CorporateToursPage navigate={navigate} />}
    </div>
  )
}
