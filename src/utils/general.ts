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


export const objetoTemConteudo = (objeto) => {
  for (const key in objeto) {
    if (objeto.hasOwnProperty(key)) {
      return true;
    }
  }
  return false;
}
