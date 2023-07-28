import type { NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';

export default withIronSessionApiRoute(
  async function handler(req: any, res: NextApiResponse) {
    try {
      if (req.method === 'GET') {
        await req.session.destroy();
        return res.status(200).send({ ok: true });
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
    // secure: true should be used in production (HTTPS) but can't be used in development (HTTP)
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production',
    },
  }
);
