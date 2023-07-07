import type { NextApiRequest, NextApiResponse } from "next";
import { Company } from "../../../services/database";
import { authenticate } from "@/utils/apiAuth";
import { createDossie } from "@/utils/createDossie";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: "Unauthorized" });

      const query = JSON.parse(JSON.stringify(req.query));

      const result = await Company.find({
        ...query,
      }).lean();

      return res.status(200).json(result);
    }

    if (req.method === "POST") {
      const auth: any = authenticate(req);
      if (!auth) return res.status(401).json({ message: "Unauthorized" });

      const body = JSON.parse(JSON.stringify(req.body));

      const company = new Company(body);

      await company.save();

      createDossie({
        userId: 'own',
        action: "new",
        identfier: "company",
      });

      return res.status(201).json(company);
    }

    if (req.method === "PUT") {
      const auth = authenticate(req);
      if (!auth) return res.status(401).json({ message: "Unauthorized" });

      const body = JSON.parse(JSON.stringify(req.body));

      const _id = body._id;
      delete body._id;

      const { modifiedCount } = await Company.updateOne({ _id }, body).lean();

      await createDossie({
        userId: auth._id,
        action: "update",
        identfier: "company",
      });

      if (modifiedCount > 0) {
        const companyRes = await Company.findOne({ _id }).lean();
        return res.status(200).json(companyRes);
      } else return res.status(500)
    }

    return res.status(404);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json({ data: error, message: error.message });
  }
}
