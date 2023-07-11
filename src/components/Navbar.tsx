import { useContext, useEffect } from "react";
import {
  Box,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  Text,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useRouter } from "next/router";
import { AuthContext } from "@/contexts/auth";
import Logo from "@/components/Logo";
import { IUser } from "@/types/api/User";

let user: IUser;
export default function Navbar() {
  const { isAuth } = useContext(AuthContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const router = useRouter();

  useEffect(() => {
    user = JSON.parse(String(localStorage.getItem("user")));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/");
  };

  return (
    <>
      <Box
        bg={useColorModeValue("#3e4d92", "#3e4d92")}
        px={4}
        py={{ base: 30, md: 2, lg: 2 }}
        display={
          router.pathname.indexOf("private/chat") > -1 ? "none" : "block"
        }
      >
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <Flex
            h={16}
            alignItems={"center"}
            justifyContent={"flex-start"}
            marginLeft={15}
            cursor={"pointer"}
            onClick={() =>
              isAuth ? router.push("private") : router.push("/")
            }
          >
            <Logo
              width={120}
            />
          </Flex>

          <Flex alignItems={"center"}>
            <Stack direction={"row"} spacing={{ base: 0, md: 5, lg: 5 }}>
              <Menu>
                {!isAuth ? (
                  <Stack
                    direction={{ base: "column", md: "row", lg: "row" }}
                    alignItems={'center'}
                    spacing={{ base: 3, md: 2, lg: 2 }}
                  >
                    {router.pathname.indexOf("signup") <= -1 && (
                      <Button
                        variant={"solid"}
                        color={useColorModeValue("#fff", "#fff")}
                        bg={useColorModeValue("#ffc03f", "#ffc03f")}
                        _hover={{ filter: "brightness(110%)" }}
                        w={100}
                        textAlign={'center'}
                        onClick={() => router.push("/signup")}
                      >
                        Criar conta
                      </Button>
                    )}
                    {router.pathname.indexOf("signin") <= -1 && (
                      <Button
                        mt={{ base: 2, md: 0, lg: 0 }}
                        variant={'solid'}
                        bgColor={'#3e4d92'}
                        color={"#fff"}
                        _hover={{ filter: "brightness(110%)" }}
                        w={100}
                        textAlign={'center'}
                        onClick={() => router.push("/signin")}
                      >
                        Entrar
                      </Button>
                    )}
                  </Stack>
                ) : (
                  <Stack direction={"row"} spacing={7}>
                    <MenuButton
                      as={Button}
                      rounded={"full"}
                      variant={"link"}
                      cursor={"pointer"}
                      minW={0}
                    >
                      <Avatar
                        size={"sm"}
                        src={
                          "https://avatars.dicebear.com/api/male/username.svg"
                        }
                      />
                    </MenuButton>
                    <MenuList alignItems={"center"}>
                      <br />
                      <Center>
                        <Avatar
                          size={"2xl"}
                          src={
                            "https://avatars.dicebear.com/api/male/username.svg"
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
                      <MenuItem onClick={handleLogout}>Sair</MenuItem>
                    </MenuList>
                  </Stack>
                )}

                <Button
                  onClick={toggleColorMode}
                  variant={"link"}
                  cursor={"pointer"}
                >
                  {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                </Button>
              </Menu>
            </Stack>
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
