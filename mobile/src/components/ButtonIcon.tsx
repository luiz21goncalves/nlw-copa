import { useTheme } from 'native-base'
import { IconProps } from 'phosphor-react-native'
import { FC } from 'react'
import { TouchableOpacity, TouchableOpacityProps } from 'react-native'

type ButtonIconProps = TouchableOpacityProps & {
  icon: FC<IconProps>
}

export function ButtonIcon(props: ButtonIconProps) {
  const { icon: Icon, ...rest } = props

  const { colors, sizes } = useTheme()

  return (
    <TouchableOpacity {...rest}>
      <Icon color={colors.gray[300]} size={sizes[6]} />
    </TouchableOpacity>
  )
}
