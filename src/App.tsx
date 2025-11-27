import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'

import Footer from './components/Footer'
import Navbar from './components/Navbar'
import { LiffProvider } from './contexts/LiffContext'
import Api from './pages/Api'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Help from './pages/Help'
import Input from './pages/Input'
import Landing from './pages/Landing'
import Map from './pages/Map'
import Mission from './pages/Mission'
import NotFound from './pages/NotFound'
import ReportDetail from './pages/ReportDetail'
import Review from './pages/Review'
import SelectReports from './pages/SelectReports'
import Stats from './pages/Stats'

// Configure QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds - data is fresh for 30s
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true, // Refetch when network reconnects
      retry: 1,
      retryDelay: 1000,
    },
    mutations: {
      retry: false,
    },
  },
})

const AppContent = () => {
  const location = useLocation()
  const isMapPage = location.pathname === '/map'

  return (
    <div
      className={
        isMapPage
          ? 'h-screen overflow-hidden flex flex-col'
          : 'flex flex-col min-h-screen'
      }
    >
      <Navbar />
      <div className={isMapPage ? 'flex-1 overflow-hidden mt-16' : 'flex-1 mt-16'}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/extraction" element={<Input />} />
          <Route path="/select" element={<SelectReports />} />
          <Route path="/review" element={<Review />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/report/:id" element={<ReportDetail />} />
          <Route path="/map" element={<Map />} />
          <Route path="/api" element={<Api />} />
          <Route path="/mission" element={<Mission />} />
          <Route path="/help" element={<Help />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      {!isMapPage && <Footer />}
    </div>
  )
}

const App = () => (
  <LiffProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </TooltipProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </LiffProvider>
)

export default App
