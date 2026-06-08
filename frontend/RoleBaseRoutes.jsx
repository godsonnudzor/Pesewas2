import React from 'react'
import { useAuth } from '../Context/authContext'
import { Navigate } from 'react-router-dom'

const RoleBaseRoutes = ({ children, reqiredRole, reqired, required, requiredRoles }) => {
  // useAuth returns an object { user, login, logout, loading }
  const { user, loading } = useAuth()

  if (loading) return <div>loading....</div>

  // Normalize roles prop (support multiple possible prop names and single string)
  let roles = reqiredRole ?? reqired ?? required ?? requiredRoles ?? []
  if (!Array.isArray(roles)) roles = [roles]

  // If not authenticated, redirect to login
  if (!user) return <Navigate to="/login" />

  // If user doesn't have one of the required roles, redirect to unauthorized
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" />
  }

  return children
}

export default RoleBaseRoutes