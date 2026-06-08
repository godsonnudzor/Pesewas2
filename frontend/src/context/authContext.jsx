import axios from 'axios';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react'

const userContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true)
  const prevUserRef = useRef(null)
  

  useEffect(() => {
    const verifyUser = async() => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          console.debug('verifyUser: no token found')
          setUser(null)
          setLoading(false)
          return
        }

        console.debug('verifyUser: token found, verifying...')

        const response = await axios.get(`/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response?.data?.success) {
          setUser(response.data.user)
        } else {
          // verification failed on server
          setUser(null)
          localStorage.removeItem('token')
        } 
      } catch (error) {
        // Any network or server error should clear user state
        console.error('Auth verify error:', error?.message || error)
        setUser(null)
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }
    verifyUser()

    // Listen for token changes in other tabs and re-run verification
    const onStorage = (e) => {
      // e.key === null means storage.clear() was called
      if (e.key === 'token' || e.key === null) {
        console.debug('storage event: key=', e.key, 'newValue=', e.newValue)
        // token added/changed or cleared
        verifyUser()
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const login = (user) => {
    setUser(user);
  }

  // When user becomes non-null, if they're an admin navigate to admin-dashboard.
  // AuthProvider sits above the Router so use window.location to navigate.
  useEffect(() => {
    const prevUser = prevUserRef.current
    if (!prevUser && user) {
      if (user.role === 'admin') {
      }
    }
    prevUserRef.current = user
  }, [user])

  const logout = () => {
    setUser(null);
    localStorage.removeItem("token");
  }

  return (
    <userContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </userContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(userContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthProvider