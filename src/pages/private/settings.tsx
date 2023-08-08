import {
  Box,
  Button,
  Heading,
  useToast,
  Text,
  Flex,
  Image,
} from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import Page from '@/components/Page';
import axios from 'axios';
import { withIronSessionSsr } from 'iron-session/next';
import { transformPhoneNumber } from '@/utils/general';
import { AppContext } from '@/contexts/app';

export const getServerSideProps = withIronSessionSsr(
  async ({ req, res }) => {
    if (!('user' in req.session))
      return {
        redirect: {
          destination: '/signin',
          permanent: false,
        },
      };

    const user = req.session.user;
    return {
      props: {
        user: user,
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

export default function Company({ user }: any) {
  const appContext = useContext(AppContext);
  const [isWhatsaapConnected, setIsWhatsaapConnected] = useState(false);
  const [countAttempts, setCountAttempts] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const toast = useToast();

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    checkStatus();
  };

  const checkStatus = async () => {
    try {
      appContext.onOpenLoading();
      const { data: statusRes } = await axios.get(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(
          user.companyWhatsapp
        )}/check-connection-session`,
        {
          headers: {
            Authorization:
              'Bearer $2b$10$XNFebRmGwTxQHr5PcTcuHObrF08hAo7D7RKpTCP0fT_ZJ98HY9N_m',
          },
        }
      );

      if (statusRes.status) {
        setIsWhatsaapConnected(true);
        toast({
          title: 'Você está conectado!',
          description:
            'Está tudo certo por aqui, o serviço de whatsapp está configurado!',
          status: 'success',
          position: 'top-right',
          duration: 6000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Você ainda não está conectado!',
          description: 'Você ainda não está conectado, tente novamente!',
          status: 'info',
          position: 'top-right',
          duration: 6000,
          isClosable: true,
        });
        setIsWhatsaapConnected(false);
      }
    } catch (error) {
      console.log(error);
      toast({
        title: 'Houve algum problema',
        description:
          'Não conseguimos testar o serviço do whatsapp, tente novamente em instantes, ou aviso o nosso suporte!',
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
      setIsWhatsaapConnected(false);
    } finally {
      appContext.onCloseLoading();
    }
  };

  const connectWhatsapp = async () => {
    try {
      appContext.onOpenLoading();

      await axios.post(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(user.companyWhatsapp)}/start-session`,
        {},
        {
          headers: {
            Authorization:
              'Bearer $2b$10$XNFebRmGwTxQHr5PcTcuHObrF08hAo7D7RKpTCP0fT_ZJ98HY9N_m',
          },
        }
      );

      getQrcode();
    } catch (error) {
      console.log('QR CODE ERROR', error);
      appContext.onCloseLoading();
      toast({
        title: 'Houve algum problema',
        description:
          'Não conseguimos testar o serviço do whatsapp, tente novamente em instantes, ou aviso o nosso suporte!',
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const getQrcode = async () => {
    try {
      appContext.onOpenLoading();
      if (countAttempts > 5) {
        setIsWhatsaapConnected(false);
        setQrCode('');
        return;
      }

      setCountAttempts(countAttempts + 1);
      await new Promise((resolve) => setTimeout(() => resolve(null), 10000));

      const { data: qrcodeRes } = await axios.get(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(user.companyWhatsapp)}/qrcode-session`,
        {
          responseType: 'blob',
          headers: {
            Authorization:
              'Bearer $2b$10$XNFebRmGwTxQHr5PcTcuHObrF08hAo7D7RKpTCP0fT_ZJ98HY9N_m',
          },
        }
      );
      setQrCode(URL.createObjectURL(qrcodeRes));
    } catch (error) {
      console.log('QR CODE ERROR', error);
    } finally {
      appContext.onCloseLoading();
    }
  };

  return (
    <Page
      user={user}
      path='/private/settings'
      title='Doupi - Configurações'
      description='App para genciamento de agendamentos'
    >
      <Box h={'full'} m={5}>
        <Heading mb={5} fontSize={'2xl'} textAlign={'center'}>
          Configurações
        </Heading>

        <Box
          w={250}
          textAlign={'center'}
          border={'1px solid #ccc'}
          p={5}
          borderRadius={10}
        >
          <Text fontWeight={'bold'} mb={3}>
            Serviço do whatsapp{' '}
          </Text>
          <Flex>
            {isWhatsaapConnected ? (
              <Text> Você está conectado! </Text>
            ) : (
              <Box>
                <Text mb={5}> Você ainda não está conectado </Text>
                {!qrCode ? (
                  <Button onClick={connectWhatsapp} mt={5}>
                    {' '}
                    Conectar{' '}
                  </Button>
                ) : (
                  <>
                    <Image alt='qrcode' src={qrCode} />
                    <Button onClick={checkStatus} w={'full'} mt={5}>
                      {' '}
                      Testar conexão{' '}
                    </Button>
                  </>
                )}
              </Box>
            )}
          </Flex>
        </Box>
      </Box>
    </Page>
  );
}
