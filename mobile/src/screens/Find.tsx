import { useNavigation } from '@react-navigation/native'
import { Heading, useToast, VStack } from 'native-base'
import { useState } from 'react'

import { Button } from '../components/Button'
import { Header } from '../components/Header'
import { Input } from '../components/Input'
import { api } from '../services/api'

export function Find() {
  const [isJoiningOnPool, setIsJoiningOnPool] = useState(false)
  const [code, setCode] = useState('')

  const toast = useToast()
  const { navigate } = useNavigation()

  async function handleJoinInPool() {
    try {
      setIsJoiningOnPool(true)

      if (!code.trim()) {
        return toast.show({
          title: 'Informe o código.',
          placement: 'top',
          bgColor: 'red.500',
        })
      }

      if (code.length > 6) {
        return toast.show({
          title: 'Código deve conter apenas 6 caracteres.',
          placement: 'top',
          bgColor: 'red.500',
        })
      }

      await api.post('/pools/join', { code })

      toast.show({
        title: 'Agora você faz parte desse bolão',
        placement: 'top',
        bgColor: 'green.500',
      })

      navigate('pools')
    } catch (error) {
      setIsJoiningOnPool(false)

      console.error(error)

      toast.show({
        title: 'Não foi possível entrar nesse bolão',
        position: 'top',
        bgColor: 'red.500',
      })

      throw error
    }
  }

  return (
    <VStack flex={1} bg="gray.900">
      <Header title="Buscar por código" showBackButton />

      <VStack mt={8} mx={5} alignItems="center">
        <Heading
          fontFamily="heading"
          color="white"
          fontSize="xl"
          mb={8}
          textAlign="center"
        >
          Encontre um bolão através de{'\n'} seu código único
        </Heading>

        <Input
          mb={2}
          placeholder="Qual o código do bolão?"
          autoCapitalize="characters"
          value={code}
          onChangeText={setCode}
        />

        <Button
          title="Buscar bolão"
          isLoading={isJoiningOnPool}
          onPress={handleJoinInPool}
        />
      </VStack>
    </VStack>
  )
}
