import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Image as ChakraImage,
  Input,
  VStack,
  Select,
  useColorModeValue,
  HStack,
  useToast,
} from '@chakra-ui/react';
import InputColor from 'react-input-color';
import { useContext, useEffect } from 'react';
import * as Yup from 'yup';
import InputMask from 'react-input-mask';
import { useFormik } from 'formik';
import { AppContext } from '@/contexts/app';
import Page from '@/components/Page';
import { AxiosInstance } from 'axios';
import { IUser } from '@/types/api/User';
import { getApiInstance } from '@/services/api';
import { useRouter } from 'next/router';
import { withIronSessionSsr } from 'iron-session/next';
import { handleImageImageAndUpload } from '@/utils/upload';
import Link from 'next/link';

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

  const onSubmit = async (values: any) => {
    try {
      appContext.onOpenLoading();


      values.whatsapp = values.phone

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
    },
    validationSchema: Yup.object().shape({
      coverImage: Yup.string().min(50).required(),
      name: Yup.string().min(2).max(50).required(),
      color: Yup.string().min(2).max(10).required(),
      businessType: Yup.string().min(2).max(50).required(),
      responsableName: Yup.string().min(2).max(50).required(),
      phone: Yup.string().max(16).required(),
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

  return (
    <Page
      user={user}
      path='/private/company'
      title='Doupi - Configurações da Empresa'
      description='App para genciamento de agendamentos'
    >
      <form onSubmit={formik.handleSubmit}>
        <Box p={4} maxWidth='700px' mx='auto'>
          <Heading mb={5} fontSize={'2xl'} textAlign={'center'}>
            Configurações da empresa
          </Heading>
          <Box mb={5}>
            <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
              Link de agendamento
            </FormLabel>
            <Link href={`/d/${formik.values.name.replaceAll(' ', '-')}`}>
              {' '}
              {process.env.NEXT_PUBLIC_API_URL}/d/{formik.values.name.replaceAll(
                ' ',
                '-'
              )}{' '}
            </Link>
          </Box>
          <VStack spacing={4} align='stretch'>
            <FormControl
              id='coverImage'
              isRequired
              isInvalid={
                !!formik.errors.coverImage && formik.touched.coverImage
              }
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Imagem de Capa
              </FormLabel>
              <Box
                position='relative'
                display='inline-block'
                width={'100%'}
                height={250}
                overflow='hidden'
                justifyContent='center'
                alignItems='center'
              >
                <ChakraImage
                  src={formik.values.coverImage}
                  alt='Imagem de Capa'
                  mb={2}
                  rounded={10}
                  style={{
                    objectFit: 'cover',
                    width: '100%',
                    height: '100%',
                  }}
                />
                <Input
                  type='file'
                  accept='image/*'
                  name='coverPreview'
                  onChange={(event) =>
                    handleImageImageAndUpload(event, 0.3, (url: string) =>
                      formik.setFieldValue('coverImage', url)
                    )
                  }
                  position='absolute'
                  top={0}
                  left={0}
                  opacity={0}
                  width='100%'
                  height='100%'
                  cursor='pointer'
                  zIndex={1}
                  required={false}
                />
              </Box>
            </FormControl>
            <FormControl
              id='color'
              isRequired
              isInvalid={!!formik.errors.color && formik.touched.color}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Cor tema
              </FormLabel>
              <InputColor
                placement='left'
                //@ts-ignore
                style={{
                  width: '100%',
                  height: 70,
                }}
                initialValue={formik.values.color}
                onChange={(e: any) => formik.setFieldValue('color', e.hex)}
              />
            </FormControl>

            <HStack>
              <FormControl
                id='name'
                isRequired
                isInvalid={!!formik.errors.name && formik.touched.name}
              >
                <FormLabel>Nome da empresa</FormLabel>
                <Input
                  type='text'
                  name='name'
                  value={formik.values.name}
                  onChange={formik.handleChange}
                />
              </FormControl>

              <FormControl
                id='responsableName'
                isRequired
                isInvalid={
                  !!formik.errors.responsableName &&
                  formik.touched.responsableName
                }
              >
                <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                  Nome do responsável
                </FormLabel>
                <Input
                  type='text'
                  name='responsableName'
                  value={formik.values.responsableName}
                  onChange={formik.handleChange}
                />
              </FormControl>
            </HStack>
            <HStack>
              <FormControl
                id='businessType'
                isRequired
                isInvalid={
                  !!formik.errors.businessType && formik.touched.businessType
                }
              >
                <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                  Ramo da empresa
                </FormLabel>
                <Select
                  name='businessType'
                  id='businessType'
                  value={formik.values.businessType}
                  onChange={formik.handleChange}
                >
                  <option value='Beleza'>Beleza</option>
                  <option value='Beleza'>Estética</option>
                  <option value='Saúde'>Saúde</option>
                </Select>
              </FormControl>

              <FormControl
                id='phone'
                isRequired
                isInvalid={!!formik.errors.phone && formik.touched.phone}
              >
                <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                  Telefone (whatsapp){' '}
                </FormLabel>
                <Input
                  name='phone'
                  as={InputMask}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  mask='(99) 9 9999-9999'
                />
              </FormControl>
            </HStack>

            <HStack>
              <FormControl
                id='email'
                isRequired
                isInvalid={!!formik.errors.email && formik.touched.email}
              >
                <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                  {' '}
                  Email{' '}
                </FormLabel>
                <Input
                  type='email'
                  name='email'
                  value={formik.values.email}
                  onChange={formik.handleChange}
                />
              </FormControl>
            </HStack>

            <Button
              color={useColorModeValue('#fff', '#fff')}
              bg={useColorModeValue('#ffc03f', '#ffc03f')}
              _hover={{ filter: 'brightness(110%)' }}
              type={'submit'}
            >
              Salvar
            </Button>
          </VStack>
        </Box>
      </form>
    </Page>
  );
}
