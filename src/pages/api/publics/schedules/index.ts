import type { NextApiRequest, NextApiResponse } from 'next';
import { Client, Schedule } from '../../../../services/database';
import { sendMessage } from '@/services/whatsapp';
import moment from 'moment';
import { getScheduleNotification } from '@/utils/notificarions';

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

      const message = getScheduleNotification(
        schedule._id,
        body.name,
        body.professionalName,
        body.companyName,
        body.serviceNames,
        moment(body.date, 'YYYY-MM-DD').format('DD/MM/YYYY'),
        body.time
      );


      sendMessage(body.companyId, body.phone, message)

      return res.status(201).json(schedule);
    }


    else if (req.method === 'PUT') {
      const body = JSON.parse(JSON.stringify(req.body));

      body._v++;

      const _id = body._id;
      delete body._id;
      delete body.updatedAt;
      delete body.createdAt;

      const schedule: any = await Schedule.findOneAndUpdate({ _id }, body).populate({
        path: 'clientID',
        select: 'name phone',
      }).populate({
        path: 'companyId',
        select: 'whatsapp',
      }).lean();

      let message = `${schedule.clientID.name} acabou de *cancelar um agendamento*. \n\n`;
      message += `Agendamento: ${moment(schedule.date, 'YYYY-MM-DD').format(
        'DD/MM/YYYY'
      )} às ${schedule.time}`;

      sendMessage(schedule.companyId._id, schedule.companyId.whatsapp, message)

      if (schedule) {
        return res.status(200).json(schedule);
      } else return res.status(500);
    }

    else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json({ data: error, message: error.message });
  }
}
