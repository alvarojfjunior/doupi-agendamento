import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Stack,
  Button,
  Heading,
  useColorModeValue,
  FormErrorMessage,
  useToast,
} from '@chakra-ui/react';
import { useState, useContext, useEffect } from 'react';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import * as Yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { useRouter } from 'next/router';
import { getAxiosInstance } from '@/services/api';
import { AppContext } from '@/contexts/app';
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

export default function ResetPasswordForm(): JSX.Element {
  const toast = useToast();
  const appContext = useContext(AppContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const api = getAxiosInstance();
  const router = useRouter();
  const { id, token } = router.query;

  const ResetpasswordSchema = Yup.object().shape({
    newPassword: Yup.string()
      .min(8, 'Password must contain at least 8 characters!')
      .matches(/[0-9]/, 'Password must contain at least a number!')
      .matches(/[a-z]/, 'Password must contain at least a lowercase letter!')
      .matches(/[A-Z]/, 'Password must contain at least a uppercase letter!')
      .matches(/[^\w]/, 'Password must contain at least a special character!')
      .required('Required'),
    confirmPassword: Yup.string()
      .min(8, 'Password must contain at least 8 characters!')
      .matches(/[0-9]/, 'Password must contain at least a number!')
      .matches(/[a-z]/, 'Password must contain at least a lowercase letter!')
      .matches(/[A-Z]/, 'Password must contain at least a uppercase letter!')
      .matches(/[^\w]/, 'Password must contain at least a special character!')
      .required('Required'),
  });

  const onSubmit = async (values: {
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      appContext.onOpenLoading();

      if (!token || !id) {
        throw new Error(
          'Token inválido, por favor tente um novo link de recuperação!'
        );
      }

      await api.put('/api/auth/passwordreset', {
        userId: id,
        token,
        password: values.newPassword,
      });

      toast({
        title: 'Senha alterada com sucesso!',
        description: 'Agora você pode logar novamente',
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });

      router.push('/signin');
    } catch (error: any) {
      const errorMessage = error.response.message;
      toast({
        title: 'Error',
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
          Recuperação de senha
        </Heading>
        <Formik
          initialValues={{
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={ResetpasswordSchema}
          onSubmit={onSubmit}
        >
          {({ handleSubmit, errors, touched }) => (
            <Form onSubmit={handleSubmit}>
              <FormControl
                id='newPassword'
                isRequired
                isInvalid={!!errors.newPassword && touched.newPassword}
              >
                <FormLabel fontSize={{ base: "sm", md: "md", lg: "md" }}>Nova senha</FormLabel>
                <InputGroup>
                  <Field
                    placeholder='Nova senha'
                    _placeholder={{ color: 'gray.500' }}
                    as={Input}
                    type={showPassword ? 'text' : 'password'}
                    name='newPassword'
                  />
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      onClick={() =>
                        setShowPassword((showPassword) => !showPassword)
                      }
                    >
                      {showPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.newPassword}</FormErrorMessage>
              </FormControl>
              <FormControl
                id='confirmPassword'
                isInvalid={!!errors.confirmPassword && touched.confirmPassword}
              >
                <FormLabel fontSize={{ base: "sm", md: "md", lg: "md" }}>Confirme a nova senha</FormLabel>
                <InputGroup>
                  <Field
                    placeholder='Confirme a senha'
                    _placeholder={{ color: 'gray.500' }}
                    as={Input}
                    type={showConfirmPassword ? 'text' : 'password'}
                    isRequired
                    name='confirmPassword'
                  />
                  <InputRightElement h={'full'}>
                    <Button
                      variant={'ghost'}
                      onClick={() =>
                        setShowConfirmPassword(
                          (showConfirmPassword) => !showConfirmPassword
                        )
                      }
                    >
                      {showConfirmPassword ? <ViewIcon /> : <ViewOffIcon />}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
              <Stack spacing={6} pt={6}>
                <Button
                  type='submit'
                  loadingText='Submitting'
                  bg={'#ffc03f'}
                  color={'white'}
                  _hover={{ filter: 'brightness(110%)' }}
                >
                  Alterar
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      </Stack>
    </Flex>
  );
}
