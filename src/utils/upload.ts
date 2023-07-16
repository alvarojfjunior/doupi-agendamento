import axios from "axios";

//CLOUD NAME = dovvizyxg
//API SECRET = 6B0yUi53AguKw7BpYvdWvOKXugY
//API KEY = 655772814277416
//api base url = CLOUDINARY_URL=cloudinary://655772814277416:6B0yUi53AguKw7BpYvdWvOKXugY@dovvizyxg

export const handleImageImageAndUpload = async (event: any, callback: Function) => {
  const file = await compactImage(event.target.files[0]);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'cmh3szwf');
  try {
    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/dovvizyxg/image/upload`,
      formData
    );
    console.log('HEERE', data.url)
    callback(data.secure_url)
  } catch (error) {
    console.log(error);
  }
};


async function compactImage(imagem: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (event:any) {
      const img = new Image();

      img.onload = function () {
        const canvas = document.createElement('canvas');
        const ctx:any = canvas.getContext('2d');
        const quality = 0.4; // qualidade de compressão (80%)

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

