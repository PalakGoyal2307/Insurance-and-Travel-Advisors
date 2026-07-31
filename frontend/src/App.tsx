import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import TravelPage from './pages/TravelPage'
import TravelFormPage from './pages/TravelFormPage'
import InsurancePage from './pages/InsurancePage'
import InsuranceFormPage from './pages/InsuranceFormPage'
import ReligiousTripsPage from './pages/ReligiousTripsPage'
import CorporateToursPage from './pages/CorporateToursPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ProfilePage from './pages/ProfilePage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import { getCurrentUser, logoutUser } from './utils/authApi'
import type { AuthUser } from './utils/authApi'

export type PageId =
  | 'home'
  | 'travel'
  | 'travel-international'
  | 'travel-domestic'
  | 'travel-honeymoon'
  | 'travel-flights'
  | 'travel-cab'
  | 'travel-hotels'
  | 'travel-form'
  | 'insurance'
  | 'insurance-health'
  | 'insurance-life'
  | 'insurance-general'
  | 'insurance-form'
  | 'religious'
  | 'corporate'
  | 'login'
  | 'forgot-password'
  | 'reset-password'
  | 'register'
  | 'profile'
  | 'admin-dashboard'

const PAGE_PATHS: Record<PageId, string> = {
  home: '/',
  travel: '/travel',
  'travel-international': '/travel/international',
  'travel-domestic': '/travel/domestic',
  'travel-honeymoon': '/travel/honeymoon',
  'travel-flights': '/travel/flights',
  'travel-cab': '/travel/cab',
  'travel-hotels': '/travel/hotels',
  'travel-form': '/travel/form',
  insurance: '/insurance',
  'insurance-health': '/insurance/health',
  'insurance-life': '/insurance/life',
  'insurance-general': '/insurance/general',
  'insurance-form': '/insurance/form',
  religious: '/religious',
  corporate: '/corporate',
  login: '/login',
  'forgot-password': '/forgot-password',
  'reset-password': '/reset-password',
  register: '/register',
  profile: '/profile',
  'admin-dashboard': '/admin-dashboard',
}

const PATH_TO_PAGE = Object.entries(PAGE_PATHS).reduce<Record<string, PageId>>((acc, [pageId, path]) => {
  acc[path] = pageId as PageId
  return acc
}, {})

const PAGE_IDS = new Set<PageId>(Object.keys(PAGE_PATHS) as PageId[])

function isPageId(value: string): value is PageId {
  return PAGE_IDS.has(value as PageId)
}

function normalizePathname(pathname: string): string {
  if (!pathname) return '/'
  const cleaned = pathname.replace(/\/+$/, '')
  return cleaned || '/'
}

function pageFromPath(pathname: string): PageId {
  const normalizedPath = normalizePathname(pathname)
  return PATH_TO_PAGE[normalizedPath] ?? 'home'
}

export default function App() {
  const location = useLocation()
  const routerNavigate = useNavigate()

  const [queryContext, setQueryContext] = useState('general')
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const page = useMemo(() => pageFromPath(location.pathname), [location.pathname])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const user = await getCurrentUser()
        setCurrentUser(user)
      } catch (_error) {
        setCurrentUser(null)
      } finally {
        setAuthReady(true)
      }
    }

    initializeAuth()
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const legacyPage = params.get('page')

    if (!legacyPage) return

    if (!isPageId(legacyPage)) {
      routerNavigate(PAGE_PATHS.home, { replace: true })
      return
    }

    const nextPath = PAGE_PATHS[legacyPage]
    const nextParams = new URLSearchParams()
    const token = params.get('token')

    if (legacyPage === 'reset-password' && token) {
      nextParams.set('token', token)
    }

    routerNavigate(
      {
        pathname: nextPath,
        search: nextParams.toString() ? `?${nextParams.toString()}` : '',
        hash: '',
      },
      { replace: true },
    )
  }, [location.search, routerNavigate])

  useEffect(() => {
    if (page === 'home' && location.hash) {
      const target = document.getElementById(location.hash.replace('#', ''))
      if (target) {
        target.scrollIntoView({ behavior: 'auto', block: 'start' })
        return
      }
    }

    if (page === 'home' && queryContext !== 'general') {
      const querySection = document.getElementById('send-query-section')
      if (querySection) {
        querySection.scrollIntoView({ behavior: 'auto', block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [location.hash, page, queryContext])

  const navigate = (p: PageId) => {
    if (p === 'home') {
      setQueryContext('general')
    }

    routerNavigate({ pathname: PAGE_PATHS[p], search: '', hash: '' })
  }

  const openQueryForm = (context = 'general') => {
    setQueryContext(context)
    routerNavigate({ pathname: PAGE_PATHS.home, search: '', hash: '#send-query-section' })
  }

  const handleLogout = async () => {
    const shouldLogout = window.confirm('Are you sure you want to exit?')
    if (!shouldLogout) return

    try {
      await logoutUser()
    } catch (_error) {
      // Even if logout API fails, local session should be cleared from UI.
    } finally {
      setCurrentUser(null)
      routerNavigate(PAGE_PATHS.home)
    }
  }

  const isTravelPage = page === 'travel' || (page.startsWith('travel-') && page !== 'travel-form')
  const isInsurancePage = page === 'insurance' || (page.startsWith('insurance-') && page !== 'insurance-form')

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EFF6FF' }}>
      <Navbar
        navigate={navigate}
        openQueryForm={openQueryForm}
        currentPage={page}
        isAuthenticated={Boolean(currentUser)}
        onLoginClick={() => navigate('login')}
        onRegisterClick={() => navigate('register')}
        onProfileClick={() => navigate('profile')}
        onAdminClick={() => navigate('admin-dashboard')}
        isAdmin={currentUser?.role === 'admin'}
        onLogoutClick={handleLogout}
      />
      {page === 'home' && <HomePage navigate={navigate} openQueryForm={openQueryForm} queryContext={queryContext} setQueryContext={setQueryContext} currentUser={currentUser} />}
      {page === 'travel-form' && <TravelFormPage navigate={navigate} currentUser={currentUser} />}
      {isTravelPage && <TravelPage page={page} navigate={navigate} openQueryForm={openQueryForm} currentUser={currentUser} />}
      {page === 'insurance-form' && <InsuranceFormPage navigate={navigate} currentUser={currentUser} />}
      {isInsurancePage && <InsurancePage page={page} navigate={navigate} openQueryForm={openQueryForm} currentUser={currentUser} />}
      {page === 'religious' && <ReligiousTripsPage navigate={navigate} currentUser={currentUser} />}
      {page === 'corporate' && <CorporateToursPage navigate={navigate} currentUser={currentUser} />}
      {page === 'login' && <LoginPage navigate={navigate} onLoginSuccess={setCurrentUser} />}
      {page === 'forgot-password' && <ForgotPasswordPage navigate={navigate} />}
      {page === 'reset-password' && <ResetPasswordPage navigate={navigate} />}
      {page === 'register' && <RegisterPage navigate={navigate} onRegisterSuccess={setCurrentUser} />}
      {page === 'profile' && !authReady && (
        <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 min-h-screen">
          <div className="max-w-4xl mx-auto rounded-2xl border border-blue-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
            Loading profile...
          </div>
        </div>
      )}
      {page === 'profile' && authReady && currentUser && currentUser.role !== 'admin' && (
        <ProfilePage navigate={navigate} user={currentUser} onProfileUpdated={setCurrentUser} />
      )}
      {page === 'profile' && authReady && currentUser?.role === 'admin' && <AdminDashboardPage navigate={navigate} />}
      {page === 'profile' && authReady && !currentUser && <LoginPage navigate={navigate} onLoginSuccess={setCurrentUser} />}
      {page === 'admin-dashboard' && currentUser?.role === 'admin' && <AdminDashboardPage navigate={navigate} />}
      {page === 'admin-dashboard' && currentUser?.role !== 'admin' && authReady && <HomePage navigate={navigate} openQueryForm={openQueryForm} queryContext={queryContext} setQueryContext={setQueryContext} currentUser={currentUser} />}
    </div>
  )
}
