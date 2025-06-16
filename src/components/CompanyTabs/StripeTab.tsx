import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  VStack,
  Link,
} from '@chakra-ui/react';

interface StripeTabProps {
  formik: any;
}

const StripeTab = ({ formik }: StripeTabProps) => {
  return (
    <VStack spacing={4} align='stretch'>
      <FormControl id='isStripeEnabled'>
        <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
          Usar Stripe para pagamentos
        </FormLabel>
        <Select
          name='isStripeEnabled'
          value={formik.values.isStripeEnabled ? 'true' : 'false'}
          onChange={(e) => {
            formik.setFieldValue(
              'isStripeEnabled',
              e.target.value === 'true'
            );
          }}
        >
          <option value='false'>Não</option>
          <option value='true'>Sim</option>
        </Select>

        {formik.values.isStripeEnabled && (
          <Box marginTop={4}>
            <Text fontSize='sm' mb={4}>
              Configure suas chaves do Stripe para habilitar pagamentos online. Você pode obter suas chaves no
              <Link href='https://dashboard.stripe.com/apikeys' isExternal color='blue.500' ml={1}>
                Dashboard do Stripe
              </Link>
            </Text>
            
            <FormControl
              id='stripePublishableKey'
              isRequired
              isInvalid={
                !!formik.errors.stripePublishableKey && 
                formik.touched.stripePublishableKey
              }
              mt={4}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Chave Publicável do Stripe (STRIPE_PUBLISHABLE_KEY)
              </FormLabel>
              <Input
                name='stripePublishableKey'
                value={formik.values.stripePublishableKey}
                onChange={formik.handleChange}
                placeholder='pk_test_...'
              />
              {formik.errors.stripePublishableKey && formik.touched.stripePublishableKey && (
                <Text color='red.500' fontSize='sm'>
                  {formik.errors.stripePublishableKey}
                </Text>
              )}
            </FormControl>

            <FormControl
              id='stripeSecretKey'
              isRequired
              isInvalid={
                !!formik.errors.stripeSecretKey && 
                formik.touched.stripeSecretKey
              }
              mt={4}
            >
              <FormLabel fontSize={{ base: 'sm', md: 'md', lg: 'md' }}>
                Chave Secreta do Stripe (STRIPE_SECRET_KEY)
              </FormLabel>
              <Input
                name='stripeSecretKey'
                value={formik.values.stripeSecretKey}
                onChange={formik.handleChange}
                placeholder='sk_test_...'
                type='password'
              />
              {formik.errors.stripeSecretKey && formik.touched.stripeSecretKey && (
                <Text color='red.500' fontSize='sm'>
                  {formik.errors.stripeSecretKey}
                </Text>
              )}
            </FormControl>
          </Box>
        )}
      </FormControl>
    </VStack>
  );
};

export default StripeTab;