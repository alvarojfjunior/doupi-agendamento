import type { NextApiRequest, NextApiResponse } from 'next';
import { Cashier, Schedule } from '../../../../services/database';
import { authenticate } from '@/utils/apiAuth';
import { createDossie } from '@/utils/createDossie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const auth = authenticate(req);
      if (!auth) return res.status(401).json({ message: 'Unauthorized' });

      const body = JSON.parse(JSON.stringify(req.body));

      //Salva um faturamento
      const cashier = new Cashier({
        companyId: auth.companyId,
        fatherName: 'Agendamento',
        fatherId: body._id,
        date: new Date(),
        cashierType: body.cashierType,
        reason: body.reason,
        value: body.value,
      });
      await cashier.save();

      //Altera o agendamento, informando que agora ele tem um faturamnto.
      const { modifiedCount } = await Schedule.updateOne({ _id: body._id }, {
        cashierId: cashier._id
      }).lean();

      await createDossie({
        userId: auth._id,
        action: 'post',
        identfier: 'cashier',
      });

      return res.status(200).json(cashier);

    } else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
