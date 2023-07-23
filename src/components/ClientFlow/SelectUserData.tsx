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
  Box,
  Divider,
  List,
  ListIcon,
  Flex,
  Input,
} from '@chakra-ui/react';
import { MdCheckCircle } from 'react-icons/md';
import { useEffect, useState } from 'react';
import { modifyTheme, pulsate } from '@/utils/style';
import moment from 'moment';
import axios from 'axios';
import { sumHours } from '@/utils/time';
import ReactInputMask from 'react-input-mask';

const api = axios.create({
  baseURL: '',
});

export default function SelectUserData({
  company,
  selectedServices,
  selectedProfessional,
  selectedTime,
  selectedDate,
  selectedAmount,
  selectedDuration,
  handleCLick,
}: any) {
  const toast = useToast();
  const [isValid, setIsValid] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const localStorageName = localStorage.getItem('name');
    const localStoragePhone = localStorage.getItem('phone');
    setName(localStorageName ? localStorageName : '');
    setPhone(localStoragePhone ? localStoragePhone : '');
  }, []);

  useEffect(() => {
    if (name.length >= 5 && validPhone(phone)) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [name, phone]);

  function validPhone(str: string) {
    const regex = /(\d+)/g;
    const numerosEncontrados = str.match(regex);
    if (!numerosEncontrados) {
      return 0;
    }
    return numerosEncontrados.join('').length === 11;
  }

  return (
    <Stack>
      <Card
        maxW={'600px'}
        m={'auto'}
        direction={{ base: 'column', sm: 'row' }}
        overflow='hidden'
        variant='outline'
      >
        <Image
          objectFit='cover'
          maxW={{ base: '100%', sm: '200px' }}
          src={selectedServices[0].image}
          alt='sERVIÇO'
        />
        <Stack>
          <CardBody>
            <Heading size='md' mb={2}>
              Resumo do agendamento
            </Heading>

            <Box>
              <Text fontWeight={'bold'}> Profissional: </Text>
              <Flex alignItems={'center'} gap={3}>
                <Image
                  src={selectedProfessional.photo}
                  alt='Foto'
                  rounded={'full'}
                  style={{
                    objectFit: 'cover',
                    width: '50px',
                    height: '50px',
                  }}
                />
                <Text fontWeight={'semibold'}>
                  {' '}
                  {selectedProfessional.name}{' '}
                </Text>
              </Flex>
            </Box>

            <Box mt={3}>
              <Text fontWeight={'bold'}> Serviços: </Text>
              <List spacing={1}>
                {selectedServices.map((s: any) => (
                  <ListItem key={s._id} fontWeight={'semibold'}>
                    <ListIcon as={MdCheckCircle} color='green.500' />
                    {s.name}
                  </ListItem>
                ))}
              </List>
            </Box>

            <Box>
              <Text
                mt={3}
                fontWeight={'semibold'}
                animation={`${pulsate} 1.5s infinite`}
              >
                Data: {moment(selectedDate, 'YYYY-MM-DD').format('DD/MM')} às{' '}
                {selectedTime}
              </Text>
              <Text mt={3} fontWeight={'semibold'}>
                Duração: {selectedDuration}. {' | '}Total: R${selectedAmount}
              </Text>
            </Box>
          </CardBody>
        </Stack>
      </Card>

      <Divider />

      <Box w={'full'} mt={5}>
        <Box
          maxW={400}
          m={'auto'}
          border={'1px solid #ccc'}
          borderRadius={10}
          p={7}
        >
          <Text
            textAlign={'center'}
            color={'gray.700'}
            fontSize={17}
            fontWeight={'bold'}
            mb={5}
          >
            {' '}
            Informe nome e telefone para concluir o agendamento.
          </Text>
          <Text fontWeight={'semibold'}> Seu Nome: </Text>
          <Input value={name} onChange={(e: any) => setName(e.target.value)} />

          <Text fontWeight={'semibold'} mt={5}>
            {' '}
            Seu Telefone (Whatsapp):{' '}
          </Text>
          <Input
            as={ReactInputMask}
            value={phone}
            onChange={(e: any) => setPhone(e.target.value)}
            mask='(99) 9 9999-9999'
          />

          <Button
            mt={'40px'}
            fontSize={30}
            w={'100%'}
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
                  title: 'Preencha os dados',
                  description:
                    'Você precisa informar nome e telefone para concluir o agendamento',
                  status: 'info',
                  position: 'top-right',
                  duration: 6000,
                  isClosable: true,
                });
              } else {
                handleCLick(name, phone);
              }
            }}
          >
            {' '}
            Agendar{' '}
          </Button>
        </Box>
      </Box>
    </Stack>
  );
}
