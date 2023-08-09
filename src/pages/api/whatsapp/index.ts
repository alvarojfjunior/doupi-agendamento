import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '../../../services/database';
import { authenticate } from '@/utils/apiAuth';
import { createDossie } from '@/utils/createDossie';
import { getWhatsappInstance } from '@/services/whatsapp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const { clientId } = JSON.parse(JSON.stringify(req.body));

      if (!clientId) {
        return res.status(500).json({ data: {}, message: 'clientIs is required' });
      }

      const { data: generateTokenRes } = await getWhatsappInstance().post(
        `${process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
        }/api/${clientId}/juninskt11/generate-token`
      );

      return res.status(201).json(generateTokenRes);
    }

    else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
