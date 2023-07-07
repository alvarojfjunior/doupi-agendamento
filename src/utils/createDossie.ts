import { Dossie } from "@/services/database";

interface INewDossie {
  userId: string; 
  action: string;
  identfier: string;
}

export async function createDossie(param: INewDossie) {
  try {
    const dossie = new Dossie(param);
    await dossie.save(); 
  } catch (error) {
    console.log(error)
  }
}
