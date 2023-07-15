import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  Text,
  Spinner,
} from '@chakra-ui/react';

export interface IProps {
  isOpen: boolean;
}

export default function LoadingModal({ isOpen }: IProps) {
  return (
    <Modal isCentered isOpen={isOpen} size='xs' onClose={() => ''}>
      <ModalOverlay
        bg='blackAlpha.600'
        backdropFilter='auto'
        backdropInvert='20%'
        backdropBlur='3px'
      />
      <ModalContent>
        <ModalBody textAlign='center'>
          <br />
          <Text fontSize='3xl'> Aguarde </Text>
          <br />
          <Spinner thickness='4px' speed='0.65s' color={'#ffc03f'} size='xl' />
          <br />
          <br />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
