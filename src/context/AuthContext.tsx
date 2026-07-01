import React, { createContext, useContext, useState } from 'react'

export interface User {
  id: string
  name: string
  email: string
  role?: string
}

export const DUMMY_USERS: Record<string, User> = {
  admin: {
    id: '1',
    name: 'Dev Admin',
    email: 'admin@pradeshiyasabha.gov.lk',
    role: 'admin',
  },
  staff: {
    id: '2',
    name: 'Staff Member',
    email: 'staff@pradeshiyasabha.gov.lk',
    role: 'staff',
  },
}

interface AuthContextType {
  user: User | null
  login: (userOrEmail: User | string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('pradeshiya_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        // ignore error
      }
    }
    return null
  })

  const login = (userOrEmail: User | string) => {
    let newUser: User
    if (typeof userOrEmail === 'string') {
      const isStaff = userOrEmail.toLowerCase().includes('staff') || userOrEmail.includes('1999703')
      newUser = isStaff ? DUMMY_USERS.staff : DUMMY_USERS.admin
    } else {
      newUser = userOrEmail
    }
    setUser(newUser)
    localStorage.setItem('pradeshiya_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('pradeshiya_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
