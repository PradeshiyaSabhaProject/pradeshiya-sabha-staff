import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { SidebarProvider } from './context/SidebarContext'
import { LeaveProvider } from './context/LeaveContext'
import { KpiProvider } from './context/KpiContext'
import AppRoutes from './routes/AppRoutes'
import './App.css'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <LeaveProvider>
            <KpiProvider>
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </KpiProvider>
          </LeaveProvider>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

