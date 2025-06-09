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
import Logo from '@/components/Logo';
import { AxiosInstance } from 'axios';
import { getApiInstance } from '@/services/api';
import { AppContext } from '@/contexts/app';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';

const Links = [
  { label: 'Agendas', href: '/private/' },
  { label: 'Clientes', href: '/private/clients' },
  { label: 'Profissionais', href: '/private/professionals' },
  { label: 'Serviços', href: '/private/services' },
  { label: 'Caixa', href: '/private/cashier' },
  { label: 'Relatórios', href: '/private/reports' },
];

let api: AxiosInstance;
export default function Navbar({ user }: any) {
  const appContext = useContext(AppContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();

  const isCompanyPage =
    router.asPath.indexOf('/d/') >= 0 || router.asPath.indexOf('/a/') >= 0;

  useEffect(() => {
    api = getApiInstance(user);
  }, []);

  const handleLogout = async () => {
    try {
      appContext.onOpenLoading();
      const { data } = await api.get(`/api/auth/logout`);
      
      // Limpar qualquer estado local que possa estar mantendo informações do usuário
      if (typeof window !== 'undefined') {
        // Limpar localStorage se estiver sendo usado para armazenar dados do usuário
        localStorage.removeItem('user');
        
        // Forçar um hard refresh para garantir que todos os estados sejam limpos
        window.location.href = '/';
        return; // Importante: retornar aqui para evitar que o código abaixo seja executado
      }
      
      router.push('/');
      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);
      appContext.onCloseLoading();
      
      // Adicionar notificação de erro
      toast({
        title: 'Erro ao fazer logout',
        description: 'Ocorreu um erro ao tentar sair. Tente novamente.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
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
            visibility={!user && 'hidden'}
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
              {user &&
                Links.map((link) => (
                  <Button
                    key={link.href}
                    color='white'
                    colorScheme='whiteAlpha'
                    variant='ghost'
                    onClick={() => router.push(link.href)}
                  >
                    {link.label}
                  </Button>
                ))}
            </HStack>
          </HStack>
          <Flex alignItems={'center'}>
            <Stack direction={'row'} spacing={{ base: 0, md: 5, lg: 5 }}>
              <Menu>
                {!user ? (
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
                          'https://api.dicebear.com/7.x/avataaars-neutral/svg?eyes=squint&mouth=smile&backgroundType=gradientLinear'
                        }
                      />
                    </MenuButton>
                    <MenuList alignItems={'center'}>
                      <br />
                      <Center>
                        <Avatar
                          size={'2xl'}
                          src={
                            'https://api.dicebear.com/7.x/avataaars-neutral/svg?eyes=squint&mouth=smile&backgroundType=gradientLinear'
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

                      {user.isDoupiAdmin && <MenuItem onClick={() => router.push('/private/doupiAdmin/companies')}>
                        Painel Doupi
                      </MenuItem>}
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
              {user &&
                Links.map((link) => (
                  <Button
                    key={link.href}
                    color='white'
                    colorScheme='whiteAlpha'
                    variant='ghost'
                    onClick={() => {
                      onClose();
                      router.push(link.href);
                    }}
                  >
                    {link.label}
                  </Button>
                ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
