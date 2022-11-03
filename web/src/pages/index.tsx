import { GetStaticProps } from 'next'
import Image from 'next/image'
import { FormEvent, useState } from 'react'

import appPreviewImg from '../assets/app-nlw-copa-preview.png'
import iconCheckImg from '../assets/icon-check.svg'
import logoImg from '../assets/logo.svg'
import usersAvatarExempleImg from '../assets/users-avatar-example.png'
import { api } from '../lib/api'

type HomeProps = {
  poolCount: number
  guessCount: number
  userCount: number
}

export default function Home(props: HomeProps) {
  const { poolCount, guessCount, userCount } = props

  const [poolTitle, setPoolTitle] = useState('')

  async function handleCreatePoll(event: FormEvent) {
    event.preventDefault()

    try {
      const { data } = await api.post<{ code: string }>('/pools', {
        title: poolTitle,
      })

      await navigator.clipboard.writeText(data.code)

      setPoolTitle('')

      alert(
        'Bolão criado com sucesso, o código foi copiado para a área de transferência!',
      )
    } catch (error) {
      alert('Falha ao criar o bolão, tente novamente')
      console.error(error)
    }
  }

  return (
    <div className="max-w-[1124px] h-screen mx-auto grid grid-cols-2 gap-28 items-center">
      <main>
        <Image src={logoImg} alt="NLW Copa" />

        <h1 className="mt-14 text-white text-5xl font-bold leading-tight">
          Crie seu próprio bolão da copa e compartilhe entre amigos!
        </h1>

        <div className="mt-10 flex items-center gap-2">
          <Image src={usersAvatarExempleImg} alt="" />
          <strong className="text-gray-100 text-xl">
            <span className="text-ignite-500">+{userCount}</span> pessoas já
            estão usando
          </strong>
        </div>

        <form className="mt-10 flex gap-2" onSubmit={handleCreatePoll}>
          <input
            className="flex-1 px-6 py-4 rounded bg-gray-800 border border-gray-600 text-gray-100"
            type="text"
            required
            placeholder="Qual nome do seu bolão?"
            value={poolTitle}
            onChange={(event) => setPoolTitle(event.target.value)}
          />
          <button
            className="bg-yellow-500 px-6 py-4 rounded text-gray-900 font-bold text-sm uppercase hover:bg-yellow-700 transition-colors"
            type="submit"
          >
            Criar meu bolão
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-300 leading-relaxed">
          Após criar seu bolão, você receberá um código único que poderá usar
          para convidar outras pessoas 🚀
        </p>

        <div className="mt-10 pt-10 border-t border-gray-600 flex justify-between text-gray-100">
          <div className="flex items-center gap-6">
            <Image src={iconCheckImg} alt="" />

            <div className="flex flex-col">
              <span className="font-bold text-2xl">+{poolCount}</span>
              <span>Bolões criados</span>
            </div>
          </div>

          <hr className="h-14 border-l border-gray-600" />

          <div className="flex items-center gap-6">
            <Image src={iconCheckImg} alt="" />

            <div className="flex flex-col">
              <span className="font-bold text-2xl">+{guessCount}</span>
              <span>Palpites enviados</span>
            </div>
          </div>
        </div>
      </main>

      <Image
        src={appPreviewImg}
        alt="Dois celulares exibindo uma prévia da aplicação móvel do NLW Copa"
      />
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const [poolsCountResponse, guessesCountResponse, usersCountResponse] =
    await Promise.all([
      api.get<{ count: number }>('/pools/count'),
      api.get<{ count: number }>('/guesses/count'),
      api.get<{ count: number }>('/users/count'),
    ])

  return {
    props: {
      poolCount: poolsCountResponse.data.count,
      guessCount: guessesCountResponse.data.count,
      userCount: usersCountResponse.data.count,
    },
    revalidate: 60 * 60 * 2, // 2 hours
  }
}
