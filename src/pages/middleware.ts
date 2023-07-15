// /middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getIronSession } from "iron-session/edge";

export const middleware = async (req: NextRequest) => {
  const res = NextResponse.next();
  const session = await getIronSession(req, res, {
    cookieName: "doupi_cookie",
    //@ts-ignore
    password: process.env.SESSION_SECRET,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  });

  //@ts-ignore
  const { user } = session;

  console.log("from middleware", { user });

  if (!user) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res;
};

export const config = {
  matcher: "/admin",
};
