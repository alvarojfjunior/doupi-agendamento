import { getApiInstance } from './api';

export const deleteSessionWhatsappApi = async (sessionId: string, user: any) => {
  try {
    const apiInstance = getApiInstance(user);
    const { data } = await apiInstance.delete(
      `/api/integrations/whatsapp/session?sessionId=${getFormatedWhatsappNumber(sessionId)}`
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const createSessionWhatsappApi = async (sessionId: string, user: any) => {
  const apiInstance = getApiInstance(user);
  const { data } = await apiInstance.post('/api/integrations/whatsapp/session', {
    sessionId: getFormatedWhatsappNumber(sessionId),
  });
  return data;
};

export const getQrCodeSessionWhatsappApi = async (sessionId: string, user: any) => {
  try {
    const apiInstance = getApiInstance(user);
    const response = await apiInstance.get(
      `/api/integrations/whatsapp/qrcode?sessionId=${getFormatedWhatsappNumber(sessionId)}`,
      {
        responseType: 'blob',
      }
    );
    const imageBlob = response.data;
    const imageUrl = URL.createObjectURL(imageBlob);
    return imageUrl;
  } catch (error) {
    return undefined;
  }
};

export const sendMessageWhatsappApi = async (
  sessionId: string,
  to: string,
  message: string,
  user: any
) => {
  const apiInstance = getApiInstance(user);
  const { data } = await apiInstance.post(`/api/integrations/whatsapp`, {
    sessionId: getFormatedWhatsappNumber(sessionId),
    to: getFormatedWhatsappNumber(to),
    text: message,
  });
  return data;
};

const sendWhatsappMessageUsingLink = (to: string, message: string) => {
  const phone = getFormatedWhatsappNumber(to);
  const text = encodeURIComponent(message);

  // Links
  const schemeLink = `whatsapp://send?phone=55${phone}&text=${text}`;
  const universalLink = `https://wa.me/55${phone}?text=${text}`;

  // Inserir iframe para acionar o esquema nativo
  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = schemeLink;
  document.body.appendChild(iframe);

  // Após 1.2s, redirecionar para o deep link universal (fallback)
  const timeoutId = window.setTimeout(() => {
    window.location.href = universalLink;
  }, 1200);

  // Limpar iframe e timeout se o usuário deixar a página (app abriu)
  window.addEventListener('pagehide', () => {
    clearTimeout(timeoutId);
    document.body.removeChild(iframe);
  });
};

export const sendWhatsappMessage = (
  to: string,
  message: string,
  isUseWhatsappApi = false,
  companyWhatsappNumber = '',
  user?: any
) => {
  if (isUseWhatsappApi && companyWhatsappNumber && user)
    sendMessageWhatsappApi(companyWhatsappNumber, to, message, user);
  else sendWhatsappMessageUsingLink(to, message);
};

export function getFormatedWhatsappNumber(str: string) {
  const somenteAlfaNum = str.replace(' 9 ', '').replace(/[^a-zA-Z0-9]/g, '');
  
  // Verifica se o número já começa com '55'
  if (somenteAlfaNum.startsWith('55')) {
    return somenteAlfaNum;
  } else {
    return '55' + somenteAlfaNum;
  }
}
