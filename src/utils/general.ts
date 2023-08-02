export const getAverage = (array: string[]): number => {
  if (array.length === 0) {
    return 0;
  }
  let soma = 0;
  for (let i = 0; i < array.length; i++) {
    soma += parseFloat(array[i]);
  }
  const media = soma / array.length;
  return media;
};


export const transformPhoneNumber = (phoneNumber: string): string => {
  const numericString = phoneNumber.replace(/\D/g, '');
  const firstPart = numericString.substring(0, 2);
  const lastPart = numericString.substring(3);
  return '55' + firstPart + lastPart
}
