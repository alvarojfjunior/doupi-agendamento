import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
  Image,
} from '@chakra-ui/react';
import InputMask from 'react-input-mask';

interface WhatsappTabProps {
  formik: any;
  isWhatsappApiConnected: boolean | undefined;
  whatsappQrCode: string | undefined;
  handleTestWhatsappConnection: () => Promise<void>;
  handleReconnectWhatsappConnection: () => Promise<void>;
}

const WhatsappTab = ({
  formik,
  isWhatsappApiConnected,
  whatsappQrCode,
  handleTestWhatsappConnection,
  handleReconnectWhatsappConnection,
}: WhatsappTabProps) => {
  return (
    <VStack spacing={4} align='stretch'>
      <FormControl id='isWhatsappApi'>
        <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
          Usar API do WhatsApp
        </FormLabel>
        <Select
          name='isWhatsappApi'
          value={formik.values.isWhatsappApi ? 'true' : 'false'}
          onChange={(e) => {
            formik.setFieldValue(
              'isWhatsappApi',
              e.target.value === 'true'
            );
          }}
        >
          <option value='false'>Não</option>
          <option value='true'>Sim</option>
        </Select>

        {formik.values.isWhatsappApi && (
          <Box>
            <FormControl
              id='phone'
              isRequired
              isInvalid={!!formik.errors.phone && formik.touched.phone}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Telefone (whatsapp){' '}
              </FormLabel>
              <Input
                name='phone'
                as={InputMask}
                value={formik.values.phone}
                onChange={formik.handleChange}
                mask='(99) 9 9999-9999'
              />
            </FormControl>
            <Box marginBlock={5} p={5} border={'1px solid #E2E8F0'}>
              {isWhatsappApiConnected ? (
                <Text textAlign={'center'}>
                  {' '}
                  API de whatsapp está conectada{' '}
                </Text>
              ) : (
                <Box>
                  <Box display={'flex'} justifyContent={'center'} gap={5}>
                    <Button onClick={handleTestWhatsappConnection}>
                      {' '}
                      Testar Conexão{' '}
                    </Button>
                    {isWhatsappApiConnected !== undefined && (
                      <Button onClick={handleReconnectWhatsappConnection}>
                        {' '}
                        Reconectar (qr code){' '}
                      </Button>
                    )}
                  </Box>
                  {whatsappQrCode && (
                    <Box
                      w={'full'}
                      display={'flex'}
                      justifyContent={'center'}
                    >
                      <Image src={whatsappQrCode} alt='qrcode' />
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          </Box>
        )}
      </FormControl>
    </VStack>
  );
};

export default WhatsappTab;