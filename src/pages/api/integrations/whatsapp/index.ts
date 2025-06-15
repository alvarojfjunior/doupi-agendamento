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

    if (req.method === 'POST') {
      const { sessionId, to, text } = req.body;

      if (!sessionId || !to || !text) {
        return res.status(400).json({ message: 'Missing required parameters' });
      }
      try {
        await whatsappApiInstance.post(`/message/send`, {
          sessionId: getFormatedWhatsappNumber(sessionId),
          to: getFormatedWhatsappNumber(to),
          text,
        });
        return res.status(200).json({ message: "ok" });
      } catch (error: any) {
        return res
          .status(500)
          .json({ message: error.response.data || error.message });
      }
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error: any) {
    console.error('WhatsApp API error:', error.message);
    return res
      .status(500)
      .json({ message: 'Internal server error', error: error.message });
  }
}
