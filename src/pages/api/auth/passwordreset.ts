import type { NextApiRequest, NextApiResponse } from 'next';
import { PasswordReset, User } from '@/services/database';
import bcrypt from 'bcrypt';
import { createDossie } from '@/utils/createDossie';
import Email from '@/services/smtpjs/smtp';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'PUT') {
      const body = JSON.parse(JSON.stringify(req.body));

      const { userId, token, password } = body;

      await PasswordReset.find();
      const passwordResetToken = await PasswordReset.findOne({
        userId: userId.trim(),
      })
        .sort({ _id: -1 })
        .lean();

      if (!passwordResetToken) {
        throw new Error('Invalid or expired token');
      }

      const isValid = await bcrypt.compare(token, passwordResetToken.token);
      if (!isValid) {
        throw new Error('Invalid token');
      }
      const hash = await bcrypt.hash(password, Number(10));
      await User.updateOne(
        { _id: userId },
        { $set: { password: hash } },
        { new: true }
      );
      const user = await User.findById({ _id: userId }).lean();
      await Email.send({
        Host: 'smtp.elasticemail.com',
        Username: process.env.SENDER_EMAIL,
        Password: 'DF7DE980816DB8D752B26B8F488A08A92F56',
        //@ts-ignore
        To: user.email,
        From: process.env.SENDER_EMAIL,
        Subject: 'Password Reset Successfully',
        //@ts-ignore
        Body: `Hey ${user.name}, your password was reset sucessfully!`,
      });

      await PasswordReset.deleteOne({ _id: passwordResetToken._id });

      await createDossie({
        //@ts-ignore
        userId: user._id,
        action: 'resetPassword',
        identfier: 'user',
      });

      return res.status(200).json(user);
    }

    return res.status(404);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
