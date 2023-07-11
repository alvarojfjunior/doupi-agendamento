import { Text, Box, useToast } from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import { AppContext } from "@/contexts/app";
import { useRouter } from "next/router";
import { AuthContext } from "@/contexts/auth";
import Page from "@/components/Page";
import { IUser } from "@/types/api/User";
import { AxiosInstance } from "axios";
import { getAxiosInstance } from "@/services/api";

let user: IUser;
let api: AxiosInstance;
export default function Panel() {
  const appContext = useContext(AppContext);
  const toast = useToast();
  const router = useRouter();
  
  useEffect(() => {
    user = JSON.parse(String(localStorage.getItem("user")));
    api = getAxiosInstance(user);
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
          Sua Agenda aqui
        </Text>
      </Box>
    </Page>
  );
}
