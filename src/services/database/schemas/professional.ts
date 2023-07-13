import Mongoose from "mongoose";

export let ProfessionalSchema: Mongoose.Schema;
try {
  ProfessionalSchema = Mongoose.model("Professional").schema;
} catch (error) {
  ProfessionalSchema = new Mongoose.Schema(
    {
      companyId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      photo: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        required: true,
        default: true
      },
      whatsapp: {
        type: String,
        required: true,
      },
      defaultSchedule: {
        type: Object,
        required: true,
        default: Array
      },
    },
    { collection: "professionals", timestamps: true }
  );
}
