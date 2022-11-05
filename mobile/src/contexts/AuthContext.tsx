import * as AuthSession from 'expo-auth-session'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { createContext, ReactNode, useEffect, useState } from 'react'

import { api } from '../services/api'

WebBrowser.maybeCompleteAuthSession()

type User = {
  name: string
  avatarUrl: string
}

type AuthContextData = {
  user: User
  isUserLoading: boolean
  signIn: () => Promise<void>
}

type AuthContextProviderProps = {
  children: ReactNode
}

export const AuthContext = createContext({} as AuthContextData)

export function AuthContextProvider(props: AuthContextProviderProps) {
  const [isUserLoading, setIsUserLoading] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.CLIENT_ID,
    redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
    scopes: ['profile', 'email'],
  })

  async function signIn() {
    try {
      setIsUserLoading(true)
      await promptAsync()
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setIsUserLoading(false)
    }
  }

  async function signInWithGoogle(accessToken: string) {
    try {
      setIsUserLoading(true)

      const { data: tokenData } = await api.post<{ token: string }>('/users', {
        access_token: accessToken,
      })

      api.defaults.headers.common.Authorization = `Bearer ${tokenData.token}`

      const { data: userData } = await api.get<{ user: User }>('/me')

      setUser(userData.user)
    } catch (error) {
      console.error(error)
      throw error
    } finally {
      setIsUserLoading(false)
    }
  }

  useEffect(() => {
    if (response?.type === 'success' && response.authentication?.accessToken) {
      signInWithGoogle(response.authentication.accessToken)
    }
  }, [response])

  return (
    <AuthContext.Provider
      value={{
        user,
        isUserLoading,
        signIn,
      }}
    >
      {props.children}
    </AuthContext.Provider>
  )
}
