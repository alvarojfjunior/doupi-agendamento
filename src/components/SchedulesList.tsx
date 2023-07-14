import { useContext, useEffect } from "react";
import { AppContext } from "@/contexts/app";
import { useRouter } from "next/router";
import { AuthContext } from "@/contexts/auth";
import Page from "@/components/Page";
import { IUser } from "@/types/api/User";
import { AxiosInstance } from "axios";
import { getAxiosInstance } from "@/services/api";
import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Grid,
  GridItem,
  Text,
  useToast,
} from "@chakra-ui/react";
import { format, isSameDay } from "date-fns";

const mockAgenda = [
  { horario: "09:00", cliente: "João" },
  { horario: "10:00", cliente: "Maria" },
  { horario: "13:00", cliente: "Pedro" },
];

let user: IUser;
let api: AxiosInstance;
export default function Panel() {
  const appContext = useContext(AppContext);
  const toast = useToast();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = React.useState(new Date());

  useEffect(() => {
    user = JSON.parse(String(localStorage.getItem("user")));
    api = getAxiosInstance(user);
    appContext.onCloseLoading();
  }, []);

  const getFormattedDate = (date: any) => {
    return format(date, "dd/MM/yyyy");
  };

  const getHorariosAgendados = (date: any) => {
    return mockAgenda.filter((item) => isSameDay(date, selectedDate));
  };

  return (
    <Box>
      <Accordion>
        <AccordionItem roundedTop={10}>
          <AccordionButton
            _expanded={{ bg: "#3E4D92", color: "white" }}
            roundedTop={10}
          >
            <Box as="span" flex="1" textAlign="left" fontWeight="bold">
              Álvaro Ferreira
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} backgroundColor="#3e4e9209" roundedBottom={10}>
            <Box>
              <Grid templateColumns="repeat(10, 1fr)" gap={4} mt={4}>
                {getHorariosAgendados(selectedDate).map((item, index) => (
                  <GridItem
                    cursor={"pointer"}
                    key={index}
                    colSpan={1}
                    _hover={{
                      bgColor: "#3E4D92",
                      color: "white",
                    }}
                    border={"1px solid #ccc"}
                    p={2}
                    textAlign={"center"}
                    borderRadius="md"
                  >
                    <Text fontWeight="bold">{item.horario}</Text>
                    <Text>{item.cliente}</Text>
                  </GridItem>
                ))}
              </Grid>
            </Box>
          </AccordionPanel>
        </AccordionItem>

        <AccordionItem rounded={10}>
          <AccordionButton
            _expanded={{ bg: "#3E4D92", color: "white" }}
            roundedTop={10}
          >
            <Box as="span" flex="1" textAlign="left" fontWeight="bold">
              Cáudio Berga
            </Box>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4} backgroundColor="#3e4e9211" roundedBottom={10}>
            <Box>
              <Grid templateColumns="repeat(10, 1fr)" gap={4} mt={4}>
                {getHorariosAgendados(selectedDate).map((item, index) => (
                  <GridItem
                    cursor={"pointer"}
                    key={index}
                    colSpan={1}
                    _hover={{ backgoundColor: "brightness(110%)" }}
                    border={"1px solid #ccc"}
                    p={2}
                    textAlign={"center"}
                    borderRadius="md"
                  >
                    <Text fontWeight="bold">{item.horario}</Text>
                    <Text>{item.cliente}</Text>
                  </GridItem>
                ))}
              </Grid>
            </Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}
