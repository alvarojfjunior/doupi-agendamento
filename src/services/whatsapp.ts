export const sendWhatsappMessage = async (
  to: string,
  message: string
) => {
  const text = encodeURIComponent(message);
  const whatsapp = String(to)
    .replaceAll(' ', '')
    .replaceAll('(', '')
    .replaceAll(')', '')
    .replaceAll('-', '');
  window.open(`https://api.whatsapp.com/send?phone=55${whatsapp}&text=${text}`);
};
