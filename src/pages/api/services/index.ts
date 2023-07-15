import type { NextApiRequest, NextApiResponse } from 'next';
import { Service } from '../../../services/database';
import { authenticate } from '@/utils/apiAuth';
import { createDossie } from '@/utils/createDossie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const query = JSON.parse(JSON.stringify(req.query));

      const result = await Service.find({
        ...query,
      }).lean();

      return res.status(200).json(result);
    } else if (req.method === 'POST') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const body = JSON.parse(JSON.stringify(req.body));

      const service = new Service(body);

      await service.save();

      createDossie({
        userId: 'own',
        action: 'new',
        identfier: 'service',
      });

      return res.status(201).json(service);
    } else if (req.method === 'PUT') {
      const auth = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const body = JSON.parse(JSON.stringify(req.body));

      body._v++;

      const _id = body._id;
      delete body._id;
      delete body.updatedAt;
      delete body.createdAt;

      const { modifiedCount } = await Service.updateOne({ _id }, body).lean();

      await createDossie({
        userId: auth._id,
        action: 'update',
        identfier: 'service',
      });

      if (modifiedCount > 0) {
        const serviceRes = await Service.findOne({ _id }).lean();
        return res.status(200).json(serviceRes);
      } else return res.status(500);
    } else if (req.method === 'DELETE') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const query = JSON.parse(JSON.stringify(req.query));

      const result = await Service.deleteOne({
        ...query,
      }).lean();

      return res.status(200).json(result);
    } else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
