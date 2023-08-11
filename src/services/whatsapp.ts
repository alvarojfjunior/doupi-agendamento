import { IUser } from '@/types/api/User';
import { transformPhoneNumber } from '@/utils/general';
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


export const frontendSendMessage = async (user: any, to: string, message: string, toast: any, appContext: any) => {
  console.log('HEERE', user.whatsappToken, user.isWhatsappService)
  try {
    if (appContext)
      appContext.onOpenLoading();


    if (user.isWhatsappService) {
      const { data: messageRes } = await getWhatsappInstance(user.whatsappToken).post(
        `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(user.companyWhatsapp || user.whatsapp)}/send-message`,
        {
          phone: transformPhoneNumber(to),
          isGroup: false,
          message,
        }
      );
      console.log(messageRes)
      if (toast)
        toast({
          title: 'Mensagem enviada!',
          status: 'success',
          position: 'top-right',
          duration: 6000,
          isClosable: true,
        });
      return true
    }


    else {
      const text = encodeURIComponent(message);
      const whatsapp = String(to)
        .replaceAll(' ', '')
        .replaceAll('(', '')
        .replaceAll(')', '')
        .replaceAll('-', '');
      window.open(
        `https://api.whatsapp.com/send?phone=55${whatsapp}&text=${text}`
      );
    }
  } catch (error) {
    console.log(error)
    if (toast)
      toast({
        title: 'Houve um problema ao enviar a mensagem pelo serviço de whatsapp!',
        description: 'Verifique a conexão com o serviço de whatsapp',
        status: 'error',
        position: 'top-right',
        duration: 6000,
        isClosable: true,
      });

    const text = encodeURIComponent(message);
    const whatsapp = String(to)
      .replaceAll(' ', '')
      .replaceAll('(', '')
      .replaceAll(')', '')
      .replaceAll('-', '');
    window.open(
      `https://api.whatsapp.com/send?phone=55${whatsapp}&text=${text}`
    );
    return false
  } finally {
    if (appContext)
      appContext.onCloseLoading();
  }
};
