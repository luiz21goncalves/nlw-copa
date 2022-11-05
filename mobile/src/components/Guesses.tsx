import { FlatList, useToast } from 'native-base'
import { useCallback, useEffect, useState } from 'react'

import { api } from '../services/api'
import { EmptyMyPoolList } from './EmptyMyPoolList'
import { Game, GameData } from './Game'
import { Loading } from './Loading'

type GuessesProps = {
  poolId: string
  code: string
}

export function Guesses(props: GuessesProps) {
  const { poolId, code } = props

  const [isLoading, setIsLoading] = useState(true)
  const [games, setGames] = useState<GameData[]>([])
  const [firstTeamPoints, setFirstTeamPoints] = useState('')
  const [secondTeamPoints, setSecondTeamPoints] = useState('')

  const toast = useToast()

  const fetchGames = useCallback(async () => {
    try {
      setIsLoading(true)

      const { data: gamesData } = await api.get<{ games: GameData[] }>(
        `/pools/${poolId}/games`,
      )

      setGames(gamesData.games)
    } catch (error) {
      console.error(error)

      toast.show({
        title: 'Não foi possível carregar os jogos',
        placement: 'top',
        bgColor: 'red.500',
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }, [poolId, toast])

  async function handleGuessConfirm(gameId: string) {
    try {
      setIsLoading(true)

      if (!firstTeamPoints.trim() && secondTeamPoints.trim()) {
        return toast.show({
          title: 'Informe o placar do palpite',
          position: 'top',
          bgColor: 'red.500',
        })
      }

      await api.post(`/pools/${poolId}/games/${gameId}/guesses`, {
        firstTeamPoints: Number(firstTeamPoints),
        secondTeamPoints: Number(secondTeamPoints),
      })

      toast.show({
        title: 'Palpite realizado com sucesso.',
        position: 'top',
        bgColor: 'green.500',
      })

      fetchGames()
    } catch (error) {
      console.error(JSON.stringify(error, null, 2))

      toast.show({
        title: 'Não foi possível enviar o palpite.',
        position: 'top',
        bgColor: 'red.500',
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGames()
  }, [poolId, fetchGames])

  if (isLoading) {
    return <Loading />
  }

  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <Game
          data={item}
          onGuessConfirm={() => handleGuessConfirm(item.id)}
          setFirstTeamPoints={setFirstTeamPoints}
          setSecondTeamPoints={setSecondTeamPoints}
        />
      )}
      ListEmptyComponent={() => <EmptyMyPoolList code={code} />}
    />
  )
}
