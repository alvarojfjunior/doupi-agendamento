import {
  Image as ChakraImage,
  Box,
  Button,
  useColorModeValue,
  Heading,
  Text,
  Stack,
  useColorMode,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getFontColor, modifyTheme, pulsate } from '@/utils/style';
import { CheckIcon } from '@chakra-ui/icons';

export default function SelectService({
  company,
  services: servicesProps,
  handleCLick,
}: any) {
  const { setColorMode } = useColorMode();
  const toast = useToast();
  const [isSomeSelected, setIsSomeSelected] = useState(false);

  const [services, setServices] = useState(
    servicesProps.map((s: any) => {
      s.selected = false;
      return s;
    })
  );

  useEffect(() => {
    if (services.find((s: any) => s.selected)) setIsSomeSelected(true);
    else setIsSomeSelected(false);
  }, [services]);

  useEffect(() => {
    setColorMode('light');
  }, []);

  const handleSelectService = (service: any) => {
    const isSelected: any = services.find((s: any) => s._id === service._id);
    isSelected.selected = !isSelected.selected;
    if (isSelected.selected)
      toast({
        title: 'Serviço Selecionado!',
        description: 'Selecione um mais e clique em "Agendar" para concluir!',
        status: 'success',
        position: 'top-right',
        duration: 2000,
        isClosable: true,
      });

    setServices((prevItems: any) =>
      prevItems.map((item: any) => {
        if (item._id === isSelected._id) {
          return { ...item, isSelected };
        }
        return item;
      })
    );
  };

  return (
    <Stack>
        <Text textAlign={'center'} fontSize={20}> Selecione um ou mais serviços </Text>
        <Flex
          mt={'50px'}
          wrap={'wrap'}
          alignItems={'center'}
          justifyContent={'center'}
          gap={{ base: 20, md: 10, lg: 10 }}
        >
          {services.map((s: any, i: number) => (
            <Box
              onClick={() => handleSelectService(s)}
              cursor={'pointer'}
              transition={
                'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s'
              }
              _hover={{
                bgColor: s.selected
                  ? modifyTheme(company.color, 0.3)
                  : modifyTheme(company.color, 0.8),
                transform: 'scale(1.02)',
                color: getFontColor(company.color),
              }}
              key={s._id}
              role={'group'}
              p={6}
              maxW={'330px'}
              bg={useColorModeValue('white', 'gray.800')}
              boxShadow={'2xl'}
              rounded={'lg'}
              pos={'relative'}
              zIndex={1}
              bgColor={s.selected ? modifyTheme(company.color, 0.3) : '#fff'}
            >
              <Box
                rounded={'lg'}
                mt={-12}
                pos={'relative'}
                height={'230px'}
                _after={{
                  transition: 'all .3s ease',
                  content: '""',
                  w: 'full',
                  h: 'full',
                  pos: 'absolute',
                  top: 5,
                  left: 0,
                  backgroundImage: `url(${s.image})`,
                  filter: 'blur(15px)',
                  zIndex: -1,
                }}
                _groupHover={{
                  _after: {
                    filter: 'blur(20px)',
                  },
                }}
              >
                <ChakraImage
                  rounded={'lg'}
                  height={230}
                  width={282}
                  objectFit={'cover'}
                  src={s.image}
                />
              </Box>
              <Stack pt={10} align={'center'}>
                <Heading
                  fontSize={'2xl'}
                  fontFamily={'body'}
                  fontWeight={500}
                  color={'gray.700'}
                >
                  {s.name + ' '}
                  {s.selected && <CheckIcon color={'green'} />}
                </Heading>
                <Text
                  color={'gray.600'}
                  fontSize={'sm'}
                  textTransform={'uppercase'}
                  h={50}
                >
                  {s.description}
                </Text>
                <Stack direction={'row'} align={'center'}>
                  <Text fontWeight={800} fontSize={'xl'}>
                    R${s.price}
                  </Text>
                  <Text textDecoration={'line-through'} color={'gray.700'}>
                    {(parseFloat(s.price) + 0.1 * parseFloat(s.price))
                      .toFixed(2)
                      .replace('.', ',')}
                  </Text>
                </Stack>
              </Stack>
            </Box>
          ))}
        </Flex>


        <Button
          mt={'40px'}
          marginInline={{ base: 5, md: 50, lg: 250 }}
          fontSize={30}
          p={10}
          cursor={isSomeSelected ? 'pointer' : 'auto'}
          disabled={!isSomeSelected}
          transition={
            'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s'
          }
          bgColor={
            isSomeSelected ? company.color : modifyTheme(company.color, 0.6)
          }
          _hover={{
            bgColor: isSomeSelected ? company.color : '',
            transform: isSomeSelected ? 'scale(1.02)' : '',
            boxShadow: 'none',
          }}
          color={'white'}
          _active={{ boxShadow: 'none' }}
          _focus={{ boxShadow: 'none' }}
          //@ts-ignore
          animation={isSomeSelected && `${pulsate} 1.5s infinite`}
          onClick={() => {
            if (!isSomeSelected)
              toast({
                title: 'Selecione um serviço',
                description:
                  'Você precisa selecionar um serviço antes de continuar',
                status: 'info',
                position: 'top-right',
                duration: 6000,
                isClosable: true,
              });
            else {
              handleCLick(services.filter((s: any) => s.selected === true))
            }
          }}
        >
          {' '}
          Agendar{' '}
        </Button>
      </Stack>
  );
}
