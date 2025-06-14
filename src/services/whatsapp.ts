import axios from 'axios';

const whatsappApiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_WHATSAPP_URL,
  headers: {
    'x-api-token': process.env.NEXT_PUBLIC_API_WHATSAPP_TOKEN,
    'Content-Type': 'application/json',
  },
});

export const deleteSessionWhatsappApi = async (sessionId: string) => {
  try {
    const { data } = await whatsappApiInstance.delete(
      `/session/${getFormatedWhatsappNumber(sessionId)}`
    );
    return data;
  } catch (error) {
    console.log(error);
  }
};

export const createSessionWhatsappApi = async (sessionId: string) => {
  const { data } = await whatsappApiInstance.post('/session/create', {
    id: getFormatedWhatsappNumber(sessionId),
  });
  return data;
};

export const getQrCodeSessionWhatsappApi = async (sessionId: string) => {
  try {
    const response = await whatsappApiInstance.get(
      `/session/${getFormatedWhatsappNumber(sessionId)}/qr`,
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
  message: string
) => {
  const { data } = await whatsappApiInstance.post(`/message/send`, {
    sessionId: getFormatedWhatsappNumber(sessionId),
    to: getFormatedWhatsappNumber(to),
    text: message,
  });
  return data;
};

const sendWhatsappMessageUsingLink = (to: string, message: string) => {
  const phone = getFormatedWhatsappNumber(to);
  const text = encodeURIComponent(message); // garante codificação correta  [oai_citation:12‡pureoxygenlabs.com](https://pureoxygenlabs.com/how-to-create-a-whatsapp-deep-link-with-a-pre-populated-message/?utm_source=chatgpt.com)

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
  companyWhatsappNumber = ''
) => {
  if (isUseWhatsappApi && companyWhatsappNumber)
    sendMessageWhatsappApi(companyWhatsappNumber, to, message);
  else sendWhatsappMessageUsingLink(to, message);
};

export function getFormatedWhatsappNumber(str: string) {
  const somenteAlfaNum = str.replace(' 9 ', '').replace(/[^a-zA-Z0-9]/g, '');
  return '55' + somenteAlfaNum;
}
