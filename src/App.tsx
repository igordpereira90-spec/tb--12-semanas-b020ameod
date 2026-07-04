import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'

import Layout from './components/Layout'
import Index from './pages/Index'
import NotFound from './pages/NotFound'
import Login from './pages/Login'

import PatientHome from './pages/patient/Home'
import PatientQuestionnaires from './pages/patient/Questionnaires'
import PatientLibrary from './pages/patient/Library'

import ProDashboard from './pages/professional/Dashboard'
import PatientDetail from './pages/professional/PatientDetail'
import ProQuestionnaireSettings from './pages/professional/QuestionnaireSettings'
import ProMaterials from './pages/professional/Materials'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="patient" />}>
            <Route element={<Layout />}>
              <Route path="/patient" element={<PatientHome />} />
              <Route path="/patient/questionnaires" element={<PatientQuestionnaires />} />
              <Route path="/patient/library" element={<PatientLibrary />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute role="professional" />}>
            <Route element={<Layout />}>
              <Route path="/pro" element={<ProDashboard />} />
              <Route path="/pro/patient/:id" element={<PatientDetail />} />
              <Route path="/pro/questionnaire-settings" element={<ProQuestionnaireSettings />} />
              <Route path="/pro/materials" element={<ProMaterials />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
