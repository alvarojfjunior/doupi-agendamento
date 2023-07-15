import { useContext, useEffect } from 'react';
import { AppContext } from '@/contexts/app';
import { useRouter } from 'next/router';
import InputMask from 'react-input-mask';
import Page from '@/components/Page';
import { IUser } from '@/types/api/User';
import { AxiosInstance } from 'axios';
import { getAxiosInstance } from '@/services/api';
import { useState } from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  useColorMode,
  Box,
  Grid,
  GridItem,
  Text,
  useToast,
  Image as ChakraImage,
  Select as ChakraSelect,
  useDisclosure,
  Drawer,
  Flex,
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
  Tag,
  TagLabel,
  TagCloseButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from '@chakra-ui/react';
import makeAnimated from 'react-select/animated';
import Select from 'react-select';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AddIcon } from '@chakra-ui/icons';
import { sumHours } from '@/utils/time';
import AvailableTimesList from '@/components/AvailableTimesList';

let user: IUser;
let api: AxiosInstance;
export default function Panel() {
  const appContext = useContext(AppContext);
  const { colorMode } = useColorMode();
  const animatedComponents = makeAnimated();
  const toast = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [selected, setSelected] = useState({});
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: formIsOpen,
    onOpen: formOnOpen,
    onClose: formOnClose,
  } = useDisclosure();

  useEffect(() => {
    user = JSON.parse(String(localStorage.getItem('user')));
    api = getAxiosInstance(user);
    getData();
  }, []);

  const onSubmit = async (values: any) => {
    try {
      appContext.onOpenLoading();
      let res: any;

      values.companyId = user.companyId;
      values.professionalId = values.professional;
      values.serviceIds = values.services.map((s: any) => s.value);

      delete values.professional;
      delete values.services;

      if (isEditing) res = await api.put(`/api/schedules`, values);
      else res = await api.post(`/api/schedules`, values);

      setIsEditing(false);
      formOnClose();
      await getSchedules();
      toast({
        title: 'Sucesso!',
        description: 'Os dados foram salvos!',
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
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
    name: Yup.string().min(2).max(50).required(),
    phone: Yup.string().min(2).required(),
    professional: Yup.string().required(),
    services: Yup.array().min(1).required(),
    date: Yup.string().required(),
    time: Yup.string().min(5).required(),
    duration: Yup.string().min(5).required(),
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      duration: '',
      professional: '',
      services: [],
      date: new Date(),
      time: '',
    },
    validationSchema: schema,
    onSubmit: onSubmit,
  });

  const getSchedules = async () => {
    try {
      const { data } = await api.get(
        `/api/schedules?companyId=${user.companyId}`
      );
      console.log(data);
      setData(data);
      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  const getData = async () => {
    try {
      appContext.onOpenLoading();
      await getSchedules();

      const { data: professionals } = await api.get(
        `/api/professionals?companyId=${user.companyId}`
      );

      setProfessionals(professionals);

      formik.setFieldValue('professioanl', professionals[0]._id);
      getServicesPerProfessional(professionals[0]._id);

      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  const getServicesPerProfessional = async (professionalId: string) => {
    const professional = professionals.find(
      (p: any) => p._id === professionalId
    );
    if (professional) {
      setServices(
        //@ts-ignore
        professional.serviceIds.map((s) => {
          s.value = s._id;
          s.label = s.name;
          return s;
        })
      );
      formik.setFieldValue('services', []);
    }
  };

  return (
    <Page
      path='/private'
      title='Doupi - Painel Geral'
      description='App para genciamento de agendamentos'
    >
      <Box h={'full'} m={5}>
        <Accordion>
          {data.map((item: any) => (
            <AccordionItem roundedTop={10} key={item._id}>
              <AccordionButton
                _expanded={{ bg: '#3E4D92', color: 'white' }}
                roundedTop={10}
              >
                <Box as='span' flex='1' textAlign='left' fontWeight='bold'>
                  <Flex alignItems={'center'} gap={3}>
                    <ChakraImage
                      src={item.professional.photo}
                      alt='Foto'
                      rounded={'full'}
                      style={{
                        objectFit: 'cover',
                        width: '50px',
                        height: '50px',
                      }}
                    />
                    {item && item.professional && item.professional.name}
                  </Flex>
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel
                pb={4}
                backgroundColor='#3e4e9209'
                roundedBottom={10}
              >
                <Box>
                  <Grid
                    templateColumns={[
                      'repeat(2, 1fr)',
                      'repeat(4, 1fr)',
                      'repeat(6, 1fr)',
                      'repeat(10, 1fr)',
                    ]}
                    gap={[2, 2, 2, 2]}
                    mt={1}
                  >
                    {item &&
                      item.schedules &&
                      item.schedules.map((schedule: any) => (
                        <GridItem
                          onClick={() => {
                            setSelected(schedule);
                            onOpen();
                          }}
                          cursor={'pointer'}
                          key={schedule._id}
                          border={`1px solid ${
                            colorMode === 'dark' ? '#cccccc3f' : '#cccccc'
                          }`}
                          _hover={{
                            bgColor: '#3E4D92',
                            color: 'white',
                          }}
                          p={2}
                          textAlign={'center'}
                          borderRadius='md'
                        >
                          <Text fontWeight='bold'>{schedule.time}</Text>
                          <Text noOfLines={1} mb={1}>
                            {schedule &&
                              schedule.client &&
                              schedule.client.name}
                          </Text>
                          <HStack justifyContent='center'>
                            {schedule.services.map((s: any, i: number) => (
                              <Tag
                                size={'sm'}
                                key={i}
                                variant='subtle'
                                colorScheme='blue'
                              >
                                <TagLabel>{s.name}</TagLabel>
                              </Tag>
                            ))}
                          </HStack>
                        </GridItem>
                      ))}
                  </Grid>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>

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
            setServices([]);
            formOnOpen();
          }}
        />
      </Box>

      <Drawer
        isOpen={formIsOpen}
        placement='right'
        size={'xl'}
        onClose={() => 1}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth='1px'>Agendamento</DrawerHeader>

          <DrawerBody>
            <HStack alignItems={'top'}>
              <FormControl
                mb={3}
                id='name'
                isRequired
                isInvalid={!!formik.errors.name && formik.touched.name}
              >
                <FormLabel>Nome do Cliente</FormLabel>
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
                <FormLabel>Telefone </FormLabel>
                <Input
                  name='phone'
                  as={InputMask}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  mask='(99) 9 9999-9999'
                />
              </FormControl>
            </HStack>

            <HStack alignItems={'top'}>
              <FormControl
                mb={3}
                id='professional'
                isRequired
                //@ts-ignore
                isInvalid={
                  !!formik.errors.professional && formik.touched.professional
                }
              >
                <FormLabel> Profissional </FormLabel>
                <ChakraSelect
                  name='professional'
                  value={formik.values.professional}
                  onChange={(e: any) => {
                    getServicesPerProfessional(e.target.value);
                    formik.setFieldValue('professional', e.target.value);
                  }}
                  //@ts-ignore
                  closeMenuOnSelect={false}
                >
                  {professionals.map((p: any) => (
                    <option key={p._id} value={p._id}>
                      {p.name}
                    </option>
                  ))}
                </ChakraSelect>
              </FormControl>

              <FormControl
                mb={3}
                id='services'
                isRequired
                //@ts-ignore
                isInvalid={!!formik.errors.services && formik.touched.services}
              >
                <HStack alignContent={'center'}>
                  <FormLabel> Serviços </FormLabel>
                  <Text color={'blue.500'}>
                    {' '}
                    {formik.values.duration &&
                      'Duração: ' + formik.values.duration}{' '}
                  </Text>
                </HStack>
                <Select
                  name='services'
                  value={formik.values.services}
                  onChange={(e: any) => {
                    formik.setFieldValue('services', e);
                  }}
                  onBlur={() => {
                    if (formik.values.services.length > 0)
                      formik.setFieldValue(
                        'duration',
                        sumHours(
                          formik.values.services.map((s: any) => s.duration)
                        )
                      );
                  }}
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
            </HStack>

            <HStack alignItems={'top'}>
              <FormControl
                mb={3}
                id='date'
                isRequired
                //@ts-ignore
                isInvalid={!!formik.errors.date && formik.touched.date}
              >
                <FormLabel>Data</FormLabel>
                <Input
                  type='date'
                  name='date'
                  //@ts-ignore
                  value={formik.values.date}
                  onChange={formik.handleChange}
                />
              </FormControl>

              <FormControl
                id='time'
                isRequired
                isInvalid={!!formik.errors.time && formik.touched.time}
              >
                <FormLabel>Horário</FormLabel>
                <AvailableTimesList
                  handleSelectTime={(time: string) =>
                    formik.setFieldValue('time', time)
                  }
                  value={formik.values.time}
                  date={formik.values.date}
                  durationToTest={formik.values.duration}
                  invalidAppointments={[
                    {
                      start: '08:00',
                      end: '09:00',
                    },
                  ]}
                  workPeriods={[
                    {
                      start: '08:00',
                      end: '12:00',
                    },
                    {
                      start: '14:00',
                      end: '18:00',
                    },
                  ]}
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

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Opções do Agendamento</ModalHeader>
          <ModalBody>
            <Text> </Text>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Page>
  );
}
