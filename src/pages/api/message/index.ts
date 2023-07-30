import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticate } from '@/utils/apiAuth';
import { restoreAllInstances, sendMessage } from '@/services/whatsapp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const whatsappRes = await restoreAllInstances()

      if (whatsappRes && !whatsappRes.error) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        return res.status(200).json(whatsappRes);
      } else
        return res.status(500).json(whatsappRes);
    }

    else if (req.method === 'POST') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });
      const body = JSON.parse(JSON.stringify(req.body));


      const messageRes = await sendMessage(auth.companyId._id, body.phone, body.message)
      if (messageRes && !messageRes.error)
        return res.status(200).json(messageRes);
      else
        return res.status(500).json(messageRes);
    }

    else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ data: error, message: error.message });
  }
}
