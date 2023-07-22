import {
  Image,
  Box,
  Heading,
  Text,
  Stack,
  useColorMode,
  useToast,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
} from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { Company, Schedule } from '../../services/database';
import moment from 'moment';
import axios from 'axios';
import { AppContext } from '@/contexts/app';
import ConfirmButtonModal from '@/components/ConfirmButtonModal';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';

export async function getServerSideProps(context: any) {
  try {
    const { scheduleId } = context.query;

    if (scheduleId) {
      const schedule: any = await Schedule.findOne({
        _id: scheduleId,
        status: 'agendado',
      }).lean();

      const company: any = await Company.findOne({
        _id: schedule.companyId,
      }).lean();

      return {
        props: {
          company: JSON.parse(JSON.stringify(company)),
          schedule: JSON.parse(JSON.stringify(schedule)),
        },
      };
    } else
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
  } catch (error) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
}

const api = axios.create({
  baseURL: '',
});

export default function CompanyPage({ company, schedule }: any) {
  const appContext = useContext(AppContext);
  const router = useRouter();
  const { setColorMode } = useColorMode();

  const toast = useToast();
  const [isSomeSelected, setIsSomeSelected] = useState(false);

  useEffect(() => {
    setColorMode('light');
  }, []);

  const handleCancel = async () => {
    try {
      appContext.onOpenLoading();

      const { data } = await api.put(`/api/publics/schedules`, {
        _id: schedule._id,
        status: 'cancelado',
      });
      appContext.onCloseLoading();
      router.push(`/d/${company.name.replaceAll(' ', '-')}`);
      toast({
        title: 'O seu agendamento foi cancelado',
        description: 'Notifique o profissional pelo whatsapp',
        status: 'success',
        position: 'top-right',
        duration: 9000,
        isClosable: true,
      });

      let message = 'Olá, acabei de *cancelar um agendamento*. \n\n';
      message += `Agendamento: ${moment(schedule.date).format('DD/MM/YYYY')} ${
        schedule.time
      }`;

      const phone = String(company.phone)
        .replaceAll(' ', '')
        .replaceAll('(', '')
        .replaceAll(')', '')
        .replaceAll('-', '');
      window.open(
        `https://api.whatsapp.com/send?phone=55${phone}&text=${message}`,
        '_blank'
      );
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
    }
  };

  return (
    <>
      <Head>
        <title>{company.name}</title>
      </Head>
      <Stack mb={30}>
        <Box
          width={'100%'}
          height={{ base: 150, md: 250, lg: 250 }}
          overflow='hidden'
          justifyContent='center'
          alignItems='center'
        >
          <Image alt='company image' w={'full'} src={company.coverImage} />
        </Box>
        <Heading
          fontSize={'3xl'}
          color={'gray.600'}
          textAlign={'center'}
          mt={'20px'}
          mb={'50px'}
        >
          {company.name}
        </Heading>

        <Card
          align='center'
          variant={'elevated'}
          maxW={500}
          m={'auto'}
          boxShadow={`0px 0px 10px 0px ${company.color}`}
        >
          <CardHeader>
            <Heading size='md' color={'gray.600'}>
              {' '}
              Agendamento {moment(schedule.date).format('DD/MM/YYYY')}{' '}
              {schedule.time}{' '}
            </Heading>
          </CardHeader>
          <CardBody>
            <Text textAlign={'center'}>
              Clicando no botão abaixo você irá cancelar este agendamento, estja
              certo disso!
            </Text>
          </CardBody>
          <CardFooter flexDir={'column'} gap={5}>
            <ConfirmButtonModal
              colorScheme={'red'}
              value={'Cancelar Agendamento'}
              onDelete={handleCancel}
            />

            <Link
              style={{ color: 'blue' }}
              href={`/d/${company.name.replaceAll(' ', '-')}`}
            >
              Ir para a {company.name}
            </Link>
          </CardFooter>
        </Card>
      </Stack>
    </>
  );
}
