import { Button as NativeBaseButton, Text, IButtonProps } from 'native-base'

type ButtonProps = IButtonProps & {
  title: string
  type?: 'primary' | 'secondary'
}

const backgroundColorMap = {
  primary: 'yellow.500',
  secondary: 'red.500',
} as const

const houverColorMap = {
  primary: 'yellow.600',
  secondary: 'red.600',
} as const

const textColorMap = {
  primary: 'black',
  secondary: 'white',
} as const

export function Button(props: ButtonProps) {
  const { title, type = 'primary', ...rest } = props

  return (
    <NativeBaseButton
      w="full"
      h="14"
      rounded="sm"
      fontSize="md"
      bg={backgroundColorMap[type]}
      _pressed={{ bg: houverColorMap[type] }}
      _loading={{ _spinner: { color: 'black' } }}
      {...rest}
    >
      <Text
        fontSize="sm"
        fontFamily="heading"
        color={textColorMap[type]}
        textTransform="uppercase"
      >
        {title}
      </Text>
    </NativeBaseButton>
  )
}
