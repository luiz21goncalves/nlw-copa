import { PrismaClient } from "@prisma/client"
import { faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.create({
    data: {
      name: faker.name.fullName(),
      email: faker.internet.email(),
      avatarUrl: faker.internet.avatar()
    }
  })

  const poll = await prisma.pool.create({
    data: {
      title: faker.lorem.words(),
      code: faker.random.alphaNumeric(6).toUpperCase(),
      ownerId: user.id,
      participants: {
        create: {
          userId: user.id
        }
      }
    }
  })

  await prisma.game.create({
    data: {
      date: faker.date.future(),
      firstTeamCountryCode: faker.address.countryCode('alpha-2'),
      secondTeamCountryCode: faker.address.countryCode('alpha-2')
    }
  })

  await prisma.game.create({
    data: {
      date: faker.date.future(),
      firstTeamCountryCode: faker.address.countryCode('alpha-2'),
      secondTeamCountryCode: faker.address.countryCode('alpha-2'),

      guesses: {
        create: {
          firstTeamPoints: Number(faker.random.numeric()),
          secondTeamPoints: Number(faker.random.numeric()),
          participant: {
            connect: {
              userId_poolId: {
                userId: user.id,
                poolId: poll.id
              }
            }
          }
        }
      }
    }
  })
}

main()
