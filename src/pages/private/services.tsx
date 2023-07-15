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
  HStack,
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
import { serviceImage } from '@/utils/images';

let user: IUser;
let api: AxiosInstance;
export default function Services() {
  const { colorMode } = useColorMode();
  const appContext = useContext(AppContext);
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState([]);
  const {
    isOpen: formIsOpen,
    onOpen: formOnOpen,
    onClose: formOnClose,
  } = useDisclosure();
  const toast = useToast();
  const router = useRouter();
  const animatedComponents = makeAnimated();

  const onSubmit = async (values: any) => {
    try {
      appContext.onOpenLoading();

      if (!values.image) values.image = serviceImage;
      values.companyId = user.companyId;

      let res: any;

      if (isEditing) res = await api.put(`/api/services`, values);
      else res = await api.post(`/api/services`, values);

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
      image: serviceImage,
      name: '',
      description: '',
      duration: '',
      price: '',
    },
    validationSchema: Yup.object().shape({
      name: Yup.string().min(2).max(50).required(),
      description: Yup.string().min(2).max(50).required(),
      duration: Yup.string().min(5).required(),
      price: Yup.string().min(5).required(),
    }),
    onSubmit: onSubmit,
  });

  useEffect(() => {
    user = JSON.parse(String(localStorage.getItem('user')));
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
      const { data } = await api.get(
        `/api/services?companyId=${user.companyId}`
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
      const { data } = await api.delete(`/api/services?_id=${item._id}`);

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
        formik.setFieldValue('image', dataURL);
      };
    };

    if (!e.target.files) {
      return;
    }

    if (file.type === 'image/png' || file.type === 'image/jpeg') {
      reader.readAsDataURL(file);
      formik.setFieldValue('image', URL.createObjectURL(e.target.files[0]));
    }
  }

  return (
    <Page
      path='/service'
      title='Doupi - Cadastro de profissionais'
      description='App para genciamento de agendamentos'
    >
      <Stack h={'full'} m={5}>
        <Heading mb={5} fontSize={'2xl'} textAlign={'center'}>
          Cadastro de Serviços
        </Heading>
        <TableContainer shadow={'#cccccc4e 0px 0px 2px 1px'} rounded={20}>
          <Table variant='striped'>
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Preço</Th>
                <Th width={50}>Opções</Th>
              </Tr>
            </Thead>
            <Tbody>
              {data.map((item: any) => (
                <Tr key={item._id}>
                  <Td display={'flex'} alignItems={'center'}>
                    <ChakraImage
                      src={item.image}
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

                  <Td>{item.price}</Td>

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
          <DrawerHeader borderBottomWidth='1px'>Serviço</DrawerHeader>

          <DrawerBody>
            <FormControl
              mb={3}
              id='image'
              textAlign={'center'}
              isRequired
              isInvalid={!!formik.errors.image && formik.touched.image}
            >
              <FormLabel>Imagem</FormLabel>
              <Box
                position='relative'
                display='inline-block'
                border={'1px solid #ccc'}
                rounded={20}
                width={100}
                height={100}
                overflow='hidden'
                justifyContent='center'
                alignItems='center'
              >
                <ChakraImage
                  src={formik.values.image}
                  alt='Imagem'
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
                  name='image'
                  onChange={handleImageChange}
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
              <FormLabel>Nome</FormLabel>
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
              <FormLabel>Descrição</FormLabel>
              <Input
                type='text'
                name='description'
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </FormControl>

            <HStack spacing={4}>
              <FormControl
                mb={3}
                id='price'
                isRequired
                isInvalid={!!formik.errors.price && formik.touched.price}
              >
                <FormLabel>Preço </FormLabel>
                <Input
                  name='price'
                  as={InputMask}
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  mask='99,99'
                />
              </FormControl>

              <FormControl
                mb={3}
                id='duration'
                isRequired
                isInvalid={!!formik.errors.duration && formik.touched.duration}
              >
                <FormLabel> Duração do Serviço </FormLabel>

                <Input
                  name='duration'
                  as={InputMask}
                  value={formik.values.duration}
                  onChange={formik.handleChange}
                  defaultValue={'01:00'}
                  mask='99:99'
                />
              </FormControl>
            </HStack>
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
