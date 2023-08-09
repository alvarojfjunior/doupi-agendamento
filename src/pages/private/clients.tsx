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
import { AxiosInstance } from 'axios';
import { getApiInstance } from '@/services/api';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { AddIcon, ArrowRightIcon, EditIcon } from '@chakra-ui/icons';
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
  const [message, setMessage] = useState('');
  const {
    isOpen: formIsOpen,
    onOpen: formOnOpen,
    onClose: formOnClose,
  } = useDisclosure();
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
      name: '',
      phone: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().min(2).max(50).required(),
      phone: Yup.string().min(2).required(),
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
      const { data } = await api.get(
        `/api/clients?companyId=${user.companyId}`
      );

      setData(data);

      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);

      appContext.onCloseLoading();
    }
  };

  const handleDelete = async (item: any) => {
    try {
      appContext.onOpenLoading();
      const { data } = await api.delete(`/api/clients?_id=${item._id}`);

      setData((prevArray) => prevArray.filter((d: any) => d._id !== item._id));

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
          Cadastro de Clientes
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
                        setIsEditing(true);
                        const sugestionMessage = `Olá ${item.name}, tudo bem? Aqui é da ${user.companyName}, vamos agendar? \nAcesse o link abaixo e agende já! \n\nhttps://doupi.com.br/d/${user.companyName.replaceAll(' ', '-')}`
                        setMessage(sugestionMessage)
                        formOnOpen();
                      }}
                    />
                    <DeleteConfirmationModal
                      onDelete={() => handleDelete(item)}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
        <Box position='fixed' bottom={'80px'} right={4}>
          <IconButton
            colorScheme='blue'
            icon={<AddIcon />}
            isRound
            size='lg'
            aria-label='Adicionar'
            onClick={() => {
              formik.resetForm();
              setIsEditing(false);
              formOnOpen();
            }}
          />
        </Box>
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
                name='phone'
                as={InputMask}
                value={formik.values.phone}
                onChange={formik.handleChange}
                mask='(99) 9 9999-9999'
              />
            </FormControl>

            {isEditing && (
              <Box>
                <Divider marginBlock={10} />

                <Box w={'full'}>
                  <Text fontWeight={'semibold'}>
                    {' '}
                    Enviar mensagem para o cliente:{' '}
                  </Text>
                  <Flex alignItems={'center'}>
                    <Textarea
                      resize={'none'}
                      height={'80px'}
                      overflowY='hidden'
                      placeholder='Mensagem'
                      value={message}
                      onChange={(e: any) => setMessage(e.target.value)}
                    />
                    <Button
                      variant='outline'
                      colorScheme='blue'
                      h={'80px'}
                      onClick={() => {
                        const phone = String(formik.values.phone)
                          .replaceAll(' ', '')
                          .replaceAll('(', '')
                          .replaceAll(')', '')
                          .replaceAll('-', '');
                        window.open(
                          `https://api.whatsapp.com/send?phone=55${phone}&text=${message}`,
                          '_blank'
                        );
                      }}
                    >
                      <ArrowRightIcon />
                    </Button>
                  </Flex>
                </Box>
              </Box>
            )}
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
              Cancel
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
