import {
  Box,
  Button,
  chakra,
  Heading,
  useToast,
  Text,
  Flex,
} from '@chakra-ui/react';
import { useContext, useState } from 'react';
import { AppContext } from '@/contexts/app';
import Page from '@/components/Page';
import axios from 'axios';
import { withIronSessionSsr } from 'iron-session/next';
import QRCodeReact from 'qrcode.react';
import { transformPhoneNumber } from '@/utils/general';

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
  const token = '';
  const appContext = useContext(AppContext);
  const [isWhatsaapConnected, setIsWhatsaapConnected] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [countAttempts, setCountAttempts] = useState(0);
  const [qrCode, setQrCode] = useState('null');
  const toast = useToast();

  const getWhatsAppServiceStatus = async () => {
    try {
      setQrCode('');
      setLoadingMessage('Aguarde, checando status...');

      const { data: statusRes } = await axios.get(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(
          user.companyWhatsapp
        )}/check-connection-session`
      );

      console.log(statusRes);
    } catch (error) {
      console.log(error);
    }
  };

  const getQrcode = async () => {
    if (countAttempts > 5) {
      setIsWhatsaapConnected(false);
      setQrCode('');
      return;
    }

    setCountAttempts(countAttempts + 1);
    await new Promise((resolve) => setTimeout(() => resolve(null), 10000));
    console.log('got a new qrcode');
    try {
      const { data } = await axios.get(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/session/qr/${transformPhoneNumber(user.companyWhatsapp)}`
      );
      setQrCode(data.message);
    } catch (error) {
      console.log('QR CODE ERROR', error);
    }

    if (!isWhatsaapConnected)
      new Promise((resolve) => setTimeout(() => resolve(getQrcode()), 20000));
  };

  const sendMessage = async () => {
    try {
      appContext.onCloseLoading();
      const { data } = await axios.post(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/client/sendMessage/${transformPhoneNumber(user.companyWhatsapp)}`,
        {
          chatId: `${transformPhoneNumber(user.companyWhatsapp, false)}@c.us`,
          contentType: 'string',
          message: 'O serviço do whatsapp está em pleno funcionamento!',
        }
      );

      toast({
        title: 'Serviço conectado!',
        description: 'Está tudo certo! O serviço do whatsapp está configurado.',
        status: 'success',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });

      if (data && data.success) {
        setIsWhatsaapConnected(true);
      } else {
        setIsWhatsaapConnected(false);
      }
    } catch (error) {
      toast({
        title: 'Houve algum problema',
        description:
          'Não conseguimos testar o serviço do whatsapp, tente novamente em instantes, ou aviso o nosso suporte!',
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
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
                      {countAttempts > 0 && (
                        <Button
                          onClick={sendMessage}
                          width={200}
                          h={100}
                          mt={3}
                        >
                          Testar
                        </Button>
                      )}
                    </Box>
                  )}
                </Box>
              ) : (
                <Text
                  fontWeight={'semibold'}
                  color={'#535353'}
                  textAlign={'center'}
                >
                  {loadingMessage}
                </Text>
              )
            ) : (
              <Box>
                <Text fontWeight={'bold'} color={'green'} textAlign={'center'}>
                  {' '}
                  Você está Conectado!{' '}
                </Text>
                <Button onClick={sendMessage} width={200} h={100} mb={5}>
                  Testar
                </Button>
              </Box>
            )}
          </Flex>
        </Box>
      </Box>
    </Page>
  );
}
