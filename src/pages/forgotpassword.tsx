import Page from '@/components/Page';
import { AppContext } from '@/contexts/app';
import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { useContext, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';
import * as Yup from 'yup';
import { getApiInstance } from '@/services/api';
import { withIronSessionSsr } from 'iron-session/next';

export const getServerSideProps = withIronSessionSsr(
  ({ req }) => {

    if (('user' in req.session))
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

export default function ForgotPasswordForm(): JSX.Element {
  const router = useRouter();
  const appContext = useContext(AppContext);
  const api = getApiInstance();
  const toast = useToast();

  useEffect(() => {
    appContext.onCloseLoading();
  }, []);

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Campo obrigatório'),
  });

  const onSubmit = async ({ email }: { email: string }) => {
    try {
      appContext.onOpenLoading();

      const { data } = await api.post('/api/auth/forgotpassword', { email });

      toast({
        title: 'Sucesso',
        description: data,
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
      toast({
        title: 'Email de alteração de senha',
        description:
          'Verifique sua caixa de entrada, e siga os passos para alterar sua senha',
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });

      router.push('signin');
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
      path='/forgotpassword'
      title='Doupi - Esqueceu senha'
      description='App para para gestão de agenda!'
    >
      <Flex
        minH={'100vh'}
        align={'center'}
        justify={'center'}
        bg={useColorModeValue('gray.50', 'gray.800')}
      >
        <Stack
          spacing={4}
          w={'full'}
          maxW={'md'}
          bg={useColorModeValue('white', 'gray.700')}
          rounded={'xl'}
          boxShadow={'lg'}
          p={6}
          my={12}
        >
          <Heading lineHeight={1.1} fontSize={{ base: '2xl', md: '3xl' }}>
            Esqueceu a senha?
          </Heading>
          <Text
            fontSize={{ base: 'sm', sm: 'md' }}
            color={useColorModeValue('gray.800', 'gray.400')}
          >
            Você receberá um email com o link de recuperação
          </Text>
          <Formik
            initialValues={{
              email: '',
            }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={onSubmit}
          >
            {({ handleSubmit, errors, touched }) => (
              <Form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                  <FormControl
                    id='email'
                    isInvalid={!!errors.email && touched.email}
                  >
                    <FormLabel fontSize={{ base: "sm", md: "md", lg: "md" }}>Email</FormLabel>
                    <Field as={Input} name='email' />
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>
                  <Button
                    bg={'#ffc03f'}
                    color={'white'}
                    width='100%'
                    loadingText='Submitting'
                    type='submit'
                    _hover={{ filter: 'brightness(110%)' }}
                  >
                    Redefinir senha
                  </Button>
                </VStack>
              </Form>
            )}
          </Formik>
        </Stack>
      </Flex>
    </Page>
  );
}
