import {
  Box,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Text,
  Tbody,
  Td,
  useColorMode,
  IconButton,
  Stack,
  Heading,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  HStack,
  DrawerHeader,
  DrawerBody,
  FormLabel,
  FormControl,
  Input,
  DrawerFooter,
  Button,
  Divider,
  Flex,
  Textarea,
  useToast,
  VStack,
  Image,
} from '@chakra-ui/react';
import makeAnimated from 'react-select/animated';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/contexts/app';
import InputMask from 'react-input-mask';
import { useRouter } from 'next/router';
import Page from '@/components/Page';
import { IUser } from '@/types/api/User';
import axios, { AxiosInstance } from 'axios';
import { getAxiosInstance } from '@/services/api';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { AddIcon, ArrowRightIcon, EditIcon } from '@chakra-ui/icons';
import { withIronSessionSsr } from 'iron-session/next';
import QRCode, { QRCodeSVG } from 'qrcode.react';
import { objetoTemConteudo } from '@/utils/general';
import { sendMessage } from '@/services/whatsapp';

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

let api: AxiosInstance;
export default function Clients({ user }: any) {
  const appContext = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [data, setData] = useState([]);
  const toast = useToast();

  const onSubmit = async (values: any) => {
    try {
      appContext.onOpenLoading();
      let res: any;

      values.companyId = user.companyId;

      if (isEditing) res = await api.put(`/api/clients`, values);
      else res = await api.post(`/api/clients`, values);

      updateData(res.data);
      appContext.onCloseLoading();
      toast({
        title: 'Sucesso!',
        description: 'Os dados foram salvos!',
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: 'Houve um erro',
        description: error.Message,
        status: 'error',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
      appContext.onCloseLoading();
    }
  };

  const formik = useFormik({
    initialValues: {
      isWhatsappConnected: false,
    },
    validationSchema: Yup.object().shape({}),
    onSubmit: onSubmit,
  });

  useEffect(() => {
    api = getAxiosInstance(user);
    getData();
  }, []);

  const updateData = (item: any) => {
    const indice = data.findIndex((d: any) => d._id === item._id);
    if (indice > -1) {
      const newArray = [...data];
      //@ts-ignore
      newArray[indice] = item;
      setData(newArray);
    } else {
      //@ts-ignore
      setData((prevArray: any) => [...prevArray, item]);
    }
  };

  const getData = async () => {
    try {
      appContext.onOpenLoading();
      await getWhatsappInstanceIsConnected();
      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  const getWhatsappInstanceIsConnected = async () => {
    try {
      appContext.onOpenLoading();

      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API}/instance/info?key=${user.companyId}`
      );

      if (data && data.instance_data && data.instance_data.user.id)
        formik.setFieldValue('isWhatsappConnected', true);
      else formik.setFieldValue('isWhatsappConnected', false);

      appContext.onCloseLoading();
    } catch (error) {
      formik.setFieldValue('isWhatsappConnected', false);
      appContext.onCloseLoading();
    }
  };

  const handleDisconectWhatsapp = async () => {
    try {
      appContext.onOpenLoading();
      await axios.delete(
        `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API}/instance/logout?key=${user.companyId}`
      );
      await axios.delete(
        `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API}/instance/delete?key=${user.companyId}`
      );
      formik.setFieldValue('isWhatsappConnected', false);
      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  const handleGetQrCode = async () => {
    try {
      appContext.onOpenLoading();

      const { data: initInstance } = await axios.get(
        `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API}/instance/init?key=${user.companyId}`
      );

      for (let i = 0; i < 5; i++) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        const { data: qrCode } = await axios.get(
          `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API}/instance/qrbase64?key=${user.companyId}`
        );

        if (String(qrCode.qrcode).length > 10) {
          setQrCode(qrCode.qrcode);
          break;
        }
      }

      appContext.onCloseLoading();
    } catch (error) {
      appContext.onCloseLoading();
    }
  };

  const handleTesteWhatsapp = async () => {
    try {
      appContext.onOpenLoading();

      await sendMessage(
        user.companyId,
        user.companyWhatsapp,
        'O módulo de whatsapp da Doupi está configurado!'
      );

      formik.setFieldValue('isWhatsappConnected', true)

      toast({
        title: 'Sucesso!',
        description: 'Uma mensagem foi enviada para o número da empresa!',
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
      appContext.onCloseLoading();
    } catch (error) {
      appContext.onCloseLoading();
    }
  };

  return (
    <Page
      path='/settings'
      title='Doupi - Configurações'
      description='App para genciamento de agendamentos'
    >
      <Stack h={'full'} m={5}>
        <Heading mb={5} fontSize={'2xl'} textAlign={'center'}>
          Configurações
        </Heading>
        <form onSubmit={formik.handleSubmit}>
          <FormControl
            id='isWhatsappConnected'
            isRequired
            isInvalid={
              !!formik.errors.isWhatsappConnected &&
              formik.touched.isWhatsappConnected
            }
          >
            <FormLabel>
              Whatsapp (
              {formik.values.isWhatsappConnected
                ? 'Conectado'
                : 'Você não está conectado.'}
              )
            </FormLabel>
            {formik.values.isWhatsappConnected ? (
              <HStack spacing={4}>
                <Button onClick={handleDisconectWhatsapp} colorScheme='red'>
                  {' '}
                  Desconectar{' '}
                </Button>
                <Button onClick={handleTesteWhatsapp} colorScheme='blue'>
                  {' '}
                  Testar{' '}
                </Button>
              </HStack>
            ) : (
              <HStack spacing={4}>
                {qrCode ? (
                  <>
                    <Image src={qrCode} alt='qrCode' />
                    <Button onClick={handleTesteWhatsapp} colorScheme='blue'>
                      {' '}
                      Testar{' '}
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleGetQrCode}> Conectar </Button>
                )}
              </HStack>
            )}
          </FormControl>
        </form>
      </Stack>
    </Page>
  );
}
