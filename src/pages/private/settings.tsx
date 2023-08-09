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
import axios, { AxiosInstance } from 'axios';
import { withIronSessionSsr } from 'iron-session/next';
import { transformPhoneNumber } from '@/utils/general';
import { AppContext } from '@/contexts/app';
import { getWhatsappInstance } from '@/services/whatsapp';
import { getApiInstance } from '@/services/api';

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

let whatsappToken: string;
let api: AxiosInstance;
export default function Company({ user }: any) {
  const appContext = useContext(AppContext);
  const [company, setCompany] = useState({});
  const [isWhatsaapConnected, setIsWhatsaapConnected] = useState(false);
  const [countAttempts, setCountAttempts] = useState(0);
  const [qrCode, setQrCode] = useState('');
  const toast = useToast();

  useEffect(() => {
    api = getApiInstance(user);
    whatsappToken = user.whatsappToken;
    getData();
  }, []);

  const getData = async () => {
    checkStatus();
  };

  const getCompany = async () => {
    try {
      const { data } = await api.get(`/api/companies?_id=${user.companyId}`);
      if (data.length > 0) setCompany(data[0]);
      return data[0];
    } catch (error) {
      console.log('Error to get company');
      return null;
    }
  };

  const checkStatus = async (token?: string, nofity = true) => {
    try {
      appContext.onOpenLoading();

      const companyRes = company ? company : await getCompany();

      whatsappToken = token || companyRes.whatsappToken || whatsappToken;

      if (!whatsappToken) throw new Error('No token!');

      const { data: statusRes } = await getWhatsappInstance(whatsappToken).get(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(
          user.companyWhatsapp
        )}/check-connection-session`
      );

      if (statusRes.status) {
        setIsWhatsaapConnected(true);
        setQrCode('');

        const body = {
          _id: user.companyId,
          isWhatsappService: true,
          whatsappToken,
        };

        await api.put(`/api/companies`, body);

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
        if (nofity)
          toast({
            title: 'O serviço de Whatsapp não está conectado!',
            description: 'O Whatsapp está desconectado, tente novamente!',
            status: 'info',
            position: 'top-right',
            duration: 6000,
            isClosable: true,
          });
        setIsWhatsaapConnected(false);
      }
    } catch (error) {
      if (nofity)
        toast({
          title: 'O serviço de Whatsapp não está conectado!',
          description: 'O Whatsapp está desconectado, tente novamente!',
          status: 'info',
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

      const { data: generateTokenRes } = await api.post(`/api/whatsapp`, {
        clientId: transformPhoneNumber(user.companyWhatsapp),
      });

      whatsappToken = generateTokenRes.token;

      await getWhatsappInstance(whatsappToken).post(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(user.companyWhatsapp)}/start-session`
      );

      await new Promise((resolve) => setTimeout(() => resolve(null), 10000));

      appContext.onCloseLoading();

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
      for (let i = 0; i < 4 || !isWhatsaapConnected; i++) {
        if (isWhatsaapConnected) {
          setIsWhatsaapConnected(false);
          setQrCode('');
          setCountAttempts(0);
          break;
        }

        const { data: qrcodeRes } = await axios.get(
          `${
            process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
          }/api/${transformPhoneNumber(user.companyWhatsapp)}/qrcode-session`,
          {
            responseType: 'arraybuffer',
            headers: {
              'Content-Type': 'image/png',
              Authorization: `Bearer ${whatsappToken}`,
            },
          }
        );

        const base64String =
          'data:image;base64,' +
          btoa(
            new Uint8Array(qrcodeRes).reduce(
              (data, byte) => data + String.fromCharCode(byte),
              ''
            )
          );

        setQrCode(base64String);

        await new Promise((resolve) => setTimeout(() => resolve(null), 10000));
        await checkStatus(whatsappToken, false);
      }
    } catch (error) {
      console.log('QR CODE ERROR', error);
    }
  };

  const sendMessage = async () => {
    try {
      appContext.onOpenLoading();

      console.log(whatsappToken);

      await getWhatsappInstance(whatsappToken).post(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(user.companyWhatsapp)}/send-message`,
        {
          phone: `${transformPhoneNumber(user.companyWhatsapp)}@c.us`,
          isGroup: false,
          message: 'O serviço de whatsapp da Doupi está conectado!',
        }
      );
      appContext.onCloseLoading();
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

  const disconnectService = async () => {
    try {
      appContext.onOpenLoading();

      await getWhatsappInstance(whatsappToken).post(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(user.companyWhatsapp)}/logout-session`
      );

      const body = {
        _id: user.companyId,
        isWhatsappService: false,
        whatsappToken: '',
      };

      whatsappToken = '';

      await api.put(`/api/companies`, body);

      checkStatus();

      appContext.onCloseLoading();
    } catch (error) {
      console.log('QR CODE ERROR', error);
      appContext.onCloseLoading();
      toast({
        title: 'Houve algum problema',
        description:
          'Não conseguimos encessar o serviço do whatsapp, tente novamente em instantes, ou aviso o nosso suporte!',
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
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
          w={350}
          textAlign={'center'}
          border={'1px solid #ccc'}
          p={5}
          borderRadius={10}
        >
          <Text fontWeight={'bold'} mb={3}>
            Serviço do whatsapp{' '}
          </Text>
          <Flex justifyContent={'center'} gap={10}>
            {isWhatsaapConnected ? (
              <Box display={'flex'} flexDir={'column'} gap={5}>
                <Text> Você está conectado! </Text>
                <Button onClick={sendMessage}>
                  {' '}
                  Enviar mensagem pra mim mesmo{' '}
                </Button>
                <Button onClick={disconnectService} colorScheme='red'>
                  {' '}
                  Desconectar serviço{' '}
                </Button>
              </Box>
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
                    {qrCode ? (
                      <Image alt='qrcode' src={qrCode} />
                    ) : (
                      <Text> Aguarde o qr code </Text>
                    )}
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
