import {
  Image,
  Box,
  Center,
  useColorModeValue,
  Heading,
  Text,
  Stack,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { Company, Service } from '../../services/database';
import { getFontColor, modifyTheme } from '@/utils/style';

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

export default function CompanyPage({ company, services }: any) {
  useEffect(() => {
    console.log(services);
  }, []);

  return (
    <Stack>
      <Box
        width={'100%'}
        height={{ base: 150, md: 250, lg: 250 }}
        overflow='hidden'
        justifyContent='center'
        alignItems='center'
        mb={{ base: 0, md: 5, lg: 8 }}
      >
        <Image alt='company image' w={'full'} src={company.coverImage} />
      </Box>
      <Heading fontSize={'2xl'} textAlign={'center'}>
        {company.name}
      </Heading>

      <Center py={12} gap={5}>
        {services.map((s: any) => (
          <Box
            cursor={'pointer'}
            _hover={{
              bgColor: modifyTheme(company.color, 0.2),
              color: getFontColor(company.color)
            }}
            key={s._id}
            role={'group'}
            p={6}
            maxW={'330px'}
            w={'full'}
            bg={useColorModeValue('white', 'gray.800')}
            boxShadow={'2xl'}
            rounded={'lg'}
            pos={'relative'}
            zIndex={1}
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
              <Image
                rounded={'lg'}
                height={230}
                width={282}
                objectFit={'cover'}
                src={s.image}
              />
            </Box>
            <Stack pt={10} align={'center'}>
              <Heading fontSize={'2xl'} fontFamily={'body'} fontWeight={500}>
                {s.name}
              </Heading>
              <Text
                color={'gray.500'}
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
                <Text textDecoration={'line-through'} color={'gray.600'}>
                  {(parseFloat(s.price) + ((5 /100) * parseFloat(s.price))).toFixed(2).replace('.', ',')}
                </Text>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Center>
    </Stack>
  );
}
