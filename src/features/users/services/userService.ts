// User feature API service

import type { User, UpdateUserPayload } from '../types'

export async function fetchUsers(token: string): Promise<User[]> {
  const response = await fetch('/api/users', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch users')
  }

  const data = await response.json()
  return data.users
}

export async function updateUser(
  userId: string, 
  updates: UpdateUserPayload, 
  token: string
): Promise<User> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  })

  if (!response.ok) {
    throw new Error('Failed to update user')
  }

  const data = await response.json()
  return data.user
}

export async function deleteUser(userId: string, token: string): Promise<void> {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to delete user')
  }
}

export async function syncUser(token: string): Promise<{ user: User; isNew: boolean }> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to sync user')
  }

  return response.json()
}

export async function createUser(
  token: string, 
  payload: import('../types').CreateUserPayload
): Promise<User> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      action: 'create',
      ...payload
    })
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.error || 'Failed to create user')
  }

  const data = await response.json()
  return data.user
}
