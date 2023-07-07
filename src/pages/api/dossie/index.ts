import type { NextApiRequest, NextApiResponse } from "next";
import { Dossie } from "../../../services/database";
import { authenticate } from "@/utils/apiAuth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      if (!authenticate(req))
        return res.status(401).json({ message: "Unauthorized" });

      const query = JSON.parse(JSON.stringify(req.query));
      const orders = await Dossie.find(query);
      return res.status(200).json(orders);
    }

    return res.status(404);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
