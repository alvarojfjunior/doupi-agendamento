import {
  Box,
  Button,
  useColorModeValue,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { AppContext } from '@/contexts/app';
import Page from '@/components/Page';
import { AxiosInstance } from 'axios';
import { getApiInstance } from '@/services/api';
import { useRouter } from 'next/router';
import { withIronSessionSsr } from 'iron-session/next';
import {
  createSessionWhatsappApi,
  deleteSessionWhatsappApi,
  getQrCodeSessionWhatsappApi,
  sendMessageWhatsappApi,
} from '@/services/whatsapp';
import { delay } from '@/utils/general';

// Importando os componentes de abas
import GeneralInfoTab from '@/components/CompanyTabs/GeneralInfoTab';
import IntegrationsTab from '@/components/CompanyTabs/IntegrationsTab';

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
export default function Company({ user }: any) {
  const appContext = useContext(AppContext);
  const toast = useToast();
  const router = useRouter();
  const [isWhatsappApiConnected, setIsWhatsappApiConnected] = useState<
    undefined | boolean
  >(undefined);
  const [whatsappQrCode, setWhatsappQrCode] = useState<string | undefined>(
    undefined
  );

  const onSubmit = async (values: any) => {
    try {
      appContext.onOpenLoading();

      values.whatsapp = values.phone;

      const { data } = await api.put(`/api/companies`, values);
      appContext.onCloseLoading();
      router.push('/private');
      toast({
        title: 'Sucesso!',
        description: 'Os dados da sua empresa foram alterados!',
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
    } catch (error: any) {
      console.log(error);
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
      coverImage: '',
      name: '',
      responsableName: '',
      businessType: 'Beleza',
      color: '',
      phone: '',
      email: '',
      isWhatsappApi: false,
      isStripeEnabled: false,
      stripePublishableKey: '',
      stripeSecretKey: '',
    },
    validationSchema: Yup.object().shape({
      coverImage: Yup.string().min(50).required(),
      name: Yup.string().min(2).max(50).required(),
      color: Yup.string().min(2).max(10).required(),
      businessType: Yup.string().min(2).max(50).required(),
      responsableName: Yup.string().min(2).max(50).required(),
      phone: Yup.string().max(16).required(),
      isWhatsappApi: Yup.boolean(),
      isStripeEnabled: Yup.boolean(),
      stripePublishableKey: Yup.string(),
      stripeSecretKey: Yup.string()
    }),
    onSubmit: onSubmit,
  });

  useEffect(() => {
    api = getApiInstance(user);
    getCompanyData();
    appContext.onCloseLoading();
  }, []);

  const getCompanyData = async () => {
    try {
      const { data } = await api.get(`/api/companies?_id=${user.companyId}`);
      if (data.length > 0) {
        formik.setValues(data[0]);
        appContext.onCloseLoading();
      } else {
        router.push('/');
      }
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  const handleTestWhatsappConnection = async () => {
    try {
      const data = await sendMessageWhatsappApi(
        formik.values.phone,
        formik.values.phone,
        'O serviço de whatsapp está configuradao.',
        user
      );

      if (data.message != 'ok')
        throw new Error('Erro ao testar conexão com a API do WhatsApp');

      setIsWhatsappApiConnected(true);
      api.put(`/api/companies`, { _id: user.companyId, isWhatsappApi: true });

      toast({
        title: 'Sucesso!',
        description: 'A conexão com a API do WhatsApp foi testada com sucesso!',
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
    } catch (error: any) {
      api.put(`/api/companies`, { _id: user.companyId, isWhatsappApi: false });
      setIsWhatsappApiConnected(false);
      toast({
        title: 'Erro!',
        description: 'Houve um erro ao testar a conexão com a API do WhatsApp!',
        status: 'error',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const handleReconnectWhatsappConnection = async () => {
    try {
      appContext.onOpenLoading();
      await deleteSessionWhatsappApi(formik.values.phone, user);
      await createSessionWhatsappApi(formik.values.phone, user);
      await delay(1500);
      const data = await getQrCodeSessionWhatsappApi(formik.values.phone, user);
      setWhatsappQrCode(data);
      appContext.onCloseLoading();
    } catch (error) {
      appContext.onCloseLoading();
      setIsWhatsappApiConnected(false);
      toast({
        title: 'Erro!',
        description: 'Houve um erro ao testar a conexão com a API do WhatsApp!',
        status: 'error',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <Page
      user={user}
      path='/private/company'
      title='Doupi - Configurações da Empresa'
      description='App para genciamento de agendamentos'
    >
      <form onSubmit={formik.handleSubmit}>
        <Tabs p={4} maxWidth='700px' mx='auto'>
          <TabList>
            <Tab>Inforamações Gerais</Tab>
            <Tab>Integrações</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <GeneralInfoTab formik={formik} />
            </TabPanel>
            <TabPanel>
              <IntegrationsTab
                formik={formik}
                isWhatsappApiConnected={isWhatsappApiConnected}
                whatsappQrCode={whatsappQrCode}
                handleTestWhatsappConnection={handleTestWhatsappConnection}
                handleReconnectWhatsappConnection={handleReconnectWhatsappConnection}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
        <Box textAlign={'center'}>
          <Button
            color={useColorModeValue('#fff', '#fff')}
            bg={useColorModeValue('#ffc03f', '#ffc03f')}
            _hover={{ filter: 'brightness(110%)' }}
            type={'submit'}
            w={200}
          >
            Salvar
          </Button>
        </Box>
      </form>
    </Page>
  );
}
