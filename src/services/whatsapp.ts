import axios from 'axios';

export const getWhatsappInstance = (whatsappToken?: string) => {
  const url = process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API;
  try {
    if (whatsappToken) {
      return axios.create({
        baseURL: url,
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          'Content-Type': 'application/json',
        },
      });
    } else {
      return axios.create({
        baseURL: url,
      });
    }
  } catch (error) {
    return axios.create({
      baseURL: url,
    });
  }
};
