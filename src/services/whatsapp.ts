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
  
  // Detectar se é um dispositivo móvel
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  
  // Usar diferentes formatos de URL dependendo do dispositivo
  let whatsappUrl = '';
  
  if (isMobile) {
    // Em dispositivos móveis, tente usar o esquema de URL whatsapp://
    // Isso funciona melhor em aplicativos nativos
    whatsappUrl = `whatsapp://send?phone=55${whatsapp}&text=${text}`;
  } else {
    // Em desktop, use o formato wa.me (recomendado pelo WhatsApp)
    whatsappUrl = `https://wa.me/55${whatsapp}?text=${text}`;
  }
  
  // Tente abrir o link, e se falhar (em alguns navegadores iOS), use o wa.me como fallback
  try {
    window.open(whatsappUrl);
  } catch (error) {
    // Fallback para wa.me se o esquema whatsapp:// falhar
    window.open(`https://wa.me/55${whatsapp}?text=${text}`);
  }
};
