import React from 'react'
import { Outlet } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import { VaripanamProvider } from '../context/VaripanamContext'
import VaripanamGuard from './VaripanamGuard'

export const VaripanamLayout: React.FC = () => {
  return (
    <VaripanamGuard>
      <VaripanamProvider>
        <Outlet />
      </VaripanamProvider>
    </VaripanamGuard>
  )
}

export default VaripanamLayout
