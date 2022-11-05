import { Octicons } from '@expo/vector-icons'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { Icon, useToast, VStack, FlatList } from 'native-base'
import { useCallback, useState } from 'react'

import { Button } from '../components/Button'
import { EmptyPoolList } from '../components/EmptyPoolList'
import { Header } from '../components/Header'
import { Loading } from '../components/Loading'
import { Pool, PoolCard } from '../components/PoolCard'
import { api } from '../services/api'

export function Pools() {
  const [isFetchingPools, setIsFetchingPools] = useState(true)
  const [pools, setPools] = useState<Pool[]>([])

  const toast = useToast()
  const { navigate } = useNavigation()

  const fetchPools = useCallback(async () => {
    try {
      setIsFetchingPools(true)
      const { data: poolListData } = await api.get<{ pools: Pool[] }>('/pools')

      setPools(poolListData.pools)
    } catch (error) {
      console.error(error)

      toast.show({
        title: 'Não foi possível carregar os bolões.',
        position: 'top',
        bgColor: 'red.500',
      })

      throw error
    } finally {
      setIsFetchingPools(false)
    }
  }, [toast])

  useFocusEffect(
    useCallback(() => {
      fetchPools()
    }, [fetchPools]),
  )

  return (
    <VStack flex={1} bg="gray.900">
      <Header title="Meus Bolões" />

      <VStack
        mt={6}
        mx={5}
        borderBottomWidth={1}
        borderBottomColor="gray.600"
        pb={4}
        mb={4}
      >
        <Button
          title="Buscar bolão por código"
          leftIcon={
            <Icon as={Octicons} name="search" color="black" size="md" />
          }
          onPress={() => navigate('find')}
        />
      </VStack>

      {isFetchingPools ? (
        <Loading />
      ) : (
        <FlatList
          data={pools}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PoolCard
              data={item}
              onPress={() => navigate('details', { id: item.id })}
            />
          )}
          showsVerticalScrollIndicator={false}
          _contentContainerStyle={{ pb: 24 }}
          px={5}
          ListEmptyComponent={() => <EmptyPoolList />}
        />
      )}
    </VStack>
  )
}
