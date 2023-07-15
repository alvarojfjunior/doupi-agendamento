import {
  Button,
  Flex,
  Heading,
  Stack,
  Text,
  Input,
  useBreakpointValue,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { withIronSessionSsr } from 'iron-session/next';
import { handleImageImageAndUpload } from '@/utils/upload';

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

//CLOUD NAME = dovvizyxg
//API SECRET = 6B0yUi53AguKw7BpYvdWvOKXugY
//API KEY = 655772814277416
//api base url = CLOUDINARY_URL=cloudinary://655772814277416:6B0yUi53AguKw7BpYvdWvOKXugY@dovvizyxg

export default function Home({ data }: any) {
  const [image, setImage] = useState(
    'https://i.ytimg.com/vi/paiO6M2wBqE/maxresdefault.jpg'
  );
  const router = useRouter();

  return (
    <Stack h={'full'} direction={{ base: 'column', md: 'row' }}>
      <Input
        type='file'
        accept='image/*'
        onChange={(e) => handleImageImageAndUpload(e, (url: any)=> setImage(url))}
      />
      <img src={image} />
      <Flex p={8} flex={1} align={'center'} justify={'center'}>
        <Stack spacing={6} w={'full'} maxW={'lg'}>
          <Heading fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}>
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
            <Text
              color={useColorModeValue('#3e4d92', '#3e4d92')}
              as={'span'}
              textAlign={'center'}
            >
              Gerencie todo o seu negócio com o Doupi!
            </Text>{' '}
          </Heading>
          <Text fontSize={{ base: 'md', lg: 'lg' }} color={'gray.500'}>
            Com o Doupi, você consegue controlar todos os agendamentos do seu
            negócio e se tornar cada vez mais profissional e competitivo!
          </Text>
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <Button
              rounded={'full'}
              bg={useColorModeValue('#ffc03f', '#3e4d92')}
              color={'white'}
              _hover={{ filter: 'brightness(110%)' }}
              onClick={() => router.push('/signup')}
            >
              Testar Grátis!
            </Button>
            <Button rounded={'full'} onClick={() => router.push('/signin')}>
              Entrar
            </Button>
          </Stack>
        </Stack>
      </Flex>
      <Flex
        flex={1}
        alignItems={'center'}
        justifyContent={'center'}
        flexDir={'column'}
      ></Flex>
    </Stack>
  );
}
