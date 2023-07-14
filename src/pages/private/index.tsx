import { useContext, useEffect } from "react";
import { AppContext } from "@/contexts/app";
import { useRouter } from "next/router";
import { AuthContext } from "@/contexts/auth";
import InputMask from "react-input-mask";
import Page from "@/components/Page";
import { IUser } from "@/types/api/User";
import { AxiosInstance } from "axios";
import { getAxiosInstance } from "@/services/api";
import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  IconButton,
  useColorMode,
  Box,
  Grid,
  GridItem,
  Text,
  useToast,
  Image as ChakraImage,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  HStack,
  DrawerHeader,
  DrawerBody,
  FormLabel,
  FormControl,
  Input,
  DrawerFooter,
  Button,
} from "@chakra-ui/react";
import makeAnimated from "react-select/animated";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";
import { AddIcon } from "@chakra-ui/icons";
import { isSameDay } from "date-fns";
import { sumHours } from "@/utils/time";

const mockAgenda = [
  { horario: "09:00", cliente: "João" },
  { horario: "10:00", cliente: "Maria" },
  { horario: "13:00", cliente: "Pedro" },
];

let user: IUser;
let api: AxiosInstance;
export default function Panel() {
  const appContext = useContext(AppContext);
  const { colorMode } = useColorMode();
  const animatedComponents = makeAnimated();
  const toast = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [data, setData] = useState([]);
  const [services, setServices] = useState([]);
  const [professionals, setProfessionals] = useState([]);

  const {
    isOpen: formIsOpen,
    onOpen: formOnOpen,
    onClose: formOnClose,
  } = useDisclosure();

  useEffect(() => {
    user = JSON.parse(String(localStorage.getItem("user")));
    api = getAxiosInstance(user);
    getData();
  }, []);

  const onSubmit = async (values: any) => {
    try {
      appContext.onOpenLoading();
      let res: any;

      values.companyId = user.companyId;
      values.professionalId = values.professional.value;
      values.serviceIds = values.services.map((s: any) => s.value);

      delete values.professional;
      delete values.services;

      if (isEditing) res = await api.put(`/api/schedules`, values);
      else res = await api.post(`/api/schedules`, values);

      updateData(res.data);
      appContext.onCloseLoading();
      toast({
        title: "Sucesso!",
        description: "Os dados foram salvos!",
        status: "success",
        position: "top-right",
        duration: 9000,
        isClosable: true,
      });
      setIsEditing(false);
      formOnClose();
    } catch (error: any) {
      toast({
        title: "Houve um erro",
        description: error.Message,
        status: "error",
        position: "top-right",
        duration: 9000,
        isClosable: true,
      });
      appContext.onCloseLoading();
    }
  };

  const schema = Yup.object().shape({
    name: Yup.string().min(2).max(50).required(),
    phone: Yup.string().min(2).required(),
    professional: Yup.object().required(),
    services: Yup.array().min(1).required(),
    date: Yup.string().required(),
    time: Yup.string().min(5).required(),
    duration: Yup.string().min(5).required(),
  });

  // schema
  //   .validate(data)
  //   .then(() => {
  //     console.log("Validação bem-sucedida");
  //   })
  //   .catch((error) => {
  //     console.log(formik.values)
  //     if (error.name === "ValidationError") {
  //       console.log("Erros de validação:", error.errors);
  //     } else {
  //       console.log("Erro desconhecido:", error);
  //     }
  //   });

  const formik = useFormik({
    initialValues: {
      name: "",
      phone: "",
      duration: "",
      professional: {},
      services: [],
      date: new Date(),
      time: "",
    },
    validationSchema: schema,
    onSubmit: onSubmit,
  });

  const getData = async () => {
    try {
      const { data } = await api.get(
        `/api/schedules?companyId=${user.companyId}`
      );

      console.log(data);

      setData(data);

      const { data: professionals } = await api.get(
        `/api/professionals?companyId=${user.companyId}`
      );

      setProfessionals(
        professionals.map((s: any) => {
          s.value = s._id;
          s.label = s.name;
          return s;
        })
      );

      appContext.onCloseLoading();
    } catch (error) {
      console.log(error);

      appContext.onCloseLoading();
    }
  };

  const getServicesPerProfessional = async (professionalId: string) => {
    const professional = professionals.find(
      (p: any) => p.value === professionalId
    );
    if (professional) {
      setServices(
        //@ts-ignore
        professional.serviceIds.map((s) => {
          s.value = s._id;
          s.label = s.name;
          return s;
        })
      );

      formik.setFieldValue("services", undefined);
    }
  };

  const updateData = (item: any) => {
    const indice = data.findIndex((d: any) => d._id === item._id);
    if (indice > -1) {
      const newArray = [...data];
      //@ts-ignore
      newArray[indice] = item;
      setData(newArray);
    } else {
      //@ts-ignore
      setData((prevArray: any) => [...prevArray, item]);
    }
  };

  const getHorariosAgendados = (date: any) => {
    return mockAgenda.filter((item) => isSameDay(date, selectedDate));
  };

  return (
    <Page
      path="/private"
      title="Doupi - Painel Geral"
      description="App para genciamento de agendamentos"
    >
      <Box h={"full"} m={5}>
        <Accordion>
          {data.map((item: any) => (
            <AccordionItem roundedTop={10} key={item._id}>
              <AccordionButton
                _expanded={{ bg: "#3E4D92", color: "white" }}
                roundedTop={10}
              >
                <Box as="span" flex="1" textAlign="left" fontWeight="bold">
                  {item && item.professional && item.professional.name}
                </Box>
                <AccordionIcon />
              </AccordionButton>
              <AccordionPanel
                pb={4}
                backgroundColor="#3e4e9209"
                roundedBottom={10}
              >
                <Box>
                  <Grid templateColumns="repeat(10, 1fr)" gap={4} mt={4}>
                    {item &&
                      item.schedules &&
                      item.schedules.map((schedule: any) => (
                        <GridItem
                          cursor={"pointer"}
                          key={schedule._id}
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
                          <Text fontWeight="bold">{schedule.time}</Text>
                          <Text>
                            {schedule &&
                              schedule.client &&
                              schedule.client.name}
                          </Text>
                        </GridItem>
                      ))}
                  </Grid>
                </Box>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </Box>

      <Box position="fixed" bottom={{ base: "120px", md: "80px" }} right={4}>
        <IconButton
          colorScheme="blue"
          icon={<AddIcon />}
          isRound
          size="lg"
          aria-label="Adicionar"
          onClick={() => {
            formik.resetForm();
            setIsEditing(false);
            setServices([]);
            formOnOpen();
          }}
        />
      </Box>

      <Drawer
        isOpen={formIsOpen}
        placement="right"
        size={"xl"}
        onClose={() => 1}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Agendamento</DrawerHeader>

          <DrawerBody>
            <HStack>
              <FormControl
                mb={3}
                id="name"
                isRequired
                isInvalid={!!formik.errors.name && formik.touched.name}
              >
                <FormLabel>Nome do Cliente</FormLabel>
                <Input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                />
              </FormControl>

              <FormControl
                id="phone"
                isRequired
                isInvalid={!!formik.errors.phone && formik.touched.phone}
              >
                <FormLabel>Telefone </FormLabel>
                <Input
                  name="phone"
                  as={InputMask}
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  mask="(99) 9 9999-9999"
                />
              </FormControl>
            </HStack>

            <HStack>
              <FormControl
                mb={3}
                id="professional"
                isRequired
                //@ts-ignore
                isInvalid={
                  !!formik.errors.professional && formik.touched.professional
                }
              >
                <FormLabel> Profissional </FormLabel>
                <Select
                  name="professional"
                  onBlur={() =>
                    getServicesPerProfessional(
                      //@ts-ignore
                      formik.values.professional.value
                    )
                  }
                  value={formik.values.professional}
                  onChange={(e: any) => formik.setFieldValue("professional", e)}
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  isMulti={false}
                  options={professionals}
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: "transparent",
                    }),
                    menuList: (baseStyles, state) =>
                      colorMode === "dark"
                        ? {
                            ...baseStyles,
                            backgroundColor: "#2D3748",
                          }
                        : {
                            ...baseStyles,
                            backgroundColor: "white",
                          },
                    multiValue: (baseStyles, state) =>
                      colorMode === "dark"
                        ? {
                            ...baseStyles,
                            backgroundColor: "#a09dff",
                            color: "red",
                          }
                        : {
                            ...baseStyles,
                            backgroundColor: "ButtonShadow",
                          },
                  }}
                />
              </FormControl>

              <FormControl
                mb={3}
                id="services"
                isRequired
                //@ts-ignore
                isInvalid={!!formik.errors.services && formik.touched.services}
              >
                <FormLabel> Serviços </FormLabel>
                <Select
                  name="services"
                  value={formik.values.services}
                  onChange={(e: any) => {
                    formik.setFieldValue("services", e);
                    console.log(e);
                  }}
                  onBlur={() => {
                    formik.setFieldValue(
                      "duration",
                      sumHours(
                        formik.values.services.map((s: any) => s.duration)
                      )
                    );
                  }}
                  closeMenuOnSelect={false}
                  components={animatedComponents}
                  isMulti
                  options={services}
                  styles={{
                    control: (baseStyles, state) => ({
                      ...baseStyles,
                      backgroundColor: "transparent",
                    }),
                    menuList: (baseStyles, state) =>
                      colorMode === "dark"
                        ? {
                            ...baseStyles,
                            backgroundColor: "#2D3748",
                          }
                        : {
                            ...baseStyles,
                            backgroundColor: "white",
                          },
                    multiValue: (baseStyles, state) =>
                      colorMode === "dark"
                        ? {
                            ...baseStyles,
                            backgroundColor: "#a09dff",
                            color: "red",
                          }
                        : {
                            ...baseStyles,
                            backgroundColor: "ButtonShadow",
                          },
                  }}
                />
                {formik.values.duration}
              </FormControl>
            </HStack>

            <HStack>
              <FormControl
                mb={3}
                id="date"
                isRequired
                //@ts-ignore
                isInvalid={!!formik.errors.date && formik.touched.date}
              >
                <FormLabel>Data</FormLabel>
                <Input
                  type="date"
                  name="date"
                  //@ts-ignore
                  value={formik.values.date}
                  onChange={formik.handleChange}
                />
              </FormControl>

              <FormControl
                id="time"
                isRequired
                isInvalid={!!formik.errors.time && formik.touched.time}
              >
                <FormLabel>Horário</FormLabel>
                <Input
                  name="time"
                  as={InputMask}
                  value={formik.values.time}
                  onChange={formik.handleChange}
                  mask="99:99"
                />
              </FormControl>
            </HStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                setIsEditing(false);
                formOnClose();
              }}
            >
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              //@ts-ignore
              onClick={formik.handleSubmit}
            >
              Salvar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Page>
  );
}
