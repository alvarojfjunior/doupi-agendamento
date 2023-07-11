import { Text, Box } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import { AppContext } from "@/contexts/app";
import { useRouter } from "next/router";
import { AuthContext } from "@/contexts/auth";
import Page from "@/components/Page";

export default function Panel() {
  const appContext = useContext(AppContext);

  useEffect(() => {
    appContext.onCloseLoading();
  }, []);

  return (
    <Page
      path="/private"
      title="Doupi - Painel Geral"
      description="App para genciamento de agendamentos"
    >
      <Box margin={"auto"} textAlign={"center"}>
        <Text fontSize={"3xl"} mb={"10"} color="#3e4d92" fontWeight="bold">
          Painel aqui
        </Text>
      </Box>
    </Page>
  );
}
