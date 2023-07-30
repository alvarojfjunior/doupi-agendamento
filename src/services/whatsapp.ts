import axios from "axios";

export const sendMessage = async (companyId: string, to: string, message: string) => {
  try {
    const phone = '55' + String(to).replaceAll('(', '').replaceAll(')', '').replaceAll(' ', '').replace('-', '')
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API}/message/text?key=${companyId}`,
      { id: phone, message: message }
    );
    return data
  } catch (error: any) {
    console.log('Houve um erro ao enviar a mensagem', error.message)
  }
}

export const restoreAllInstances = async () => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API}/instance/restore`
    );
    return data
  } catch (error: any) {
    console.log('Houve um erro no restore all instances', error.message)
  }
}




