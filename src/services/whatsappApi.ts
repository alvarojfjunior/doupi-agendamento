import fetch from 'isomorphic-fetch';


const baseUrl = process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API;

export const whatsappApiFetch = async (url: string, method = 'GET', data: any = null) => {
  try {
    const options: any = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(`${baseUrl}/${url}`, options);
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Erro na requisição:', error);
    throw error;
  }
};
