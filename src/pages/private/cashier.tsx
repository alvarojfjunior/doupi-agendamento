import {
  Box,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  useToast,
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
  Select,
  HStack,
  TableCaption,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useContext, useEffect, useState } from 'react';
import { AppContext } from '@/contexts/app';
import Page from '@/components/Page';
import { AxiosInstance } from 'axios';
import { getAxiosInstance } from '@/services/api';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import { withIronSessionSsr } from 'iron-session/next';
import { NumericFormat } from 'react-number-format';
import { floatToString, stringToFloat } from '@/utils/helpers';
import moment from 'moment';

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
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [amount, setAmount] = useState(0);
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

      values.value = stringToFloat(values.value);

      values.fatherName = 'usuario';

      values.fatherId = user._id;

      values.date = moment(values.date, 'YYYY-MM-DD').toDate();

      if (isEditing) res = await api.put(`/api/cashiers`, values);
      else res = await api.post(`/api/cashiers`, values);

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
      formOnClose();

      await getData()
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

  const schema = Yup.object().shape({
    reason: Yup.string().min(2).max(100).required(),
    value: Yup.string().min(3).required(),
    cashierType: Yup.string().min(4).required(),
    date: Yup.string().min(10).required(),
  });

  const formik = useFormik({
    initialValues: {
      reason: '',
      value: '',
      date: moment().format('YYYY-MM-DD'),
      cashierType: 'Geral',
    },
    validationSchema: schema,
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

  const getData = async (d?: string) => {
    try {
      appContext.onOpenLoading();
      const { data } = await api.get(
        `/api/cashiers?companyId=${user.companyId}&date=${
          d ? d : moment().format('YYYY-MM-DD')
        }`
      );

      setAmount(
        data.reduce((count: Number, d: any) => {
          return count + d.value;
        }, 0)
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

      const { data } = await api.delete(`/api/cashiers?_id=${item._id}`);

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
      path='/cashier'
      title='Doupi - Cadastro de profissionais'
      description='App para genciamento de agendamentos'
    >
      <Stack h={'full'} m={5}>
        <Heading mb={5} fontSize={'2xl'} textAlign={'center'}>
          Cadastro de Caixa
        </Heading>
        <Box maxW={300} margin={'auto'} mt={2} mb={5}>
          <Input
            type='date'
            value={date}
            onChange={(e: any) => {
              setDate(e.target.value);
              getData(e.target.value);
            }}
          />
        </Box>
        <TableContainer shadow={'#cccccc4e 0px 0px 2px 1px'} rounded={20}>
          <Table variant='striped'>
            <TableCaption>TOTAL: R${floatToString(amount)}</TableCaption>
            <Thead>
              <Tr>
                <Th>Data</Th>
                <Th>Referente</Th>
                <Th>Valor</Th>
                <Th width={50}>Opções</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item: any) => (
                <Tr key={item._id}>
                  <Td>
                    {moment(item.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}
                  </Td>
                  <Td>{item.reason}</Td>
                  <Td>R${floatToString(item.value)}</Td>
                  <Td>
                    <IconButton
                      size={'sm'}
                      icon={<EditIcon />}
                      colorScheme='blue'
                      aria-label='Editar'
                      mr={1}
                      onClick={() => {
                        formik.setValues(item);
                        formik.setFieldValue(
                          'date',
                          moment(item.date, 'YYYY-MM-DD').format('YYYY-MM-DD')
                        );
                        formik.setFieldValue(
                          'value',
                          floatToString(item.value)
                        );
                        setIsEditing(true);
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
        <Box position='fixed' bottom={{ base: '120px', md: '80px' }} right={4}>
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
          <DrawerHeader borderBottomWidth='1px'>
            Lançamento de Caixa
          </DrawerHeader>

          <DrawerBody>
            <FormControl
              mb={3}
              id='reason'
              isRequired
              isInvalid={!!formik.errors.reason && formik.touched.reason}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Descrição (referente a)
              </FormLabel>
              <Input
                type='text'
                name='reason'
                value={formik.values.reason}
                onChange={formik.handleChange}
              />
            </FormControl>

            <HStack>
              <FormControl
                id='cashierType'
                isRequired
                isInvalid={
                  !!formik.errors.cashierType && formik.touched.cashierType
                }
              >
                <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                  Tipo de conta{' '}
                </FormLabel>
                <Select
                  name='cashierType'
                  value={formik.values.cashierType}
                  onChange={formik.handleChange}
                >
                  <option value='Geral'> Geral </option>
                  <option value='Dinheiro'> Dinheiro </option>
                  <option value='Transferência bancária'>
                    {' '}
                    Transferência bancária{' '}
                  </option>
                </Select>
              </FormControl>

              <FormControl
                mb={3}
                id='date'
                isRequired
                isInvalid={!!formik.errors.date && formik.touched.date}
              >
                <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                  Data
                </FormLabel>
                <Input
                  type='date'
                  name='date'
                  value={formik.values.date}
                  onChange={formik.handleChange}
                />
              </FormControl>
            </HStack>

            <FormControl
              id='value'
              isRequired
              isInvalid={!!formik.errors.value && formik.touched.value}
              maxW={200}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Valor (R$){' '}
              </FormLabel>

              <Input
                as={NumericFormat}
                name='value'
                value={formik.values.value}
                onChange={formik.handleChange}
                thousandSeparator='.'
                decimalSeparator=','
                decimalScale={2}
                fixedDecimalScale={true}
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
