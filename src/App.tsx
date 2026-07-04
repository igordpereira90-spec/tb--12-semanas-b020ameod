import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'

import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'

// Patient Pages
import PatientHome from './pages/patient/Home'
import PatientQuestionnaires from './pages/patient/Questionnaires'
import PatientLibrary from './pages/patient/Library'

// Professional Pages
import ProDashboard from './pages/professional/Dashboard'
import PatientDetail from './pages/professional/PatientDetail'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />

          {/* Patient Routes */}
          <Route path="/patient" element={<PatientHome />} />
          <Route path="/patient/questionnaires" element={<PatientQuestionnaires />} />
          <Route path="/patient/library" element={<PatientLibrary />} />

          {/* Professional Routes */}
          <Route path="/pro" element={<ProDashboard />} />
          <Route path="/pro/patient/:id" element={<PatientDetail />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
