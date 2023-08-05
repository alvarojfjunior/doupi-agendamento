import type { NextApiRequest, NextApiResponse } from 'next';
import { Schedule } from '../../../services/database';
import { authenticate } from '@/utils/apiAuth';
import mongoose from 'mongoose';
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

      const result = await Schedule.aggregate([
        {
          $match: {
            companyId: new mongoose.Types.ObjectId(query.companyId),
            createdAt: {
              $gte: moment(query.dtBegin, 'YYYY-MM-DD').toDate(),
              $lt: moment(query.dtEnd, 'YYYY-MM-DD').add(1, 'day').toDate()
            },
          },
        },
        {
          $group: {
            _id: '$status',
            total: { $sum: 1 },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]);

      return res.status(200).json(result);
    }


    else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
