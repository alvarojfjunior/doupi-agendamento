import type { NextApiRequest, NextApiResponse } from 'next';
import { Schedule } from '../../../../services/database';
import { authenticate } from '@/utils/apiAuth';
import mongoose from 'mongoose';
import moment from 'moment'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const query = JSON.parse(JSON.stringify(req.query));


    let schedules = await Schedule.aggregate([
      {
        $addFields: {
          newDate: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$date',
            },
          },
        },
      },
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(query.companyId),
          newDate: moment(query.date, 'YYYY-MM-DD').format('YYYY-MM-DD'),
        },
      },
      {
        $lookup: {
          from: 'services',
          let: { serviceIds: '$serviceIds' },
          pipeline: [
            {
              $match: {
                $expr: { $in: ['$_id', '$$serviceIds'] },
              },
            },
          ],
          as: 'services',
        },
      },
      {
        $lookup: {
          from: 'professionals',
          localField: 'professionalId',
          foreignField: '_id',
          as: 'professional',
        },
      },
      {
        $unwind: '$professional',
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'clientID',
          foreignField: '_id',
          as: 'client',
        },
      },
      {
        $unwind: '$client',
      },
      {
        $group: {
          _id: '$professionalId',
          schedules: { $push: '$$ROOT' },
        },
      },
    ]);

    schedules = schedules.map((s: any) => {
      const newArr: any = {};
      newArr.professional = s.schedules[0].professional;
      newArr.schedules = s.schedules;
      return newArr;
    });

      return res.status(200).json(schedules);
    } else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
