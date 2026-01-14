'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/features/auth'
import * as userService from '../services/userService'
import type { User, UpdateUserPayload } from '../types'

interface UseUsersReturn {
  users: User[]
  loading: boolean
  error: string | null
  updating: string | null
  fetchUsers: () => Promise<void>
  updateUser: (userId: string, updates: UpdateUserPayload) => Promise<boolean>
  deleteUser: (userId: string) => Promise<void>
  createUser: (payload: import('../types').CreateUserPayload) => Promise<boolean>
}

export function useUsers(): UseUsersReturn {
  const { getToken, refreshUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getToken()
      if (!token) {
        setError('Unauthorized')
        return
      }

      const fetchedUsers = await userService.fetchUsers(token)
      setUsers(fetchedUsers)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [getToken])

  const updateUser = useCallback(async (
    userId: string, 
    updates: UpdateUserPayload
  ): Promise<boolean> => {
    try {
      setUpdating(userId)
      setError(null)
      const token = await getToken()
      if (!token) return false

      const updatedUser = await userService.updateUser(userId, updates, token)
      setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u))
      
      // Refresh current user if they updated themselves
      await refreshUser()
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      return false
    } finally {
      setUpdating(null)
    }
  }, [getToken, refreshUser])

  const deleteUserAction = useCallback(async (userId: string) => {
    try {
      setUpdating(userId)
      const token = await getToken()
      if (!token) return

      await userService.deleteUser(userId, token)
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setUpdating(null)
    }
  }, [getToken])

  // Fetch users on mount
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    updating,
    fetchUsers,
    updateUser,
    deleteUser: deleteUserAction,
    createUser: useCallback(async (payload: import('../types').CreateUserPayload): Promise<boolean> => {
      try {
        setError(null)
        const token = await getToken()
        if (!token) return false

        await userService.createUser(token, payload)
        // Refresh list
        await fetchUsers()
        return true
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create user')
        return false
      }
    }, [getToken, fetchUsers])
  }
}
