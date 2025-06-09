import type { NextApiResponse } from 'next';
import { withIronSessionApiRoute } from 'iron-session/next';

export default withIronSessionApiRoute(
  async function handler(req: any, res: NextApiResponse) {
    try {
      if (req.method === 'GET') {
        // Destruir a sessão
        await req.session.destroy();
        
        // Configurar o cookie para expirar imediatamente
        res.setHeader('Set-Cookie', [
          `doupi_cookie=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Strict`,
        ]);
        
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
      httpOnly: true,
      sameSite: "strict",
      maxAge: 86400, // 24 horas em segundos
    },
  }
);
