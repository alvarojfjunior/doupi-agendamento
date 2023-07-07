import {
  Button,
  Flex,
  Heading,
  Image,
  Stack,
  Text,
  useBreakpointValue,
  useColorModeValue,
} from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Home({ data }: any) {
  const router = useRouter();

  return (
    <Stack h={"full"} direction={{ base: "column", md: "row" }}>
      <Flex p={8} flex={1} align={"center"} justify={"center"}>
        <Stack spacing={6} w={"full"} maxW={"lg"}>
          <Heading fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}>
            <Text
              as={"span"}
              position={"relative"}
              color={useColorModeValue("#e93e13", "#FFF")}
              _after={{
                content: "''",
                width: "full",
                height: useBreakpointValue({ base: "20%", md: "30%" }),
                position: "absolute",
                bottom: 1,
                left: 0,
                bg: useColorModeValue("#e93e1336", "#e93e13"),
                zIndex: -1,
              }}
            >
              E Agora
            </Text>
            <br />{" "}
            <Text
              color={useColorModeValue("#274765", "#1BA890")}
              as={"span"}
              textAlign={"center"}
            >
              Gerencie todo o seu negócio com o E Agora!
            </Text>{" "}
          </Heading>
          <Text fontSize={{ base: "md", lg: "lg" }} color={"gray.500"}>
            Com o E Agora, você consegue controlar todos os agendamentos do seu
            negócio e se tornar cada vez mais profissional e competitivo!
          </Text>
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Button
              rounded={"full"}
              bg={useColorModeValue("#31587c", "#1BA890")}
              color={"white"}
              _hover={{
                bg: useColorModeValue("#31587c", "#3bcab2"),
              }}
              onClick={() => router.push("/signup")}
            >
              Testar Grátis!
            </Button>
            <Button rounded={"full"} onClick={() => router.push("/signin")}>
              Entrar
            </Button>
          </Stack>
        </Stack>
      </Flex>
      <Flex
        flex={1}
        alignItems={"center"}
        justifyContent={"center"}
        flexDir={"column"}
      ></Flex>
    </Stack>
  );
}
