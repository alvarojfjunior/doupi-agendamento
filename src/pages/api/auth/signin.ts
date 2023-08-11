import type { NextApiResponse } from 'next';
import { User } from '@/services/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { withIronSessionApiRoute } from 'iron-session/next';
import { createDossie } from '@/utils/createDossie';

export default withIronSessionApiRoute(
  async function handler(req: any, res: NextApiResponse) {
    try {
      if (req.method === 'POST') {
        const body = JSON.parse(JSON.stringify(req.body));

        const { email, password } = body;

        if (!(email && password)) {
          return res.status(400).send('All input is required');
        }

        const user = await User.findOne({ email }).populate({
          path: 'companyId',
          select: 'name whatsapp isWhatsappService whatsappToken'
        }).lean();

        if (!user) return res.status(401).send('Invalid Credentials');

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (user && isPasswordMatch) {
          const secretJwrtCode = process.env.SECRET_JWT_CODE;

          if (!secretJwrtCode) return res.status(500);

          const token = jwt.sign(user, secretJwrtCode, {
            //expiresIn: "2h",
          });

          user.token = token;

          delete user.password;

          await createDossie({
            //@ts-ignore
            userId: user._id,
            action: 'signin',
            identfier: 'user',
          });

          const response = {
            _id: user._id,
            companyId: user.companyId._id,
            companyName: user.companyId.name,
            companyWhatsapp: user.companyId.whatsapp,
            isWhatsappService: user.companyId.isWhatsappService,
            whatsappToken: user.companyId.whatsappToken,
            token: user.token,
            phone: user.phone,
            name: user.name,
            email: user.email,
          };

          console.log(response)

          req.session.user = response
          await req.session.save();
          return res.status(200).json(response);
        }
        return res.status(401).send('Invalid Credentials');
      }

      return res.status(404);
    } catch (error: any) {
      console.log(error);
      return res.status(500).json({ data: error, message: error.message });
    }
  },
  {
    cookieName: 'doupi_cookie',
    //@ts-ignore
    password: process.env.SESSION_SECRET,
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  }
);
