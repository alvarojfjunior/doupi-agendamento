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
  IconButton,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';

export default function DeleteConfirmationModal({ onDelete }: any) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <>
      <IconButton
        size={'sm'}
        icon={<DeleteIcon />}
        colorScheme='red'
        aria-label='Apagar'
        onClick={onOpen}
      />

      <Modal isCentered isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar exclusão</ModalHeader>
          <ModalBody>
            Tem certeza de que deseja excluir este registro?
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' onClick={onClose}>
              Cancelar
            </Button>
            <Button colorScheme='red' ml={3} onClick={handleDelete}>
              Excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
