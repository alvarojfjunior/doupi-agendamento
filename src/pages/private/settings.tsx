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
  const [dontKnowStatus, setDontKnowStatus] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const toast = useToast();

  useEffect(() => {
    api = getApiInstance(user);
    whatsappToken = user.whatsappToken;
    getData();
  }, []);

  const getData = async () => {
    try {
      const { data } = await api.get(`/api/companies?_id=${user.companyId}`);
      const newCompany = data[0];
      setCompany(newCompany);
      whatsappToken = newCompany.whatsappToken;

      checkIfWorkAndStartSesseion();
    } catch (error) {
      console.log('error');
    }
  };

  const checkIfWorkAndStartSesseion = async (nofity = true) => {
    try {
      let isConncted = false;

      if (nofity) appContext.onOpenLoading();

      if (!whatsappToken) {
        if (nofity)
          toast({
            title: 'O serviço de Whatsapp Doupi NÃO está conectado!',
            description: 'Você precisa se conectar!',
            status: 'info',
            position: 'top-right',
            duration: 6000,
            isClosable: true,
          });
        setIsWhatsaapConnected(false);
        return false;
      }

      const isConnected = await connectWhatsapp(false, nofity);

      if (isConnected) {
        toast({
          title: 'O serviço de Whatsapp Doupi está conectado!',
          description: 'Está tudo certo!',
          status: 'success',
          position: 'top-right',
          duration: 6000,
          isClosable: true,
        });
        setIsWhatsaapConnected(true);
        isConncted = true;
      } else {
        if (nofity)
          toast({
            title: 'O serviço de Whatsapp Doupi NÃO está conectado!',
            description: 'Você precisa se conectar!',
            status: 'info',
            position: 'top-right',
            duration: 6000,
            isClosable: true,
          });
        setIsWhatsaapConnected(false);
        isConncted = true;
      }

      appContext.onCloseLoading();
      return isConncted;
    } catch (error) {
      appContext.onCloseLoading();
      toast({
        title: 'Não foi possível verificar o seu status!',
        description: 'Tente mais tarde, ou entre em contato com o suporte!',
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
      setDontKnowStatus(true);
      setIsWhatsaapConnected(false);
      setQrCode('');
      return false;
    }
  };

  const connectWhatsapp = async (isNew = false, nofity = true) => {
    try {
      if (nofity) appContext.onOpenLoading();

      let isConncted = false;

      if (isNew) {
        const { data: generateTokenRes } = await api.post(`/api/whatsapp`, {
          clientId: transformPhoneNumber(user.companyWhatsapp),
        });
        whatsappToken = generateTokenRes.token;
      }

      while (true) {
        const { data: startRes } = await getWhatsappInstance(
          whatsappToken
        ).post(
          `${
            process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
          }/api/${transformPhoneNumber(user.companyWhatsapp)}/start-session`
        );

        if (startRes.status === 'CONNECTED') {
          isConncted = true;
          const body = {
            _id: user.companyId,
            isWhatsappService: true,
            whatsappToken,
          };
          await api.put(`/api/companies`, body);
          setIsWhatsaapConnected(true);
          setQrCode('');
          break;
        } else if (startRes.qrcode) {
          isConncted = false;
          setIsWhatsaapConnected(false);
          if (isNew) {
            setQrCode(startRes.qrcode);
            getQrcode();
          }
          break;
        } else {
          isConncted = false;
          await new Promise((resolve) =>
            setTimeout(() => resolve(null), 10000)
          );
        }
      }

      appContext.onCloseLoading();
      return isConncted;
    } catch (error) {
      console.log('QR CODE ERROR', error);
      appContext.onCloseLoading();
      toast({
        title: 'Houve um problema ao se conectar',
        description:
          'Não foi possível se conectar no serviço de whatsapp da Doupi, tente mais tarde!',
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });
      setDontKnowStatus(true);
      whatsappToken = user.whatsappToken;
      return false;
    }
  };

  const getQrcode = async () => {
    try {
      while (true) {
        await new Promise((resolve) => setTimeout(() => resolve(null), 5000));

        const isConnected = await connectWhatsapp(false, false);
        if (isConnected) break;

        const { data: qrcodeRes } = await getWhatsappInstance(
          whatsappToken
        ).get(
          `/api/${transformPhoneNumber(user.companyWhatsapp)}/qrcode-session`,
          {
            responseType: 'arraybuffer',
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
      }
    } catch (error) {
      console.log(error);
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
          phone: transformPhoneNumber(user.companyWhatsapp),
          isGroup: false,
          message: 'O serviço de whatsapp da Doupi está conectado!',
        }
      );
      appContext.onCloseLoading();
    } catch (error: any) {
      console.log('QR CODE ERROR', error);
      appContext.onCloseLoading();
      toast({
        title: 'Houve algum problema',
        description: error.response
          ? error.response.data.message
          : 'Não foi possível enviar a mensagem!',
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

      checkIfWorkAndStartSesseion();

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

  const restartConnection = async () => {
    try {
      appContext.onOpenLoading();

      await getWhatsappInstance(whatsappToken).post(
        `${
          process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(user.companyWhatsapp)}/close-session`
      );

      await checkIfWorkAndStartSesseion();

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
            {!dontKnowStatus ? (
              <Box>
                {isWhatsaapConnected ? (
                  <Box display={'flex'} flexDir={'column'} gap={5}>
                    <Text> Você está conectado! </Text>
                    <Button onClick={sendMessage} colorScheme='blue'>
                      {' '}
                      Enviar mensagem pra mim mesmo{' '}
                    </Button>
                    <Button onClick={restartConnection} colorScheme='yellow'>
                      {' '}
                      Reiniciar conexão{' '}
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
                      <Button
                        onClick={() => connectWhatsapp(true, true)}
                        mt={5}
                      >
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
              </Box>
            ) : (
              <Button
                //@ts-ignore
                onClick={checkIfWorkAndStartSesseion}
              >
                {' '}
                Verificar status{' '}
              </Button>
            )}
          </Flex>
        </Box>
      </Box>
    </Page>
  );
}
