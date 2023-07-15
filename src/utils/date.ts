export const formatDateForDb = (dt: Date) => {
  const date = new Date(dt);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
  const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;
  return formattedDate;
};

export const formatDateForUser = (data: string) => {
  const dataObj = new Date(data);
  const dia = String(dataObj.getDate()).padStart(2, '0');
  const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
  const ano = dataObj.getFullYear();
  const hora = String(dataObj.getHours()).padStart(2, '0');
  const minuto = String(dataObj.getMinutes()).padStart(2, '0');

  const dataFormatada = `${dia}/${mes}/${ano} ${hora}:${minuto}`;
  return dataFormatada;
};
