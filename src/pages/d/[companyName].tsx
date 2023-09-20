import {
  Box,
  Button,
  Image as ChakraImage,
  Heading,
  Stack,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { Company, Service } from '../../services/database';
import Head from 'next/head';
import SelectService from '@/components/ClientFlow/SelectService';
import SelectShedule from '@/components/ClientFlow/SelectShedule';
import SelectUserData from '@/components/ClientFlow/SelectUserData';
import axios from 'axios';
import moment from 'moment';
import { AppContext } from '@/contexts/app';
import { useRouter } from 'next/router';
import { getScheduleNotification } from '@/utils/notificarions';
import { ArrowForwardIcon, ArrowLeftIcon } from '@chakra-ui/icons';
import { modifyTheme } from '@/utils/style';
import { sendWhatsappMessage } from '@/services/whatsapp';

export async function getServerSideProps(context: any) {
  const { companyName } = context.query;

  const company = await Company.findOne({
    name: companyName.replaceAll('-', ' '),
  }).lean();

  const services = await Service.find({
    companyId: company?._id,
  }).lean();

  if (!company) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  return {
    props: {
      company: JSON.parse(JSON.stringify(company)),
      services: JSON.parse(JSON.stringify(services)),
    },
  };
}

const api = axios.create({
  baseURL: '',
});

export default function CompanyPage({ company, services: servicesProps }: any) {
  const { setColorMode } = useColorMode();
  const toast = useToast();
  const router = useRouter();
  const appContext = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState<any>({});
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedName, setSelectedName] = useState('');
  const [selectedPhone, setSelectedPhone] = useState('');
  const [selectedAmount, setSelectedAmount] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');

  useEffect(() => {
    setColorMode('light');
  }, []);

  const handleSelectService = (selectedServices: any) => {
    setSelectedServices(selectedServices);
    setStep(2);
  };

  const handleSelectSchedule = (
    professional: any,
    time: string,
    date: string,
    amount: string,
    duration: string
  ) => {
    setSelectedProfessional(professional);
    setSelectedTime(time);
    setSelectedDate(date);
    setSelectedAmount(amount);
    setSelectedDuration(duration);
    setStep(3);
  };

  const handleSelectUser = async (name: string, phone: string) => {
    setSelectedName(name);
    setSelectedPhone(phone);

    localStorage.setItem('name', name);
    localStorage.setItem('phone', phone);

    try {
      appContext.onOpenLoading();
      const body = {
        name: name,
        phone: phone,
        companyId: company._id,
        professionalId: selectedProfessional._id,
        serviceIds: selectedServices.map((s: any) => s._id),
        date: selectedDate,
        time: selectedTime,
        duration: selectedDuration,
        origem: 'client',
      };
      const { data } = await api.post(`/api/publics/schedules`, body);

      toast({
        title: 'Agendamento Registrado!',
        description: 'O seu agendamento foi agendado!',
        status: 'success',
        position: 'top-right',
        duration: 20000,
        isClosable: true,
      });

      const notidy = getScheduleNotification(
        data._id,
        name,
        selectedProfessional.name,
        company.name,
        selectedServices.map((s: any) => s.name),
        moment(selectedDate, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        selectedTime
      );

      sendWhatsappMessage(
        selectedProfessional.whatsapp,
        notidy,
      );

      sendWhatsappMessage(phone, notidy);

      setStep(1);
      appContext.onCloseLoading();
    } catch (error: any) {
      console.log(error);
      appContext.onCloseLoading();
      toast({
        title: 'Houve um erro',
        description: 'Tente mais tarde.',
        status: 'error',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <Box bgColor={modifyTheme(company.color, 0.97)}>
      <Head>
        <title>{company.name}</title>
      </Head>
      <Stack mb={30}>
        <Box
          w={'100%'}
          bgColor={modifyTheme(company.color, 0.5)}
          boxShadow={`0px 0px 10px 10px ${company.color}`}
          mb={5}
        >
          <ChakraImage
            src={company.coverImage}
            objectFit='cover'
            boxSize='100%'
            maxW={800}
            m={'auto'}
            h={{ base: 200, sm: 300 }}
            alt='Imagem de capa'
          />
        </Box>
        <Heading
          fontSize={'3xl'}
          color={'gray.700'}
          textAlign={'center'}
          mt={step > 1 ? '0px' : '10px'}
          mb={5}
        >
          {company.name}
        </Heading>

        {step === 1 ? (
          <SelectService
            company={company}
            services={servicesProps}
            handleCLick={handleSelectService}
          />
        ) : step === 2 ? (
          <SelectShedule
            company={company}
            selectedServices={selectedServices}
            handleCLick={handleSelectSchedule}
          />
        ) : (
          <SelectUserData
            company={company}
            selectedServices={selectedServices}
            selectedProfessional={selectedProfessional}
            selectedTime={selectedTime}
            selectedDate={selectedDate}
            selectedAmount={selectedAmount}
            selectedDuration={selectedDuration}
            handleCLick={handleSelectUser}
          />
        )}
      </Stack>

      {step > 1 && (
        <Stack direction='row' spacing={4} position={'absolute'} top={5}>
          <Button
            leftIcon={<ArrowLeftIcon />}
            variant='solid'
            marginLeft={5}
            onClick={() => setStep(step - 1)}
          >
            Voltar
          </Button>
        </Stack>
      )}
    </Box>
  );
}
