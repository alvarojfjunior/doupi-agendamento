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
  IconButton,
  Stack,
  Heading,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  FormLabel,
  FormControl,
  Input,
  DrawerFooter,
  Button,
  useToast,
  Checkbox,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/contexts/app';
import InputMask from 'react-input-mask';
import Page from '@/components/Page';
import { AxiosInstance } from 'axios';
import { getApiInstance } from '@/services/api';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { withIronSessionSsr } from 'iron-session/next';

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
  const [data, setData] = useState([]);
  const {
    isOpen: formIsOpen,
    onOpen: formOnOpen,
    onClose: formOnClose,
  } = useDisclosure();
  const toast = useToast();

  const onSubmit = async (values: any) => {
    try {
      appContext.onOpenLoading();

      values.companyId = user.companyId;

      const res = await api.put(`/api/companies`, values);

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
    } finally {
      getData()
      formOnClose();
    }
  };

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      active: false,
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().min(2).max(50).required(),
      phone: Yup.string().min(2).required(),
      active: Yup.boolean().required(),
    }),
    onSubmit: onSubmit,
  });

  useEffect(() => {
    api = getApiInstance(user);
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
      const { data } = await api.get(`/api/companies`);

      setData(data);

      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);

      appContext.onCloseLoading();
    }
  };

  return (
    <Page
      user={user}
      path='/client'
      title='Doupi - Cadastro de profissionais'
      description='App para genciamento de agendamentos'
    >
      <Stack h={'full'} m={5}>
        <Heading mb={5} fontSize={'2xl'} textAlign={'center'}>
          Empresas da Doupi
        </Heading>
        <TableContainer shadow={'#cccccc4e 0px 0px 2px 1px'} rounded={20}>
          <Table variant='striped'>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Phone</Th>
                <Th width={50}>Opções</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item: any) => (
                <Tr key={item._id}>
                  <Td>{item.name}</Td>

                  <Td>{item.phone}</Td>

                  <Td>
                    <IconButton
                      size={'sm'}
                      icon={<EditIcon />}
                      colorScheme='blue'
                      aria-label='Editar'
                      mr={1}
                      onClick={() => {
                        formik.setValues(item);
                        formOnOpen();
                      }}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Stack>

      <Drawer
        isOpen={formIsOpen}
        placement='right'
        size={'xl'}
        onClose={() => 1}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'>Serviço</DrawerHeader>

          <DrawerBody>
            <FormControl
              mb={3}
              id='name'
              isRequired
              isInvalid={!!formik.errors.name && formik.touched.name}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Nome
              </FormLabel>
              <Input
                type='text'
                name='name'
                disabled={true}
                value={formik.values.name}
                onChange={formik.handleChange}
              />
            </FormControl>

            <FormControl
              id='phone'
              isRequired
              isInvalid={!!formik.errors.phone && formik.touched.phone}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Telefone{' '}
              </FormLabel>
              <Input
                disabled={true}
                name='phone'
                as={InputMask}
                value={formik.values.phone}
                onChange={formik.handleChange}
                mask='(99) 9 9999-9999'
              />
            </FormControl>

            <FormControl
              id='active'
              isInvalid={!!formik.errors.active && formik.touched.active}
              display={'flex'}
              justifyContent={'start'}
              alignItems={'center'}
              marginTop={5}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Ativo:{' '}
              </FormLabel>
              <Checkbox
                mb={2}
                size={'md'}
                fontWeight={'medium'}
                isChecked={formik.values.active}
                onChange={(e: any) =>
                  formik.setFieldValue('active', e.target.checked)
                }
              />
            </FormControl>
          </DrawerBody>

          <DrawerFooter borderTopWidth='1px'>
            <Button
              variant='outline'
              mr={3}
              onClick={() => {
                setIsEditing(false);
                formOnClose();
              }}
            >
              Cancelar
            </Button>
            <Button
              colorScheme='blue'
              //@ts-ignore
              onClick={formik.handleSubmit}
            >
              Salvar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Page>
  );
}
