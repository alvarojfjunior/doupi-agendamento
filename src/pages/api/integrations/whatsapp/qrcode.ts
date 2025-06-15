import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { authenticate } from '@/utils/apiAuth';
import { getFormatedWhatsappNumber } from '@/services/whatsapp';

const whatsappApiInstance = axios.create({
  baseURL: process.env.API_WHATSAPP_URL,
  headers: {
    'x-api-token': process.env.API_WHATSAPP_TOKEN,
    'Content-Type': 'application/json',
  },
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const auth: any = authenticate(req);
    if (!auth) return res.status(401).json({ message: 'Unauthorized' });

    if (req.method === 'GET') {
      const { sessionId } = req.query;
      
      if (!sessionId) {
        return res.status(400).json({ message: 'Session ID is required' });
      }

      const response = await whatsappApiInstance.get(
        `/session/${getFormatedWhatsappNumber(sessionId as string)}/qr`,
        {
          responseType: 'blob',
        }
      );

      // Encaminhar o blob diretamente para o cliente
      res.setHeader('Content-Type', response.headers['content-type']);
      return res.send(response.data);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('WhatsApp API error:', error.message);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}