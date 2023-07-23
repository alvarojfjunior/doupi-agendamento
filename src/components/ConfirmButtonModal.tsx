import { useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  useDisclosure,
} from '@chakra-ui/react';

export default function ConfirmButtonModal({ onDelete, value, colorScheme }: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <>
      <Button w={'full'} colorScheme={colorScheme} onClick={onOpen}>
        {value}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Deseja confirmar esta ação?</ModalHeader>
          <ModalBody>Tem certeza de que deseja confirmar esta ação?</ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme='red' ml={3} onClick={handleDelete}>
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
