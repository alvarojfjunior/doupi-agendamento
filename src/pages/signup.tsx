import {
  Flex,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  HStack,
  InputRightElement,
  Stack,
  Button,
  Heading,
  Link,
  Text,
  useColorModeValue,
  FormErrorMessage,
  useToast,
  Select,
} from '@chakra-ui/react';
import { useState, useContext } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import NextLink from 'next/link';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { useRouter } from 'next/router';
import { getAxiosInstance } from '@/services/api';
import { AppContext } from '@/contexts/app';
import Page from '@/components/Page';
import { PhoneInput } from '@/components/Fields';
import { withIronSessionSsr } from 'iron-session/next';

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

interface IForm {
  companyName: string;
  userName: string;
  type: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface IUserAuth {
  email: string;
  name: string;
  status: number;
  token: string;
  type: number;
}

export default function SignupCard() {
  const toast = useToast();
  const appContext = useContext(AppContext);
  const [showPassword, setShowPassword] = useState(false);

  const api = getAxiosInstance();
  const router = useRouter();

  const SignupSchema = Yup.object().shape({
    companyName: Yup.string().min(2).max(50).required(),
    userName: Yup.string().min(2).max(50).required(),
    phone: Yup.string().min(16).max(16).required(),
    email: Yup.string().email('Invalid email').required(),
    password: Yup.string()
      .min(8, 'A senha deve ter 8 caracteres!')
      .matches(/[0-9]/, 'A senha deve ter número!')
      .required('Campo obrigatório'),
    confirmPassword: Yup.string()
      //@ts-ignore
      .oneOf([Yup.ref('password'), null], 'As senhas não coincidem')
      .required('Campo obrigatório'),
  });

  const onSubmit = async (values: IForm) => {
    try {
      appContext.onOpenLoading();
      const signupData = {
        companyName: values.companyName,
        userName: values.userName,
        type: values.type,
        phone: values.phone,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
      };
      await api.post('api/auth/signup', signupData);

      toast({
        title: 'Conta criada com sucesso!',
        description: 'Agora é hora de personalizar o seu negócio!',
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });

      const credentials = {
        email: signupData.email,
        password: signupData.password,
      };

      const { data } = await api.post('/api/auth/signin', credentials);

      const userAuth: IUserAuth = data;


      router.push('private/company');
    } catch (error: any) {
      const errorMessage = error.response.data.message;
      toast({
        title: 'Houve um erro',
        description: errorMessage,
        status: 'error',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
      appContext.onCloseLoading();
    }
  };

  return (
    <Page
      path='/signup'
      title='Doupi - Criar conta'
      description='App para para gestão de agenda!'
    >
      <Flex
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('gray.50', 'gray.800')}
      >
        <Formik
          initialValues={{
            companyName: '',
            userName: '',
            type: 'Beleza',
            phone: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={SignupSchema}
          onSubmit={onSubmit}
        >
          {({ handleSubmit, errors, touched }) => (
            <Form onSubmit={handleSubmit}>
              <Stack spacing={8} mx={'auto'} maxW={'lg'} py={12} px={6}>
                <Stack align={'center'}>
                  <Heading fontSize={'4xl'} textAlign={'center'}>
                    Nova conta
                  </Heading>
                  <Text fontSize={'lg'} color={'#3e4d92'}>
                    Crie sua conta, é simples e rápido ✌️
                  </Text>
                </Stack>
                <Box
                  rounded={'lg'}
                  bg={useColorModeValue('white', 'gray.700')}
                  boxShadow={'lg'}
                  p={7}
                >
                  <Stack spacing={4} mb={5}>
                    <HStack>
                      <FormControl
                        id='companyName'
                        isRequired
                        isInvalid={!!errors.companyName && touched.companyName}
                      >
                        <FormLabel
                          fontSize={{ base: 'sm', md: 'md', lg: 'md' }}
                        >
                          Nome da Empresa
                        </FormLabel>
                        <Field as={Input} type='text' name='companyName' />
                      </FormControl>

                      <FormControl
                        id='userName'
                        isRequired
                        isInvalid={!!errors.userName && touched.userName}
                      >
                        <FormLabel>Seu Nome</FormLabel>
                        <Field as={Input} type='text' name='userName' />
                      </FormControl>
                    </HStack>
                  </Stack>

                  <Stack spacing={4} mb={5}>
                    <HStack>
                      <Box>
                        <FormControl
                          id='type'
                          isRequired
                          isInvalid={!!errors.type && touched.type}
                        >
                          <FormLabel
                            fontSize={{ base: 'sm', md: 'md', lg: 'md' }}
                          >
                            Ramo da sua empresa
                          </FormLabel>
                          <Field as={Select} type='text' name='type'>
                            <option value='Beleza'>Beleza</option>
                            <option value='Beleza'>Estética</option>
                            <option value='Saúde'>Saúde</option>
                          </Field>
                        </FormControl>
                      </Box>

                      <Box>
                        <FormControl
                          id='phone'
                          isRequired
                          isInvalid={!!errors.phone && touched.phone}
                        >
                          <FormLabel>Telefone de contato </FormLabel>
                          <Field as={PhoneInput} type='text' name='phone' />
                        </FormControl>
                      </Box>
                    </HStack>

                    <FormControl
                      mb={5}
                      id='email'
                      isRequired
                      isInvalid={!!errors.email && touched.email}
                    >
                      <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                        Email para contato e login
                      </FormLabel>
                      <Field as={Input} type='email' name='email' />
                    </FormControl>

                    <Stack spacing={4} mb={5}>
                      <HStack>
                        <Box>
                          <FormControl
                            id='password'
                            isRequired
                            isInvalid={!!errors.password && touched.password}
                          >
                            <FormLabel
                              fontSize={{ base: 'sm', md: 'md', lg: 'md' }}
                            >
                              Senha
                            </FormLabel>
                            <InputGroup>
                              <Field
                                as={Input}
                                type={showPassword ? 'text' : 'password'}
                                name='password'
                              />
                              <InputRightElement h={'full'}>
                                <Button
                                  variant={'ghost'}
                                  onClick={() =>
                                    setShowPassword(
                                      (showPassword) => !showPassword
                                    )
                                  }
                                >
                                  {showPassword ? (
                                    <ViewIcon />
                                  ) : (
                                    <ViewOffIcon />
                                  )}
                                </Button>
                              </InputRightElement>
                              <FormErrorMessage position={'absolute'} top={8}>
                                {errors.password}
                              </FormErrorMessage>
                            </InputGroup>
                          </FormControl>
                        </Box>

                        <Box>
                          <FormControl
                            id='confirmPassword'
                            isRequired
                            isInvalid={
                              !!errors.confirmPassword &&
                              touched.confirmPassword
                            }
                          >
                            <FormLabel
                              fontSize={{ base: 'sm', md: 'md', lg: 'md' }}
                            >
                              Confirme a Senha
                            </FormLabel>
                            <InputGroup>
                              <Field
                                as={Input}
                                type={showPassword ? 'text' : 'password'}
                                name='confirmPassword'
                              />
                              <FormErrorMessage position={'absolute'} top={8}>
                                {errors.confirmPassword}
                              </FormErrorMessage>
                            </InputGroup>
                          </FormControl>
                        </Box>
                      </HStack>
                    </Stack>

                    <Stack spacing={10} pt={2}>
                      <Button
                        type='submit'
                        loadingText='Submitting'
                        size='lg'
                        color={useColorModeValue('#fff', '#fff')}
                        bg={useColorModeValue('#ffc03f', '#ffc03f')}
                        _hover={{ filter: 'brightness(110%)' }}
                      >
                        Cadastrar
                      </Button>
                    </Stack>
                    <Stack pt={6}>
                      <Text align={'center'}>
                        Já é cadastrado?{' '}
                        <Link as={NextLink} href='./signin' color={'#ffc03f'}>
                          Entrar
                        </Link>
                      </Text>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </Form>
          )}
        </Formik>
      </Flex>
    </Page>
  );
}
