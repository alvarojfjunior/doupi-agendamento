import type { NextApiRequest, NextApiResponse } from 'next';
import { Client, Schedule } from '../../../../services/database';
import moment from 'moment';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
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

      // createDossie({
      //   userId: auth._id,
      //   action: 'new',
      //   identfier: 'schedule',
      // });

      return res.status(201).json(schedule);
    }


    else if (req.method === 'PUT') {
      const body = JSON.parse(JSON.stringify(req.body));

      body._v++;

      const _id = body._id;
      delete body._id;
      delete body.updatedAt;
      delete body.createdAt;

      const { modifiedCount } = await Schedule.updateOne({ _id }, body).lean();

      // await createDossie({
      //   userId: auth._id,
      //   action: 'update',
      //   identfier: 'schedule',
      // });

      if (modifiedCount > 0) {
        const scheduleRes = await Schedule.findOne({ _id }).lean();
        return res.status(200).json(scheduleRes);
      } else return res.status(500);
    }

    else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
