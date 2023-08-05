import type { NextApiRequest, NextApiResponse } from 'next';
import { Client } from '../../../services/database';
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

      const result = await Client.find({
        ...query,
      }).lean();

      return res.status(200).json(result);
    }


    else if (req.method === 'POST') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const body = JSON.parse(JSON.stringify(req.body));


      let client: any;

      const clienteData = {
        companyId: auth.companyId,
        name: body.name,
        phone: body.phone,
      };

      const isClientExist = await Client.findOne({
        companyId: auth.companyId,
        phone: body.phone,
      }).lean();

      if (isClientExist) {
        client = await Client.findByIdAndUpdate(
          isClientExist._id,
          clienteData,
          { new: true }
        ).lean();
      } else {
        client = new Client(clienteData);
        await client.save();
      }

      createDossie({
        userId: auth._id,
        action: 'new',
        identfier: 'client',
      });

      return res.status(201).json(client);
    }

    else if (req.method === 'PUT') {
      const auth = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const body = JSON.parse(JSON.stringify(req.body));

      const _id = body._id;
      delete body._id;
      delete body.updatedAt;
      delete body.createdAt;

      const { modifiedCount } = await Client.updateOne({ _id }, body).lean();

      await createDossie({
        userId: _id,
        action: 'update',
        identfier: 'client',
      });

      if (modifiedCount > 0) {
        const companyRes = await Client.findOne({ _id }).lean();
        return res.status(200).json(companyRes);
      } else return res.status(500);
    }


    else if (req.method === 'DELETE') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const query = JSON.parse(JSON.stringify(req.query));

      const result = await Client.deleteOne({
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
