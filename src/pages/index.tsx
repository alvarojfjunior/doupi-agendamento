import {
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
  Image,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { withIronSessionSsr } from 'iron-session/next';
import Page from '@/components/Page';

export const getServerSideProps = withIronSessionSsr(
  ({ req }) => {
    if ('user' in req.session)
      return {
        redirect: {
          destination: '/private',
          permanent: false,
        },
      };
    else
      return {
        props: {
          user: null,
        },
      };
  },
  {
    cookieName: 'doupi_cookie',
    //@ts-ignore
    password: process.env.SESSION_SECRET,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  }
);

export default function Home({ data }: any) {
  const router = useRouter();

  return (
    <Page
      path='/index'
      title='Doupi'
      description='App para para gestão de agenda!'
    >
      <Stack h={'full'} direction={{ base: 'column', md: 'row' }}>
        <Flex p={8} flex={1} align={'center'} justify={'center'}>
          <Stack spacing={6} w={'full'} maxW={'lg'}>
            <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
              <Text
                color={useColorModeValue('#3e4d92', '#3e4d92')}
                as={'span'}
                textAlign={'center'}
              >
                Diga adeus a bagunça e dê olá para a
              </Text>{' '}
              <Text
                as={'span'}
                position={'relative'}
                color={useColorModeValue('#ffc03f', '#FFF')}
                _after={{
                  content: "''",
                  width: 'full',
                  height: useBreakpointValue({ base: '20%', md: '30%' }),
                  position: 'absolute',
                  bottom: 1,
                  left: 0,
                  bg: useColorModeValue('#ffc03f36', '#ffc03f'),
                  zIndex: -1,
                }}
              >
                Doupi
              </Text>
              <br />{' '}
            </Heading>
            <Text
              fontSize={{ base: 'md', lg: 'lg' }}
              textAlign={'justify'}
              color={'gray.500'}
            >
              Bem-vindo à Doupi, onde a simplicidade e a praticidade são nossas
              maiores prioridades. Nós entendemos as dores e frustrações de
              lidar com agenda desorganizada, compromissos perdidos e o estresse
              que acompanha essa desorganização. É por isso que estamos aqui
              para ajudar!
            </Text>
            <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
              <Button
                rounded={'full'}
                bg={useColorModeValue('#ffc03f', '#3e4d92')}
                size={'lg'}
                color={'white'}
                _hover={{ filter: 'brightness(110%)' }}
                onClick={() => router.push('/signup')}
              >
                Saiba mais
              </Button>
            </Stack>
          </Stack>
        </Flex>

        <Flex w={{ md: '50%' }}>
          <Image
            alt={'main image'}
            margin={'auto'}
            textAlign={'center'}
            src={'home-image.png'}
            maxH={400}
          />
        </Flex>
      </Stack>
    </Page>
  );
}
