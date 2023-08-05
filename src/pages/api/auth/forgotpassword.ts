import type { NextApiRequest, NextApiResponse } from 'next';
import { PasswordReset, User } from '@/services/database';
import { createDossie } from '@/utils/createDossie';
import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import Email from '@/services/smtpjs/smtp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'POST') {
      const body = JSON.parse(JSON.stringify(req.body));

      const { email } = body;

      if (!email) {
        return res.status(400).send('Requer e-mail');
      }

      const user = await User.findOne({ email: email.trim() }).lean();

      if (!user) {
        return res.status(400).send('Usuário não existe');
      } else {
        const resetToken = crypto.randomBytes(32).toString('hex');
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(resetToken, salt);

        await new PasswordReset({
          userId: user._id,
          token: hash,
        }).save();

        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const link = `${baseUrl}/passwordreset?token=${resetToken}&id=${user._id}`;

        await Email.send({
          Host: 'smtp.elasticemail.com',
          Username: process.env.SENDER_EMAIL,
          Password: process.env.EMAIL_SECRET,
          To: email,
          From: process.env.SENDER_EMAIL,
          Subject: 'Doupi - Recuperar senha',
          Body: `<html><h2>Doupi - Recuperar senha</h2><p>Para recuperar sua senha, utilize o link a seguir: <a href='${link}'>Clique aqui</a></p></html>`,
        });

        await createDossie({
          //@ts-ignore
          userId: user._id,
          action: 'requestNewPassword',
          identfier: 'user',
        });

        return res.status(200).json('E-mail enviado!');
      }
    }

    return res.status(404);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
