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


export const startSession = async (user: any) => {
  let isConnected = false

  for (let i = 0; i <= 5; i++) {
    try {
      const { data: startRes } = await getWhatsappInstance(user.whatsappToken).post(
        `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${transformPhoneNumber(user.companyWhatsapp || user.whatsapp)}/start-session`,
        {}
      );

      if (startRes.status === 'CONNECTED') {
        await new Promise((resolve) =>
          setTimeout(() => resolve(null), 10000)
        );
        isConnected = true
        break
      } else {
        isConnected = false
        await new Promise((resolve) =>
          setTimeout(() => resolve(null), 10000)
        );
      }
    } catch (error) {
      isConnected = false
    }
  }


  return isConnected
}


export const frontendSendMessage = async (user: any, to: string, message: string, toast: any, appContext: any) => {
  try {
    if (appContext)
      appContext.onOpenLoading();

    if (user.isWhatsappService) {
      let isSentMessage = false
      try {
        await getWhatsappInstance(user.whatsappToken).post(
          `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
          }/api/${transformPhoneNumber(user.companyWhatsapp || user.whatsapp)}/send-message`,
          {
            phone: transformPhoneNumber(to),
            isGroup: false,
            message,
          }
        );
        isSentMessage = true
      } catch (error: any) {
        if (error && error.response && error.response.data && error.response.data.status && error.response.data.status === 'Disconnected') {
          for (let i = 0; i <= 5; i++) {
            const { data: startRes } = await getWhatsappInstance(user.whatsappToken).post(
              `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
              }/api/${transformPhoneNumber(user.companyWhatsapp || user.whatsapp)}/start-session`,
              {}
            );

            if (startRes.status === 'CONNECTED') {
              await new Promise((resolve) =>
                setTimeout(() => resolve(null), 10000)
              );
              await getWhatsappInstance(user.whatsappToken).post(
                `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
                }/api/${transformPhoneNumber(user.companyWhatsapp || user.whatsapp)}/send-message`,
                {
                  phone: transformPhoneNumber(to),
                  isGroup: false,
                  message,
                }
              );

              isSentMessage = true
              break
            } else {
              isSentMessage = false
              await new Promise((resolve) =>
                setTimeout(() => resolve(null), 10000)
              );
            }
          }
        } else {
          isSentMessage = false
        }
      }

      if (isSentMessage) {
        if (toast)
          toast({
            title: 'Mensagem enviada!',
            status: 'success',
            position: 'top-right',
            duration: 6000,
            isClosable: true,
          });
      } else {
        toast({
          title: 'Houve um erro ao enviar message.',
          status: 'error',
          position: 'top-right',
          duration: 6000,
          isClosable: true,
        });
      }
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
    getWhatsappInstance(user.whatsappToken).post(
      `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
      }/api/${transformPhoneNumber(user.companyWhatsapp || user.whatsapp)}/close-session`,
      {}
    );
    if (appContext)
      appContext.onCloseLoading();
  }
};
