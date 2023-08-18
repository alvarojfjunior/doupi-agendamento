import { Schedule } from '../../../services/database';
import moment from 'moment';
import { getWhatsappInstance, startSession } from '@/services/whatsapp';
import { transformPhoneNumber } from '@/utils/general';
import { remaindMessage } from '@/utils/notificarions';

export default async function handler(req: any, res: any) {
  Schedule.aggregate([
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
        day: moment().format('YYYY-MM-DD'),
        status: 'agendado',
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
      $lookup: {
        from: 'companies',
        localField: 'companyId',
        foreignField: '_id',
        as: 'company',
        pipeline: [
          {
            $match: {
              isWhatsappService: true,
            },
          },
        ],
      },
    },
    {
      $unwind: '$company',
    },
  ]).then(async (schedules: any) => {
    const notificationsSent: any = [];

    const toNotify: any[] = [];

    console.log('Agendamentos encontrados:', schedules.length);

    schedules.forEach((schedule: any) => {
      const diff = moment(schedule.time, 'hh:mm').diff(moment(), 'minutes');
      console.log('Falta:', diff, 'minutos');
      if (diff > 30 /*&& diff < 120*/) {
        toNotify.push(schedule);
      }
    });

    const groupsByCompanyId: any = {};
    for (const object of toNotify) {
      const companyId = object.companyId;
      if (!groupsByCompanyId[companyId]) {
        groupsByCompanyId[companyId] = [];
      }
      groupsByCompanyId[companyId].push(object);
    }

    for (const companyId in groupsByCompanyId) {
      const group = groupsByCompanyId[companyId];
      try {
        console.log(`Sending messages from: ${group[0].company.name}`);
        const startSessionRes = await startSession(group[0].company);
        if (!startSessionRes) return;
        for (const schedule of group) {
          await getWhatsappInstance(group[0].company.whatsappToken).post(
            `${
              process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
            }/api/${transformPhoneNumber(
              group[0].company.whatsapp || group[0].company.whatsapp
            )}/send-message`,
            {
              phone: transformPhoneNumber(schedule.client.phone),
              isGroup: false,
              message: remaindMessage(schedule, true),
            }
          );
          notificationsSent.push({
            company: schedule.company.name,
            clientName: schedule.client.name,
          });
          console.log('Notification sent to:', schedule.client.name);
        }
        console.log(
          'All notifications from ',
          group[0].company.name,
          'was send.'
        );
      } catch (error) {
        console.log('Error to send some notification');
      } finally {
        await getWhatsappInstance(group[0].company.whatsappToken).post(
          `${
            process.env.NEXT_PUBLIC_WHATSAPP_SERVICE_API
          }/api/${transformPhoneNumber(
            group[0].company.whatsapp || group[0].company.whatsapp
          )}/close-session`,
          {}
        );
      }
    }
  });

  return res.status(200).json({ error: true, data: 'Trigged' });
}
