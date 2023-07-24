import type { NextApiRequest, NextApiResponse } from 'next';
import { Cashier } from '../../../services/database';
import { authenticate } from '@/utils/apiAuth';
import { createDossie } from '@/utils/createDossie';
import moment from 'moment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {

    if (req.method === 'GET') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const query = JSON.parse(JSON.stringify(req.query));

      const result = await Cashier.find({
        companyId: query.companyId,
        date: {
          $gte: moment(query.date, 'YYYY-MM-DD').toDate(),
          $lt: moment(query.date, 'YYYY-MM-DD').add(1, 'day').toDate(),
        }
      }).lean();

      return res.status(200).json(result);
    }


    else if (req.method === 'POST') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const body = JSON.parse(JSON.stringify(req.body));


      const cashier = new Cashier(body);
      await cashier.save();

      createDossie({
        userId: auth._id,
        action: 'new',
        identfier: 'cashier',
      });

      return res.status(201).json(cashier);
    }

    else if (req.method === 'PUT') {
      const auth = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const body = JSON.parse(JSON.stringify(req.body));

      const _id = body._id;
      delete body._id;
      delete body.updatedAt;
      delete body.createdAt;

      const { modifiedCount } = await Cashier.updateOne({ _id }, body).lean();

      await createDossie({
        userId: _id,
        action: 'update',
        identfier: 'cashier',
      });

      if (modifiedCount > 0) {
        const companyRes = await Cashier.findOne({ _id }).lean();
        return res.status(200).json(companyRes);
      } else return res.status(500);
    }


    else if (req.method === 'DELETE') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const query = JSON.parse(JSON.stringify(req.query));

      const result = await Cashier.deleteOne({
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
