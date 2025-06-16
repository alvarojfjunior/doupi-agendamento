import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Select,
  HStack,
  Image as ChakraImage,
  Link,
} from '@chakra-ui/react';
import InputColor from 'react-input-color';
import InputMask from 'react-input-mask';
import { handleImageImageAndUpload } from '@/utils/upload';

interface GeneralInfoTabProps {
  formik: any;
}

const GeneralInfoTab = ({ formik }: GeneralInfoTabProps) => {
  return (
    <Box>
      <Box mb={5}>
        <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
          Link de agendamento
        </FormLabel>
        <Link href={`/d/${formik.values.name.replaceAll(' ', '-')}`}>
          {' '}
          {process.env.NEXT_PUBLIC_API_URL}/d/
          {formik.values.name.replaceAll(' ', '-')}{' '}
        </Link>
      </Box>
      <VStack spacing={4} align='stretch'>
        <FormControl
          id='coverImage'
          isRequired
          isInvalid={
            !!formik.errors.coverImage && formik.touched.coverImage
          }
        >
          <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
            Imagem de Capa
          </FormLabel>
          <Box
            position='relative'
            display='inline-block'
            width={'100%'}
            height={250}
            overflow='hidden'
            justifyContent='center'
            alignItems='center'
          >
            <ChakraImage
              src={formik.values.coverImage}
              alt='Imagem de Capa'
              mb={2}
              rounded={10}
              style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
              }}
            />
            <Input
              type='file'
              accept='image/*'
              name='coverPreview'
              onChange={(event) =>
                handleImageImageAndUpload(event, 0.3, (url: string) =>
                  formik.setFieldValue('coverImage', url)
                )
              }
              position='absolute'
              top={0}
              left={0}
              opacity={0}
              width='100%'
              height='100%'
              cursor='pointer'
              zIndex={1}
              required={false}
            />
          </Box>
        </FormControl>

        <FormControl
          id='color'
          isRequired
          isInvalid={!!formik.errors.color && formik.touched.color}
        >
          <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
            Cor tema
          </FormLabel>
          <InputColor
            placement='left'
            //@ts-ignore
            style={{
              width: '100%',
              height: 70,
            }}
            initialValue={formik.values.color}
            onChange={(e: any) =>
              formik.setFieldValue('color', e.hex)
            }
          />
        </FormControl>

        <HStack>
          <FormControl
            id='name'
            isRequired
            isInvalid={!!formik.errors.name && formik.touched.name}
          >
            <FormLabel>Nome da empresa</FormLabel>
            <Input
              type='text'
              name='name'
              value={formik.values.name}
              onChange={formik.handleChange}
            />
          </FormControl>

          <FormControl
            id='responsableName'
            isRequired
            isInvalid={
              !!formik.errors.responsableName &&
              formik.touched.responsableName
            }
          >
            <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
              Nome do responsável
            </FormLabel>
            <Input
              type='text'
              name='responsableName'
              value={formik.values.responsableName}
              onChange={formik.handleChange}
            />
          </FormControl>
        </HStack>
        <HStack>
          <FormControl
            id='businessType'
            isRequired
            isInvalid={
              !!formik.errors.businessType &&
              formik.touched.businessType
            }
          >
            <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
              Ramo da empresa
            </FormLabel>
            <Select
              name='businessType'
              id='businessType'
              value={formik.values.businessType}
              onChange={formik.handleChange}
            >
              <option value='Beleza'>Beleza</option>
              <option value='Beleza'>Estética</option>
              <option value='Saúde'>Saúde</option>
            </Select>
          </FormControl>

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
        </HStack>

        <HStack>
          <FormControl
            id='email'
            isRequired
            isInvalid={!!formik.errors.email && formik.touched.email}
          >
            <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
              {' '}
              Email{' '}
            </FormLabel>
            <Input
              type='email'
              name='email'
              value={formik.values.email}
              onChange={formik.handleChange}
            />
          </FormControl>
        </HStack>
      </VStack>
    </Box>
  );
};

export default GeneralInfoTab;