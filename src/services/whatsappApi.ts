import axios from 'axios';
import https from 'https';

const httpsAgent = new https.Agent({
  rejectUnauthorized: false
});

const urlBase = process.env.NEXT_PUBLIC_API_URL || ''

export const whatsappApiInstance = axios.create({
  baseURL: urlBase,
  httpsAgent
});

