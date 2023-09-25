import type { NextApiRequest, NextApiResponse } from 'next';
import { Company, User } from '../../../services/database';
import bcrypt from 'bcrypt';
import { createDossie } from '@/utils/createDossie';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const body = JSON.parse(JSON.stringify(req.body));

      const newCompany = {
        name: body.companyName,
        color: '#2D4356',
        coverImage: 'http://res.cloudinary.com/dovvizyxg/image/upload/v1689457021/barber-shop-design-template-a5839e60d342e6dafe51cf9a413870ee_screen_pzaim3.jpg',
        businessType: body.type,
        responsableName: body.userName,
        email: body.email,
        phone: body.phone,
        whatsapp: body.phone,
        document: '0',
      };

      const company = await new Company(newCompany).save();

      const newUser = {
        companyId: company.id,
        name: body.userName,
        phone: body.phone,
        email: body.email,
        password: body.password,
      };

      const user = new User(newUser);

      const password = await bcrypt.hash(user.password, 10);

      user.password = password;

      await user.save();

      delete user.password;

      await createDossie({
        //@ts-ignore
        userId: user._id,
        action: 'signup',
        identfier: 'company',
      });

      await createDossie({
        //@ts-ignore
        userId: user._id,
        action: 'signup',
        identfier: 'user',
      });

      user._id;

      return res.status(201).json(user);
    }

    return res
      .status(404)
      .json({ data: undefined, message: 'Rota inexistente' });
  } catch (error: any) {
    const body = JSON.parse(JSON.stringify(req.body));
    await Company.deleteOne({ email: body.email });
    await User.deleteOne({ email: body.email });
    return res.status(500).json({ data: error, message: error.message });
  }
}
