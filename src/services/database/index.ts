import Mongoose from "mongoose";
import { CompanySchema } from "./schemas/company";
import { ProfessionalSchema } from "./schemas/professional";
import { ServiceSchema } from "./schemas/service";
import { ClientSchema } from "./schemas/client";
import { ScheduleSchemaSchema } from "./schemas/schedule";

import { UserSchema } from "./schemas/user";
import { DossieSchema } from "./schemas/dossie";
import { PasswordResetSchema } from "./schemas/passwordReset";

if (!process.env.MONGOOSE_URI) {
  console.log("erro");
  throw new Error('Invalid environment variable: "MONGOOSE_URI"');
}

Mongoose.Promise = global.Promise;

const databaseUrl = process.env.MONGOOSE_URI;

const connectToDatabase = async (): Promise<void> => {
  await Mongoose.connect(databaseUrl, {});
};

connectToDatabase();

export const User = Mongoose.model("User", UserSchema);
export const Dossie = Mongoose.model("Dossie", DossieSchema);
export const PasswordReset = Mongoose.model(
  "PasswordReset",
  PasswordResetSchema
);
export const Company = Mongoose.model("Company", CompanySchema);
export const Professional = Mongoose.model("Professional", ProfessionalSchema);
export const Service = Mongoose.model("Service", ServiceSchema);
export const Client = Mongoose.model("Client", ClientSchema);
export const Schedule = Mongoose.model("Schedule", ScheduleSchemaSchema);