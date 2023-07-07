import type { NextApiRequest, NextApiResponse } from "next";
import { User } from "@/services/database";
import { authenticate } from "@/utils/apiAuth";
import { createDossie } from "@/utils/createDossie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      if (!authenticate(req))
        return res.status(401).json({ message: "Unauthorized" });

      const query = JSON.parse(JSON.stringify(req.query));
      const orders = await User.find(query);
      return res.status(200).json(orders);
    }

    if (req.method === "PUT") {
      const auth = authenticate(req);
      if (!auth) return res.status(401).json({ message: "Unauthorized" });

      const body = JSON.parse(JSON.stringify(req.body));

      const _id = body._id;
      delete body._id;

      const { modifiedCount } = await User.updateOne({ _id }, body).lean();

      await createDossie({
        userId: auth._id,
        action: 'update',
        identfier: 'user'
      });

      if (modifiedCount > 0) {
        const order = await User.findOne({ _id }).lean();
        return res.status(200).json(order);
      }
    }

    return res.status(404);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
