import type { NextApiRequest } from "next";
import jwt from "jsonwebtoken";
import { IUser } from "@/types/api/User";

export const authenticate = (req: NextApiRequest): IUser | undefined => {
  const token = req.headers["authorization"]?.replace("Bearer ", "");

  if (!token) {
    return undefined;
  }

  try {
    const secretJwtCode = process.env.SECRET_JWT_CODE;
    if (!secretJwtCode) return undefined;

    const decoded = jwt.verify(token, secretJwtCode);
    if (!decoded || typeof decoded === 'string') return undefined;

    const user = {
      _id: decoded._id,
      name: decoded.name,
      email: decoded.email,
      token: decoded.token,
      type: decoded.type,
    }

    return user;
  } catch (error) {
    return undefined;
  }
};
