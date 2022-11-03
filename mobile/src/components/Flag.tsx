import { Image, IImageProps } from 'native-base'

export function Flag(props: IImageProps) {
  return <Image {...props} alt="Bandeira" w={8} h={6} mx={3} />
}
