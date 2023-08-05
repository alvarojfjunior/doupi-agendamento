import { Input } from '@chakra-ui/react';
import { useField } from 'formik';
import InputMask from 'react-input-mask';

export const PhoneInput = ({ props, ...rest }: any) => {
  const [field, meta] = useField(props);

  return (
    <InputMask
      {...field}
      {...props}
      mask={'(99) 9 9999-9999'}
      maskChar={' '}
      {...rest}
    >
      {(inputProps: any) => <Input {...inputProps} />}
    </InputMask>
  );
};
