import { Box } from 'native-base'

type GuessesProps = {
  poolId: string
}

export function Guesses(props: GuessesProps) {
  const { poolId } = props

  return <Box>{poolId}</Box>
}
