import { Text, Box } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import { AppContext } from "@/contexts/app";
import { useRouter } from "next/router";
import { AuthContext } from "@/contexts/auth";
import Page from "@/components/Page";
import DoubleLineChart from "@/components/DoubleLineChart ";

export default function Panel() {
  const router = useRouter();
  const appContext = useContext(AppContext);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    appContext.onCloseLoading();
  }, []);

  return (
    <Page
      path="/private"
      title="E Agora - Painel Geral"
      description="App para genciamento de agendamentos"
    >
      <Box margin={"auto"} textAlign={"center"}>
        <Text fontSize={"3xl"} mb={"10"} color="#274765" fontWeight="bold">
          Painel aqui
        </Text>
      </Box>
    </Page>
  );
}
