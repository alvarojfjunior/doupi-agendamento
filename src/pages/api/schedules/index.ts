import type { NextApiRequest, NextApiResponse } from 'next';
import { Client, Schedule } from '../../../services/database';
import { authenticate } from '@/utils/apiAuth';
import { createDossie } from '@/utils/createDossie';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const query = JSON.parse(JSON.stringify(req.query));

      const data = await Schedule.aggregate([
        {
          $addFields: {
            day: {
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
            query
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
        }
      ]);

      return res.status(200).json(data);
    }


    else if (req.method === 'POST') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const body = JSON.parse(JSON.stringify(req.body));

      const clienteData = {
        companyId: body.companyId,
        name: body.name,
        phone: body.phone,
      };

      let client;

      const isClientExist = await Client.findOne({
        companyId: body.companyId,
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

      //@ts-ignore
      body.clientID = client._id;

      const schedule = new Schedule(body);

      await schedule.save();

      createDossie({
        userId: auth._id,
        action: 'new',
        identfier: 'schedule',
      });

      return res.status(201).json(schedule);
    }



    else if (req.method === 'PUT') {
      const auth = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const body = JSON.parse(JSON.stringify(req.body));

      body._v++;

      const _id = body._id;
      delete body._id;
      delete body.updatedAt;
      delete body.createdAt;

      const { modifiedCount } = await Schedule.updateOne({ _id }, body).lean();

      await createDossie({
        userId: auth._id,
        action: 'update',
        identfier: 'schedule',
      });

      if (modifiedCount > 0) {
        const scheduleRes = await Schedule.findOne({ _id }).lean();
        return res.status(200).json(scheduleRes);
      } else return res.status(500);
    } else if (req.method === 'DELETE') {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const query = JSON.parse(JSON.stringify(req.query));

      const result = await Schedule.deleteOne({
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
