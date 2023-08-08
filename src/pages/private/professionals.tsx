import {
  Box,
  TableContainer,
  Table,
  Image as ChakraImage,
  Thead,
  Tr,
  Th,
  Text,
  Tbody,
  Td,
  useColorMode,
  useToast,
  IconButton,
  Stack,
  Heading,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  FormLabel,
  FormControl,
  Input,
  DrawerFooter,
  Button,
} from '@chakra-ui/react';
import Select from 'react-select';
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
import { getAxiosInstance } from '@/services/api';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import { AddIcon, EditIcon } from '@chakra-ui/icons';
import SchedulesInput from '@/components/SchedulesInput';
import { withIronSessionSsr } from 'iron-session/next';
import { handleImageImageAndUpload } from '@/utils/upload';

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

let user: IUser;
let api: AxiosInstance;
export default function Professionals({ user }: any) {
  const { colorMode } = useColorMode();
  const appContext = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState([]);
  const [services, setServices] = useState([]);
  const {
    isOpen: formIsOpen,
    onOpen: formOnOpen,
    onClose: formOnClose,
  } = useDisclosure();
  const toast = useToast();
  const animatedComponents = makeAnimated();

  const onSubmit = async (values: any) => {
    try {
      appContext.onOpenLoading();

      values.companyId = user.companyId;
      values.serviceIds = values.services.map((s: any) => s.value);
      delete values.services;

      let res: any;

      if (isEditing) res = await api.put(`/api/professionals`, values);
      else res = await api.post(`/api/professionals`, values);

      getData();
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
      photo:
        'http://res.cloudinary.com/dovvizyxg/image/upload/v1689457969/barber-shop-mens-haircut-vintage-barbershop-shaving-barber-scissors-barber-straight-razor-scissors-over-blue-background-215247336_rtkpq7.webp',
      name: '',
      description: '',
      phone: '',
      whatsapp: '',
      services: [],
      defaultSchedule: [
        {
          day: 'segunda',
          end: '12:00',
          start: '08:00',
        },
        {
          day: 'segunda',
          end: '18:00',
          start: '14:00',
        },

        {
          day: 'terca',
          end: '12:00',
          start: '08:00',
        },
        {
          day: 'terca',
          end: '18:00',
          start: '14:00',
        },

        {
          day: 'quarta',
          end: '12:00',
          start: '08:00',
        },
        {
          day: 'quarta',
          end: '18:00',
          start: '14:00',
        },

        {
          day: 'quinta',
          end: '12:00',
          start: '08:00',
        },
        {
          day: 'quinta',
          end: '18:00',
          start: '14:00',
        },

        {
          day: 'sexta',
          end: '12:00',
          start: '08:00',
        },
        {
          day: 'sexta',
          end: '18:00',
          start: '14:00',
        },

        {
          day: 'sabado',
          end: '12:00',
          start: '08:00',
        },
      ],
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().min(2).max(50).required(),
      description: Yup.string().min(2).max(200).required(),
      phone: Yup.string().min(16).required(),
      whatsapp: Yup.string().min(16).required(),
      services: Yup.array().min(1),
    }),
    onSubmit: onSubmit,
  });

  useEffect(() => {
    api = getAxiosInstance(user);
    getData();
  }, []);

  const getData = async () => {
    try {
      appContext.onOpenLoading();
      const { data } = await api.get(
        `/api/professionals?companyId=${user.companyId}`
      );

      const { data: services } = await api.get(
        `/api/services?companyId=${user.companyId}`
      );

      setData(
        data.map((d: any) => {
          d.services = d.serviceIds.map((sid: any) => {
            return {
              value: sid._id,
              label: sid.name,
            };
          });

          return d;
        })
      );

      setServices(
        services.map((s: any) => {
          return {
            value: s._id,
            label: s.name,
          };
        })
      );

      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);

      appContext.onCloseLoading();
    }
  };

  const handleDelete = async (item: any) => {
    try {
      appContext.onOpenLoading();
      const { data } = await api.delete(`/api/professionals?_id=${item._id}`);

      setData((prevArray) => prevArray.filter((d: any) => d._id !== item._id));

      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  function handleImageChange(e: any) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadend = () => {
      const image = new Image();
      //@ts-ignore
      image.src = reader.result;

      image.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        // Define a largura e altura máximas para a imagem
        const maxWidth = 800;
        const maxHeight = 800;

        let width = image.width;
        let height = image.height;

        // Redimensiona a imagem se a largura ou altura excederem os limites máximos
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        // Desenha a imagem redimensionada no canvas
        canvas.width = width;
        canvas.height = height;
        //@ts-ignore
        context.drawImage(image, 0, 0, width, height);

        // Converte o conteúdo do canvas em uma URL de dados com a melhor qualidade
        const dataURL = canvas.toDataURL(file.type, 1);

        // Define a melhor resolução e qualidade da imagem no state (setImageAvatar)
        formik.setFieldValue('photo', dataURL);
      };
    };

    if (!e.target.files) {
      return;
    }

    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      reader.readAsDataURL(file);
      formik.setFieldValue('photo', URL.createObjectURL(e.target.files[0]));
    }
  }

  return (
    <Page
      user={user}
      path='/professional'
      title='Doupi - Cadastro de profissionais'
      description='App para genciamento de agendamentos'
    >
      <Stack h={'full'} m={5}>
        <Heading mb={5} fontSize={'2xl'} textAlign={'center'}>
          Cadastro de Profissionais
        </Heading>
        <TableContainer shadow={'#cccccc4e 0px 0px 2px 1px'} rounded={20}>
          <Table variant='striped'>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Telefone</Th>
                <Th width={50}>Opções</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item: any) => (
                <Tr key={item._id}>
                  <Td display={'flex'} alignItems={'center'}>
                    <ChakraImage
                      src={item.photo}
                      alt='Imagem de Capa'
                      m={2}
                      rounded={10}
                      style={{
                        objectFit: 'cover',
                        width: 50,
                        height: 50,
                      }}
                    />
                    {item.name}
                  </Td>

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
          <DrawerHeader borderBottomWidth='1px'>Profissional</DrawerHeader>

          <DrawerBody>
            <FormControl
              mb={3}
              id='coverImage'
              textAlign={'center'}
              isRequired
              isInvalid={!!formik.errors.photo && formik.touched.photo}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Foto
              </FormLabel>
              <Box
                position='relative'
                display='inline-block'
                border={'1px solid #ccc'}
                rounded={'full'}
                width={100}
                height={100}
                overflow='hidden'
                justifyContent='center'
                alignItems='center'
              >
                <ChakraImage
                  src={formik.values.photo}
                  alt='Foto'
                  mb={2}
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
                    handleImageImageAndUpload(event, 0.5, (url: string) =>
                      formik.setFieldValue('photo', url)
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
              mb={3}
              id='description'
              isRequired
              isInvalid={
                !!formik.errors.description && formik.touched.description
              }
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Descrição
              </FormLabel>
              <Input
                type='text'
                name='description'
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </FormControl>

            <FormControl
              mb={3}
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

            <FormControl
              mb={3}
              id='whatsapp'
              isRequired
              isInvalid={!!formik.errors.whatsapp && formik.touched.whatsapp}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                {' '}
                Whatsapp{' '}
              </FormLabel>

              <Input
                name='whatsapp'
                as={InputMask}
                value={formik.values.whatsapp}
                onChange={formik.handleChange}
                mask='(99) 9 9999-9999'
              />
            </FormControl>

            <FormControl
              mb={3}
              id='services'
              isRequired
              //@ts-ignore
              isInvalid={!!formik.errors.services && formik.touched.services}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                {' '}
                Serviços{' '}
              </FormLabel>
              <Select
                name='services'
                value={formik.values.services}
                onChange={(e: any) => formik.setFieldValue('services', e)}
                closeMenuOnSelect={false}
                components={animatedComponents}
                isMulti
                options={services}
                styles={{
                  control: (baseStyles, state) => ({
                    ...baseStyles,
                    backgroundColor: 'transparent',
                  }),
                  menuList: (baseStyles, state) =>
                    colorMode === 'dark'
                      ? {
                          ...baseStyles,
                          backgroundColor: '#2D3748',
                        }
                      : {
                          ...baseStyles,
                          backgroundColor: 'white',
                        },
                  multiValue: (baseStyles, state) =>
                    colorMode === 'dark'
                      ? {
                          ...baseStyles,
                          backgroundColor: '#a09dff',
                          color: 'red',
                        }
                      : {
                          ...baseStyles,
                          backgroundColor: 'ButtonShadow',
                        },
                }}
              />
            </FormControl>

            <FormControl
              mb={3}
              id='defaultSchedule'
              isRequired
              //@ts-ignore
              isInvalid={
                !!formik.errors.defaultSchedule &&
                formik.touched.defaultSchedule
              }
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                {' '}
                Períodos de Trabalho Padrão{' '}
              </FormLabel>
              <SchedulesInput
                schedules={formik.values.defaultSchedule}
                onChange={(value: any) =>
                  formik.setFieldValue('defaultSchedule', value)
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
