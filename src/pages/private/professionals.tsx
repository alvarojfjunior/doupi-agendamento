import {
  Text,
  Box,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tfoot,
  useToast,
  IconButton,
  Stack,
  Heading,
  useDisclosure,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  FormLabel,
  Input,
  Select,
  Textarea,
  DrawerFooter,
  Button,
} from "@chakra-ui/react";
import { useContext, useEffect } from "react";
import { AppContext } from "@/contexts/app";
import { useRouter } from "next/router";
import Page from "@/components/Page";
import { IUser } from "@/types/api/User";
import { AxiosInstance } from "axios";
import { getAxiosInstance } from "@/services/api";
import DeleteConfirmationModal from "../../components/DeleteConfirmationModal";
import { AddIcon, DeleteIcon, EditIcon } from "@chakra-ui/icons";

let user: IUser;
let api: AxiosInstance;
export default function Professionals() {
  const appContext = useContext(AppContext);
  const {
    isOpen: formIsOpen,
    onOpen: formOnOpen,
    onClose: formOnClose,
  } = useDisclosure();
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    user = JSON.parse(String(localStorage.getItem("user")));
    api = getAxiosInstance(user);
    appContext.onCloseLoading();
  }, []);

  const handleDelete = () => {
    // Lógica para excluir o registro
    console.log("Registro excluído!");
  };

  return (
    <Page
      path="/professional"
      title="Doupi - Cadastro de profissionais"
      description="App para genciamento de agendamentos"
    >
      <Stack h={"full"} m={5}>
        <Heading mb={5} fontSize={"2xl"} textAlign={"center"}>
          Cadastro de Profissionais
        </Heading>
        <TableContainer border={"1px solid #ededed"} rounded={20}>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th width={50}>Opções</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>Álvaro</Td>
                <Td>
                  <IconButton
                    size={"sm"}
                    icon={<EditIcon />}
                    colorScheme="blue"
                    aria-label="Editar"
                    mr={1}
                    onClick={formOnOpen}
                  />
                  <DeleteConfirmationModal onDelete={handleDelete} />
                </Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <Box position="fixed" bottom={{ base: "120px", md: "80px" }} right={4}>
          <IconButton
            icon={<AddIcon />}
            isRound
            size="lg"
            aria-label="Adicionar"
            onClick={formOnOpen}
          />
        </Box>
      </Stack>

      <Drawer isOpen={formIsOpen} placement="right" onClose={formOnClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Profissional</DrawerHeader>

          <DrawerBody>
            <Stack spacing="24px">
              <Box>
                <FormLabel htmlFor="username">Nome</FormLabel>
                <Input id="username" placeholder="Nome do profissional" />
              </Box>

              <Box>
                <FormLabel htmlFor="owner">Tipos de Serviço</FormLabel>
                <Select id="owner" defaultValue="segun">
                  <option value="segun">Barbearia</option>
                  <option value="kola">Massagem</option>
                </Select>
              </Box>

              <Box>
                <FormLabel htmlFor="desc">Descrição</FormLabel>
                <Textarea id="desc" />
              </Box>
            </Stack>
          </DrawerBody>

          <DrawerFooter borderTopWidth="1px">
            <Button variant="outline" mr={3} onClick={formOnClose}>
              Cancel
            </Button>
            <Button colorScheme="blue">Submit</Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Page>
  );
}
