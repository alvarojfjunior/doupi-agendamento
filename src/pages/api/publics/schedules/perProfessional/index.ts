import type { NextApiRequest, NextApiResponse } from 'next';
import { Professional, Schedule } from '../../../../../services/database';
import moment from 'moment';
import mongoose from 'mongoose';
import { getDayOfWeekInPortuguese } from '@/utils/date';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const query = JSON.parse(JSON.stringify(req.query));

      const serviceIds = String(query.serviceIds).split(',').map((s: string) => new mongoose.Types.ObjectId(s))

      const professionals: any = await Professional.find({
        companyId: query.companyId,
        serviceIds: { $in: serviceIds }
      }).lean()


      for (let i = 0; i < professionals.length; i++) {

        const weekDay = getDayOfWeekInPortuguese(
          moment(query.date, 'YYYY-MM-DD').toDate()
        )

        professionals[i].selectedWorkPeriod = professionals[i].defaultSchedule.filter((s: any)=> s.day === weekDay)

        const schedules: any = await Schedule.find({
          professionalId: new mongoose.Types.ObjectId(professionals[i]._id),
          status: 'agendado',
          $expr: {
            $eq: [
              { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
              { $dateToString: { format: '%Y-%m-%d', date: moment(query.date, 'YYYY-MM-DD').toDate() } },
            ],
          },
        }).lean()
        professionals[i].schedules = schedules
      }

      return res.status(200).json(professionals);
    }

    else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
