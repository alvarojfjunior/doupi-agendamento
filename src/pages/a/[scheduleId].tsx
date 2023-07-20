import {
  Image,
  Box,
  Button,
  useColorModeValue,
  Heading,
  Text,
  Stack,
  useColorMode,
  useToast,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Company, Schedule } from '../../services/database';
import moment from 'moment';

export async function getServerSideProps(context: any) {
  const { scheduleId } = context.query;

  const schedule: any = await Schedule.findOne({
    _id: scheduleId,
  }).lean();

  const company = await Company.findOne({
    _id: schedule.companyId,
  }).lean();

  return {
    props: {
      company: JSON.parse(JSON.stringify(company)),
      schedule: JSON.parse(JSON.stringify(schedule)),
    },
  };
}

export default function CompanyPage({ company, schedule }: any) {
  const { setColorMode } = useColorMode();
  const toast = useToast();
  const [isSomeSelected, setIsSomeSelected] = useState(false);

  useEffect(() => {
    setColorMode('light');
  }, []);

  return (
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
        color={'gray.700'}
        textAlign={'center'}
        mt={'20px'}
      >
        {company.name}
      </Heading>
      <Text textAlign={'center'} color={'gray.600'}>
        {' '}
        Opções do agendamento
      </Text>

      <Text>Data: {moment(schedule.date).format('DD/MM/YYYY')} {schedule.time}</Text>
      <Text>Duração: {schedule.duration}</Text>

      <Button colorScheme='red'> Cancelar </Button>

      <Box mt={'50px'}></Box>
    </Stack>
  );
}
