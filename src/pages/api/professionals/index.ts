import type { NextApiRequest, NextApiResponse } from "next";
import { Professional } from "../../../services/database";
import { authenticate } from "@/utils/apiAuth";
import { createDossie } from "@/utils/createDossie";;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: "Unauthorized" });

      const query = JSON.parse(JSON.stringify(req.query));

      const result = await Professional.find({
        ...query,
      }).populate({
        path: 'serviceIds',
        select: '-image'
      }).lean();

      return res.status(200).json(result);
    }

    else if (req.method === "POST") {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: "Unauthorized" });

      const body = JSON.parse(JSON.stringify(req.body));

      const professional = new Professional(body);

      await professional.save();

      createDossie({
        userId: auth._id,
        action: "new",
        identfier: "professional",
      });

      return res.status(201).json(professional);
    }

    else if (req.method === "PUT") {
      const auth = authenticate(req);
      if (!auth) return res.status(401).json({ message: "Unauthorized" });

      let body = JSON.parse(JSON.stringify(req.body));

      body._v++;

      const _id = body._id
      delete body._id
      delete body.updatedAt
      delete body.createdAt

      const { modifiedCount } = await Professional.updateOne({ _id }, body).lean();

      await createDossie({
        userId: auth._id,
        action: "update",
        identfier: "professional",
      });

      if (modifiedCount > 0) {
        const professionalRes = await Professional.findOne({ _id }).lean();
        return res.status(200).json(professionalRes);
      } else return res.status(500)
    }


    else if (req.method === "DELETE") {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: "Unauthorized" });

      const query = JSON.parse(JSON.stringify(req.query));

      const result = await Professional.deleteOne({
        ...query,
      }).lean();

      return res.status(200).json(result);
    } else {
      return res.status(404);
    }
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
