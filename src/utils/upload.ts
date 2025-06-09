import axios from "axios";

export const handleImageImageAndUpload = async (event: any, quality: number, callback: Function) => {
  // Validar o arquivo antes de processar
  const file = event.target.files[0];
  
  // Verificar se é uma imagem
  if (!file.type.startsWith('image/')) {
    console.error('O arquivo não é uma imagem');
    return;
  }
  
  // Verificar o tamanho (limitar a 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    console.error('O arquivo é muito grande (máximo 5MB)');
    return;
  }
  
  // Verificar extensões permitidas
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
  const fileExtension = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(fileExtension)) {
    console.error('Extensão de arquivo não permitida');
    return;
  }
  
  const compressedFile = await compactImage(file, quality);

  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('upload_preset', 'cmh3szwf');
  try {
    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/dovvizyxg/image/upload`,
      formData
    );
    callback(data.secure_url);
  } catch (error) {
    console.log(error);
  }
};


async function compactImage(imagem: File, percent: number): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event:any) {
      const img = new Image();

      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx:any = canvas.getContext('2d');
        const quality = 0.4;

        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          function (blob:any) {
            const arquivoComprimido = new File([blob], imagem.name, { type: blob.type });
            resolve(arquivoComprimido);
          },
          imagem.type,
          quality
        );
      };

      img.onerror = function (error) {
        reject(error);
      };


      img.src = event.target.result;
    };

    reader.onerror = function (error) {
      reject(error);
    };

    reader.readAsDataURL(imagem);
  });
}

