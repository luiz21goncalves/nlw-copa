import { useRoute } from '@react-navigation/native'
import { HStack, useToast, VStack } from 'native-base'
import { useCallback, useEffect, useState } from 'react'
import { Share } from 'react-native'

import { EmptyMyPoolList } from '../components/EmptyMyPoolList'
import { Guesses } from '../components/Guesses'
import { Header } from '../components/Header'
import { Loading } from '../components/Loading'
import { Option } from '../components/Option'
import { Pool } from '../components/PoolCard'
import { PoolHeader } from '../components/PoolHeader'
import { api } from '../services/api'

type RouteParams = {
  id: string
}

export function Details() {
  const [optionSelected, setOptionSelected] = useState<'guesses' | 'ranking'>(
    'guesses',
  )
  const [isFetchingPool, setIsFetchingPool] = useState(true)
  const [poolDetails, setPoolDetails] = useState<Pool>({} as Pool)

  const route = useRoute()
  const toast = useToast()

  const { id } = route.params as RouteParams

  const fetchPoolDetails = useCallback(
    async (poolId: string) => {
      try {
        setIsFetchingPool(true)

        const { data: poolDetailsData } = await api.get<{ pool: Pool }>(
          `/pools/${poolId}`,
        )

        setPoolDetails(poolDetailsData.pool)
      } catch (error) {
        console.error(error)

        toast.show({
          title: 'Não foi possível carregar os detalhes do bolão.',
          position: 'top',
          bgColor: 'red.500',
        })

        throw error
      } finally {
        setIsFetchingPool(false)
      }
    },
    [toast],
  )

  async function handleCodeShare() {
    await Share.share({
      message: poolDetails.code,
    })
  }

  useEffect(() => {
    fetchPoolDetails(id)
  }, [id, fetchPoolDetails])

  if (isFetchingPool) {
    return <Loading />
  }

  const hasParticipants = poolDetails._count.participants > 0

  return (
    <VStack flex={1} bg="gray.900">
      <Header
        title={poolDetails.title}
        showBackButton
        showShareButton
        onShare={handleCodeShare}
      />

      {hasParticipants ? (
        <VStack px={5} flex={1}>
          <PoolHeader data={poolDetails} />

          <HStack bgColor="gray.800" p={1} rounded="sm" mb={5}>
            <Option
              title="Seus palpites"
              isSelected={optionSelected === 'guesses'}
              onPress={() => setOptionSelected('guesses')}
            />

            <Option
              title="Ranking do grupo"
              isSelected={optionSelected === 'ranking'}
              onPress={() => setOptionSelected('ranking')}
            />
          </HStack>

          <Guesses poolId={poolDetails.id} code={poolDetails.code} />
        </VStack>
      ) : (
        <EmptyMyPoolList code={poolDetails.code} />
      )}
    </VStack>
  )
}
