import axios from 'axios';

const urlBase = process.env.NEXT_PUBLIC_API_URL || ''

export const whatsappApiInstance = axios.create({
  baseURL: urlBase
});

