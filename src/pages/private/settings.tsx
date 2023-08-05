import {
  Box,
  Button,
  chakra,
  Heading,
  useToast,
  Text,
  Flex,
} from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/contexts/app';
import Page from '@/components/Page';
import axios from 'axios';
import { withIronSessionSsr } from 'iron-session/next';
import QRCodeReact from 'qrcode.react';
import { transformPhoneNumber } from '@/utils/general';
import { whatsappApiInstance } from '@/services/whatsappApi';

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
  const [qrCode, setQrCode] = useState('null');
  const toast = useToast();

  const getWhatsAppServiceStatus = async () => {
    try {
      setQrCode('');
      const { data } = await axios.get(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/connect-client?id=${transformPhoneNumber(user.companyWhatsapp)}`
      );
      if (data && data.message && data.message === 'connected') {
        setIsWhatsaapConnected(true);
      } else if (data && data.message && data.message.length > 20) {
        setIsWhatsaapConnected(false);
        setQrCode(data.message);
        await new Promise((resolve) => setTimeout(resolve, 40000));
        setQrCode('null');
      }
    } catch (error) {
      setQrCode('null');
      toast({
        title: 'Houve um problema ao trazer o seu status.',
        description:
          'O serviço do whatsapp está com indisponibilidade no momento, tente mais tarde.',
        status: 'info',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
    }
  };

  const sendMessage = async () => {
    try {
      appContext.onCloseLoading();
      const { data } = await axios.post(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/send-message?id=${transformPhoneNumber(user.companyWhatsapp)}`,
        {
          to: transformPhoneNumber(user.companyWhatsapp),
          message: 'O serviço do whatsapp está em pleno funcionamento!',
        }
      );

      if (data && data.message && data.message === 'connected') {
        setIsWhatsaapConnected(true);
      } else if (data && data.message && data.message.length > 100) {
        setIsWhatsaapConnected(false);
        setQrCode(data.message);
      }

      console.log('HEERE', data);
    } catch (error) {
      appContext.onCloseLoading();
    }
  };

  return (
    <Page
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
            {!isWhatsaapConnected ? (
              qrCode ? (
                <Box w={'full'}>
                  {qrCode === 'null' ? (
                    <Button
                      onClick={getWhatsAppServiceStatus}
                      colorScheme='yellow'
                      color={'white'}
                    >
                      {' '}
                      Verificar{' '}
                    </Button>
                  ) : (
                    <Box>
                      <Text color={'#535353'} fontSize={13} mb={3}>
                        {' '}
                        Você ainda não está conectado, escaneie o qrcode abaixo
                        pelo Whatsapp para conectar!{' '}
                      </Text>
                      <QRCodeReact
                        value={qrCode}
                        style={{
                          width: '100%',
                          height: 190,
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Text fontWeight={'semibold'} color={'#535353'}>
                  {' '}
                  Aguarde, checando status...{' '}
                </Text>
              )
            ) : (
              <Box>
                <Text fontWeight={'bold'} color={'green'}>
                  {' '}
                  Você está Conectado!{' '}
                </Text>
                <Button onClick={sendMessage} width={200} h={100}>
                  Testar o serviço
                </Button>
                <Text color={'#535353'} fontSize={13}>
                  Enviar mensagem para mim mesmo.
                </Text>
              </Box>
            )}
          </Flex>
        </Box>
      </Box>
    </Page>
  );
}
