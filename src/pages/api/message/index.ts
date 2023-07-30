import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/apiAuth';
import { sendMessage } from '@/services/whatsapp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });
      const body = JSON.parse(JSON.stringify(req.body));
      sendMessage(auth.companyId._id, body.phone, body.message)
      return res.status(200).send('ok');
    }

    else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
