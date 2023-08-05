import {
  Button,
  Heading,
  Text,
  Stack,
  useToast,
  CardBody,
  Image,
  Card,
  ListItem,
  Input,
  Box,
  Divider,
  List,
  ListIcon,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  Flex,
  AccordionPanel,
} from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md';
import { useContext, useEffect, useState } from 'react';
import { modifyTheme, pulsate } from '@/utils/style';
import moment from 'moment';
import axios from 'axios';
import ScheduleAvailability from '../ScheduleAvailability';
import { sumHours } from '@/utils/time';
import { AppContext } from '@/contexts/app';

const api = axios.create({
  baseURL: '',
});

export default function SelectShedule({
  company,
  selectedServices,
  handleCLick,
}: any) {
  const toast = useToast();
  const appContext = useContext(AppContext);
  const [isValid, setIsValid] = useState(false);
  const [date, setDate] = useState(moment().format('YYYY-MM-DD'));
  const [amount, setAmount] = useState('');
  const [schedulePerPrefessional, setSchedulePerPrefessional] = useState([]);
  const [duration, setDuration] = useState('00:00');
  const [selectedProfessional, setSelectedProfessional] = useState({});
  const [time, setTime] = useState('');

  useEffect(() => {
    let total = 0;
    selectedServices.forEach((s: any) => {
      total += parseFloat(s.price);
    });
    setAmount(total.toFixed(2).replaceAll('.', ','));
    setDuration(sumHours(selectedServices.map((s: any) => s.duration)));
  }, []);

  useEffect(() => {
    getSchedulePerDate();
  }, [date]);

  const getSchedulePerDate = async () => {
    try {
      appContext.onOpenLoading();
      const serviceIds = selectedServices.map((s: any) => s._id);
      const { data } = await api.get(
        `/api/publics/schedules/perProfessional?companyId=${company._id}&date=${date}&serviceIds=${serviceIds}`
      );

      setSchedulePerPrefessional(data);
      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);
      setSchedulePerPrefessional([]);
      appContext.onCloseLoading();
    }
  };

  return (
    <Stack>
      <Card
        maxW={'600px'}
        m={'auto'}
        direction={{ base: 'row', sm: 'row' }}
        overflow='hidden'
        variant='outline'
      >
        <Image
          objectFit='cover'
          maxW={{ base: '50%', sm: '200px' }}
          src={selectedServices[0].image}
          alt='SERVIÇO'
        />
        <Stack>
          <CardBody>
            <Heading size='md' mb={2}>
              Resumo:
            </Heading>
            <List spacing={1}>
              {selectedServices.map((s: any) => (
                <ListItem key={s._id}>
                  <ListIcon as={MdCheckCircle} color='green.500' />
                  {s.name}
                </ListItem>
              ))}
            </List>
            <Text mt={2}>
              <b>Duração:</b> {duration} <b>Total:</b> R${amount}
            </Text>
          </CardBody>
        </Stack>
      </Card>

      <Divider />

      <Box w={'full'} textAlign={'center'} marginBlock={5}>
        <Text color={'gray.700'} fontSize={17} fontWeight={'semibold'}>
          {' '}
          Data para o agendamento{' '}
        </Text>
        <Input
          animation={`${pulsate} 1.5s infinite`}
          m={'auto'}
          w={150}
          textAlign={'center'}
          type='date'
          value={date}
          onChange={(e: any) => {
            setDate(e.target.value);
          }}
        />
      </Box>

      <Accordion marginInline={5} defaultIndex={[0]} maxW={{ base: 500, sm: '100%' }} m={'auto'}>
        {schedulePerPrefessional.map((p: any, i: number) => (
          <AccordionItem roundedTop={10} key={i}>
            <AccordionButton
              _expanded={{ bgColor: modifyTheme(company.color, 0.1) }}
              roundedTop={10}
            >
              <Box as='span' flex='1' textAlign='left' fontWeight='bold'>
                <Flex alignItems={'center'} gap={3}>
                  <Image
                    src={p.photo}
                    alt='Foto'
                    rounded={'full'}
                    style={{
                      objectFit: 'cover',
                      width: '50px',
                      height: '50px',
                    }}
                  />
                  {p.name}
                </Flex>
              </Box>
              <AccordionIcon />
            </AccordionButton>

            <AccordionPanel
              pb={4}
              backgroundColor='#3e4e9209'
              roundedBottom={10}
            >
              <ScheduleAvailability
                color={company.color}
                date={moment(date, 'YYYY-MM-DD').toDate()}
                interval={30}
                unavailableTimes={p.schedules}
                scheduleDuration={duration}
                workPeriods={p.selectedWorkPeriod}
                handlChange={(t: any) => {
                  setTime(t);
                  setSelectedProfessional(p);
                  setIsValid(true);
                }}
              />
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>

      <Button
        mt={'40px'}
        marginInline={{ base: 5, md: 50, lg: 250 }}
        fontSize={30}
        p={10}
        cursor={isValid ? 'pointer' : 'auto'}
        disabled={!isValid}
        transition={
          'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s'
        }
        bgColor={isValid ? company.color : modifyTheme(company.color, 0.6)}
        _hover={{
          bgColor: isValid ? company.color : '',
          transform: isValid ? 'scale(1.02)' : '',
          boxShadow: 'none',
        }}
        color={'white'}
        _active={{ boxShadow: 'none' }}
        _focus={{ boxShadow: 'none' }}
        //@ts-ignore
        animation={isValid && `${pulsate} 1.5s infinite`}
        onClick={() => {
          if (!isValid) {
            toast({
              title: 'Selecione um horário',
              description:
                'Você precisa selecionar um horário antes de continuar',
              status: 'info',
              position: 'top-right',
              duration: 6000,
              isClosable: true,
            });
          } else {
            handleCLick(selectedProfessional, time, date, amount, duration);
          }
        }}
      >
        {' '}
        Agendar{' '}
      </Button>
    </Stack>
  );
}
