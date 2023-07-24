import { useContext, useEffect } from 'react';
import { AppContext } from '@/contexts/app';
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
  Checkbox,
  DrawerFooter,
  Button,
  Tag,
  TagLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Heading,
  Textarea,
  ModalCloseButton,
  Divider,
} from '@chakra-ui/react';
import ConfirmButtonModal from '../../components/ConfirmButtonModal';
import makeAnimated from 'react-select/animated';
import Select from 'react-select';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { AddIcon, ArrowRightIcon } from '@chakra-ui/icons';
import { sumHours } from '@/utils/time';
import { withIronSessionSsr } from 'iron-session/next';
import { Professional, Schedule } from '@/services/database';
import mongoose from 'mongoose';
import moment from 'moment';
import 'moment/locale/pt-br';
import { getScheduleNotification, remaindMessage } from '@/utils/notificarions';
import ScheduleAvailability from '@/components/ScheduleAvailability';
import { getDayOfWeekInPortuguese } from '@/utils/date';
import { pulsate, shakeAnimation } from '@/utils/style';

export const getServerSideProps = withIronSessionSsr(
  async ({ req }) => {
    if (!('user' in req.session))
      return {
        redirect: {
          destination: '/signin',
          permanent: false,
        },
      };
    const user: any = req.session.user;

    let schedules = await Schedule.aggregate([
      {
        $addFields: {
          day: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
            },
          },
        },
      },
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(user.companyId),
          day: moment().format('YYYY-MM-DD'),
        },
      },
      {
        $lookup: {
          from: 'services', // Nome da coleção de serviços
          let: { serviceIds: '$serviceIds' }, // Array de IDs de serviço da entidade principal
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$serviceIds'] }, // Filtra os documentos onde o _id está presente no array de IDs
              },
            },
            // Outras etapas do pipeline, se necessário
          ],
          as: 'services', // Nome do array no qual os documentos vinculados serão armazenados
        },
      },
      {
        $lookup: {
          from: 'professionals',
          localField: 'professionalId',
          foreignField: '_id',
          as: 'professional',
        },
      },
      {
        $unwind: '$professional',
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientID',
          foreignField: '_id',
          as: 'client',
        },
      },
      {
        $unwind: '$client',
      },
      {
        $group: {
          _id: '$professionalId',
          schedules: { $push: '$$ROOT' },
        },
      },
    ]);

    schedules = schedules.map((s: any) => {
      const newArr: any = {};
      newArr.professional = s.schedules[0].professional;
      newArr.schedules = s.schedules;
      return newArr;
    });

    const professionals = await Professional.find({
      companyId: new mongoose.Types.ObjectId(user.companyId),
    })
      .populate({
        path: 'serviceIds',
        select: '-image',
      })
      .lean();

    return {
      props: {
        user,
        schedules: JSON.parse(JSON.stringify(schedules)),
        professionals: JSON.parse(JSON.stringify(professionals)),
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
export default function Panel({ schedules, professionals }: any) {
  const appContext = useContext(AppContext);
  const { colorMode } = useColorMode();
  const animatedComponents = makeAnimated();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [data, setData] = useState(schedules);
  const [selectedProfessional, setSelectedProfessional] = useState({});
  const [services, setServices] = useState([]);
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [selectedSchedule, setSelectedSchedule] = useState<any>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isNotify, setIsNotify] = useState(true);
  const [workPeriods, setWorkPeriods] = useState([]);
  const [invailableSchedules, setInvailableSchedules] = useState([]);
  const [remainderMessage, setRemainderMessage] = useState('');

  const {
    isOpen: formIsOpen,
    onOpen: formOnOpen,
    onClose: formOnClose,
  } = useDisclosure();

  useEffect(() => {
    user = JSON.parse(String(localStorage.getItem('user')));
    api = getAxiosInstance(user);
    appContext.onCloseLoading();
  }, []);

  useEffect(() => {
    if (selectedSchedule.client && selectedSchedule.status === 'agendado')
      setRemainderMessage(remaindMessage(selectedSchedule));
    else setRemainderMessage('');
  }, [selectedSchedule]);

  const onSubmit = async (values: any) => {
    try {
      let res: any;
      appContext.onOpenLoading();

      const serviceNames = values.services.map((s: any) => s.name);
      const professional = professionals.find(
        (p: any) => p._id === values.professional
      );
      values.companyId = user.companyId;
      values.professionalId = values.professional;
      values.serviceIds = values.services.map((s: any) => s.value);
      values.origem = 'admin';

      delete values.professional;
      delete values.services;

      if (isEditing) res = await api.put(`/api/schedules`, values);
      else res = await api.post(`/api/schedules`, values);

      setIsEditing(false);
      formOnClose();
      getSchedules();
      toast({
        title: 'Sucesso!',
        description: 'Os dados foram salvos!',
        status: 'success',
        position: 'top-right',
        duration: 5000,
        isClosable: true,
      });

      if (isNotify) {
        const notidy = getScheduleNotification(
          res.data._id,
          values.name,
          professional.name,
          user.companyName,
          serviceNames,
          moment(date, 'YYYY-MM-DD').format('DD/MM/YYYY'),
          values.time
        );
        const message = encodeURIComponent(notidy);
        const phone = String(values.phone)
          .replaceAll(' ', '')
          .replaceAll('(', '')
          .replaceAll(')', '')
          .replaceAll('-', '');
        window.open(
          `https://api.whatsapp.com/send?phone=55${phone}&text=${message}`,
          '_blank'
        );
      }
      appContext.onCloseLoading();
    } catch (error: any) {
      toast({
        title: 'Houve um erro',
        description: error.Message,
        status: 'error',
        position: 'top-right',
        duration: 5000,
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
      duration: '00:00',
      professional: '',
      services: [],
      date: moment().format('YYYY-MM-DD'),
      time: '',
    },
    validationSchema: schema,
    onSubmit: onSubmit,
  });

  useEffect(() => {
    const professional = professionals.find(
      (p: any) => p._id === formik.values.professional
    );

    if (!professional) return;

    setSelectedProfessional(professional);

    setWorkPeriods(
      professional.defaultSchedule.filter(
        (s: any) =>
          s.day ===
          getDayOfWeekInPortuguese(
            moment(formik.values.date, 'YYYY-MM-DD').toDate()
          )
      )
    );
  }, [formik.values.date]);

  const getSchedules = async (date?: string) => {
    try {
      appContext.onOpenLoading();
      const d = date || moment().format('YYYY-MM-DD');
      const { data } = await api.get(
        `/api/schedules/perProfessional?companyId=${user.companyId}&date=${d}`
      );
      setData(data);
      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  const getUnavailableSchedulePerDay = async (d?: string) => {
    try {
      appContext.onOpenLoading();
      const date = d ? d : formik.values.date;
      if (moment(d, 'YYYY-MM-DD').isBefore(moment().subtract('day', 1))) return;

      const { data } = await api.get(
        `/api/schedules?companyId=${user.companyId}&day=${date}&status=agendado`
      );

      setInvailableSchedules(data);

      appContext.onCloseLoading();
    } catch (error) {
      setInvailableSchedules([]);
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  const getServicesPerProfessional = async (professionalId: string) => {
    let professional = professionals.find((p: any) => p._id === professionalId);

    if (!professional) {
      formik.setFieldValue('professional', professionals[0]._id);
      professional = professionals[0];
    }

    setWorkPeriods(
      professional.defaultSchedule.filter(
        (s: any) =>
          s.day ===
          getDayOfWeekInPortuguese(moment(formik.values.date).toDate())
      )
    );

    setServices(
      //@ts-ignore
      professional.serviceIds.map((s) => {
        s.value = s._id;
        s.label = s.name;
        return s;
      })
    );

    formik.setFieldValue('services', []);
  };

  const handleCancelSchedule = async (schedule: any) => {
    try {
      appContext.onOpenLoading();

      const { data } = await api.put(`/api/schedules`, {
        _id: schedule._id,
        status: 'cancelado',
      });

      getSchedules();

      onClose();
      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  const handleMissSchedule = async (schedule: any) => {
    try {
      appContext.onOpenLoading();

      const { data } = await api.put(`/api/schedules`, {
        _id: schedule._id,
        status: 'faltou',
      });

      getSchedules();

      appContext.onCloseLoading();
      onClose();
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  return (
    <Page
      path='/private'
      title='Doupi - Painel Geral'
      description='App para genciamento de agendamentos'
    >
      <Box h={'full'} m={5}>
        <Box textAlign={'center'} mb={10}>
          <Heading mb={5} fontSize={'2xl'} textAlign={'center'}>
            Agenda do dia
          </Heading>
          <Input
            w={200}
            type='date'
            value={date}
            onChange={(e: any) => {
              setDate(e.target.value);
              getSchedules(e.target.value);
            }}
          />
        </Box>
        <Accordion defaultIndex={[0]} allowMultiple>
          {data.map((item: any, ii: number) => (
            <AccordionItem roundedTop={10} key={ii}>
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
                          bgColor={
                            schedule.status === 'cancelado'
                              ? 'red.100'
                              : schedule.status === 'faltou'
                              ? 'yellow.100'
                              : 'transparent'
                          }
                          key={schedule._id}
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            onOpen();
                          }}
                          cursor={'pointer'}
                          //@ts-ignore
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
            getServicesPerProfessional(professionals[0]._id);
            formik.setFieldValue('professional', professionals[0]._id);
            formik.setFieldValue('date', moment().format('YYYY-MM-DD'));
            getUnavailableSchedulePerDay();
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
                <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                  Nome do Cliente
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
            </HStack>

            <HStack alignItems={'top'}>
              <FormControl
                mb={3}
                id='professional'
                isRequired
                isInvalid={
                  !!formik.errors.professional && formik.touched.professional
                }
              >
                <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                  {' '}
                  Profissional{' '}
                </FormLabel>
                <ChakraSelect
                  name='professional'
                  value={formik.values.professional}
                  onChange={(e: any) => {
                    formik.setFieldValue('professional', e.target.value);
                    getServicesPerProfessional(e.target.value);
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
                <Flex>
                  <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                    {' '}
                    Serviços{' '}
                  </FormLabel>
                  <Text color={'blue.500'} fontSize={'sm'}>
                    {' '}
                    {formik.values.duration}{' '}
                  </Text>
                </Flex>
                <Select
                  name='services'
                  value={formik.values.services}
                  onChange={(e: any) => {
                    formik.setFieldValue('services', e);
                    formik.setFieldValue(
                      'duration',
                      sumHours(e.map((s: any) => s.duration))
                    );
                  }}
                  onBlur={() => {
                    if (
                      formik.values.services &&
                      formik.values.services.length > 0
                    )
                      formik.setFieldValue(
                        'duration',
                        sumHours(
                          formik.values.services.map((s: any) => s.duration)
                        )
                      );
                    getUnavailableSchedulePerDay();
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

            <HStack alignItems={'flex-end'}>
              <FormControl
                mb={3}
                id='date'
                isRequired
                //@ts-ignore
                isInvalid={!!formik.errors.date && formik.touched.date}
              >
                <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                  Data
                </FormLabel>
                <Input
                  type='date'
                  name='date'
                  value={formik.values.date}
                  onChange={(e) => {
                    formik.handleChange(e);
                    getUnavailableSchedulePerDay(
                      moment(e.target.value, 'YYYY-MM-DD').format('YYYY-MM-DD')
                    );
                  }}
                />
              </FormControl>

              <FormControl mb={5}>
                <Checkbox
                  m={'auto'}
                  size={'md'}
                  fontWeight={'medium'}
                  isChecked={isNotify}
                  onChange={(e: any) => setIsNotify(e.target.checked)}
                >
                  {' '}
                  Notificar por whatsapp{' '}
                </Checkbox>
              </FormControl>
            </HStack>
            <FormControl
              id='time'
              isRequired
              isInvalid={!!formik.errors.time && formik.touched.time}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Horários Disponíveis
              </FormLabel>
              <ScheduleAvailability
                handlChange={(time: string) => {
                  formik.setFieldValue('time', time);
                }}
                interval={30}
                date={moment(formik.values.date, 'YYYY-MM-DD').toDate()}
                scheduleDuration={formik.values.duration}
                unavailableTimes={invailableSchedules}
                workPeriods={workPeriods}
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

      {selectedSchedule.client && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalCloseButton animation={`${pulsate} 1.5s infinite`} />
            <ModalHeader textAlign={'center'} mt={5}>
              Agendamento com{' '}
              <span style={{ fontWeight: 'bold' }}>
                {selectedSchedule.client.name}
              </span>{' '}
              {moment(selectedSchedule.date, 'YYYY-MM-DD').format('DD/MM/YYYY')}{' '}
              às {selectedSchedule.time}{' '}
            </ModalHeader>
            <ModalBody></ModalBody>

            <ModalFooter flexDirection={'column'} gap={5}>
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
                    value={remainderMessage}
                    onChange={(e: any) => setRemainderMessage(e.target.value)}
                  />
                  <Button
                    variant='outline'
                    colorScheme='blue'
                    h={'80px'}
                    onClick={() => {
                      const phone = String(selectedSchedule.client.phone)
                        .replaceAll(' ', '')
                        .replaceAll('(', '')
                        .replaceAll(')', '')
                        .replaceAll('-', '');
                      window.open(
                        `https://api.whatsapp.com/send?phone=55${phone}&text=${remainderMessage}`,
                        '_blank'
                      );
                      onClose();
                    }}
                  >
                    <ArrowRightIcon />
                  </Button>
                </Flex>
              </Box>

              <Divider />

              {selectedSchedule.status === 'agendado' ? (
                <>
                  <ConfirmButtonModal
                    colorScheme={'yellow'}
                    value={'Marcar como faltante'}
                    onDelete={() => handleMissSchedule(selectedSchedule)}
                  />
                  <ConfirmButtonModal
                    colorScheme={'red'}
                    value={'Cancelar Agendamento'}
                    onDelete={() => handleCancelSchedule(selectedSchedule)}
                  />
                </>
              ) : (
                <></>
              )}
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Page>
  );
}
