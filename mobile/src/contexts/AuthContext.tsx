import * as AuthSession from 'expo-auth-session'
import * as Google from 'expo-auth-session/providers/google'
import * as WebBrowser from 'expo-web-browser'
import { createContext, ReactNode, useEffect, useState } from 'react'

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
  const [user, setUser] = useState<User>({} as User)

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId:
      '298600268130-ij3ip0irbrge9nnmlcf8gnj9h3b9ffk4.apps.googleusercontent.com',
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
    console.log({ accessToken })
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
