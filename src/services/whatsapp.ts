import axios from "axios";

export const sendMessage = async (companyId: string, to: string, message: string) => {
  try {
    const phone = '55' + String(to).replaceAll('(', '').replaceAll(')', '').replaceAll(' ', '').replace('-', '')
    const { data } = await axios.post(
      `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API}/message/text?key=${companyId}`,
      { id: phone, message: message }
    );

  } catch (error) {
    console.log('Houve um erro ao enviar a mensagem', error)
  }
}
