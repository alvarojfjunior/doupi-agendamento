import {
  Box,
  chakra,
  Container,
  Flex,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
} from "@chakra-ui/react";
import { ReactNode, useContext } from "react";
import Logo from "@/components/Logo";
import { useRouter } from "next/router";
import { AuthContext } from "@/contexts/auth";

const SocialButton = ({
  children,
  label,
  href,
}: {
  children: ReactNode;
  label: string;
  href: string;
}) => {
  return (
    <chakra.button
      rounded={"full"}
      w={8}
      h={8}
      cursor={"pointer"}
      as={"a"}
      href={href}
      display={"inline-flex"}
      alignItems={"center"}
      justifyContent={"center"}
      transition={"background 0.3s ease"}
      bg={useColorModeValue("blackAlpha.100", "whiteAlpha.100")}
      _hover={{
        bg: useColorModeValue("blackAlpha.200", "whiteAlpha.200"),
      }}
    >
      <VisuallyHidden>{label}</VisuallyHidden>
      {children}
    </chakra.button>
  );
};

export default function SmallWithLogoLeft() {
  const router = useRouter();
  const { isAuth, users } = useContext(AuthContext);
  return (
    <Box
      display={router.pathname.indexOf("private/chat") > -1 ? "none" : "block"}
      w="full"
      bg={useColorModeValue("gray.50", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
    >
      <Container
        as={Stack}
        maxW={"6xl"}
        py={4}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "center" }}
      >
        <Flex 
        alignItems={"center"} 
        cursor={"pointer"}
        onClick={() =>
          isAuth ? router.push("private") : router.push("/")
        }>
          <Logo height={32} />
          <Text
            marginLeft={5}
            variant={"solid"}
          >
            E Agora
          </Text>
        </Flex>
        <Text>© 2023 E Agora. Developed with love ❤️ </Text>
        {/* <Stack direction={"row"} spacing={6}>
          <SocialButton label={"Twitter"} href={"#"}>
            <FaTwitter />
          </SocialButton>
          <SocialButton label={"YouTube"} href={"#"}>
            <FaYoutube />
          </SocialButton>
          <SocialButton label={"Instagram"} href={"#"}>
            <FaInstagram />
          </SocialButton>
        </Stack> */}
      </Container>
    </Box>
  );
}
