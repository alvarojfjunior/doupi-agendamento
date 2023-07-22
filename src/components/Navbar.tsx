import { useContext, useEffect } from 'react';
import {
  Box,
  Flex,
  Avatar,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/router';
import { AuthContext } from '@/contexts/auth';
import Logo from '@/components/Logo';
import { AxiosInstance } from 'axios';
import { getAxiosInstance } from '@/services/api';
import { IUser } from '@/types/api/User';
import { AppContext } from '@/contexts/app';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

const Links = [
  { route: '/private/', text: 'Agendas' },
  { route: '/private/clients', text: 'Clientes' },
  { route: '/private/professionals', text: 'Profissionais' },
  { route: '/private/services', text: 'Serviços' },
];

let user: IUser;
let api: AxiosInstance;
export default function Navbar() {
  const { isAuth } = useContext(AuthContext);
  const appContext = useContext(AppContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();

  const isCompanyPage = (router.asPath.indexOf('/d/') >= 0) || (router.asPath.indexOf('/a/') >= 0);

  useEffect(() => {
    user = JSON.parse(String(localStorage.getItem('user')));
    api = getAxiosInstance(user);
  }, []);

  const handleLogout = async () => {
    try {
      appContext.onOpenLoading();
      const { data } = await api.get(`/api/auth/logout`);
      localStorage.removeItem('user');
      router.push('/');
      appContext.onCloseLoading();
    } catch (error) {
      appContext.onCloseLoading();
    }
  };
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box bg={'#3e4d92'} px={4} display={isCompanyPage ? 'none' : 'block'}>
        <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            //@ts-ignore
            visibility={!isAuth && 'hidden'}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={'center'}>
            <Flex
              h={16}
              alignItems={'center'}
              justifyContent={'flex-start'}
              marginLeft={15}
              cursor={'pointer'}
              onClick={() => router.push('/')}
            >
              <Logo width={120} />
            </Flex>
            <HStack
              as={'nav'}
              spacing={4}
              display={{ base: 'none', md: 'flex' }}
            >
              {isAuth &&
                Links.map((link) => (
                  <Button
                    key={link.route}
                    color='white'
                    colorScheme='whiteAlpha'
                    variant='ghost'
                    onClick={() => router.push(link.route)}
                  >
                    {link.text}
                  </Button>
                ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={{ base: 0, md: 5, lg: 5 }}>
              <Menu>
                {!isAuth ? (
                  <Stack
                    direction={{ base: 'column', md: 'row', lg: 'row' }}
                    alignItems={'center'}
                    spacing={{ base: 3, md: 2, lg: 2 }}
                  >
                    {router.pathname.indexOf('signup') <= -1 && (
                      <Button
                        display={{ base: 'none', md: 'block', lg: 'block' }}
                        variant={'solid'}
                        fontSize={{ base: 15, md: 15, lg: 15 }}
                        color={useColorModeValue('#fff', '#fff')}
                        bg={useColorModeValue('#ffc03f', '#ffc03f')}
                        _hover={{ filter: 'brightness(110%)' }}
                        w={{ base: 20, md: 100, lg: 100 }}
                        textAlign={'center'}
                        onClick={() => router.push('/signup')}
                      >
                        Criar conta
                      </Button>
                    )}
                    {router.pathname.indexOf('signin') <= -1 && (
                      <Button
                        mt={{ base: 2, md: 0, lg: 0 }}
                        variant={'solid'}
                        bgColor={'#3e4d92'}
                        color={'#fff'}
                        _hover={{ filter: 'brightness(110%)' }}
                        w={100}
                        textAlign={'center'}
                        onClick={() => router.push('/signin')}
                      >
                        Entrar
                      </Button>
                    )}
                  </Stack>
                ) : (
                  <Stack direction={'row'} spacing={7}>
                    <MenuButton
                      as={Button}
                      rounded={'full'}
                      variant={'link'}
                      cursor={'pointer'}
                      minW={0}
                    >
                      <Avatar
                        size={'sm'}
                        src={
                          'https://avatars.dicebear.com/api/male/username.svg'
                        }
                      />
                    </MenuButton>
                    <MenuList alignItems={'center'}>
                      <br />
                      <Center>
                        <Avatar
                          size={'2xl'}
                          src={
                            'https://avatars.dicebear.com/api/male/username.svg'
                          }
                        />
                      </Center>
                      <br />
                      <Center color={'gray.500'}>
                        <p>{user && user.name}</p>
                      </Center>
                      <br />
                      <MenuDivider />
                      {/* <MenuItem>Meus dados</MenuItem> */}
                      <MenuItem onClick={() => router.push('/private/company')}>
                        Dados da empresa
                      </MenuItem>
                      <MenuItem onClick={handleLogout}>Sair</MenuItem>
                    </MenuList>
                  </Stack>
                )}

                <Button
                  onClick={toggleColorMode}
                  variant={'link'}
                  cursor={'pointer'}
                >
                  {colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
                </Button>
              </Menu>
            </Stack>
          </Flex>
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {isAuth &&
                Links.map((link) => (
                  <Button
                    key={link.route}
                    color='white'
                    colorScheme='whiteAlpha'
                    variant='ghost'
                    onClick={() => {
                      onClose();
                      router.push(link.route);
                    }}
                  >
                    {link.text}
                  </Button>
                ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
