import Mongoose from "mongoose";

export let CompanySchema: Mongoose.Schema;
try {
  CompanySchema = Mongoose.model("Company").schema;
} catch (error) {
  CompanySchema = new Mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
      },
      responsableName: {
        type: String,
        required: true,
      },
      businessType: {
        type: String,
        required: true,
      },
      color: {
        type: String,
        required: true,
      },
      logoImage: {
        type: String,
        required: true,
      },
      coverImage: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      document: {
        type: String,
        required: true,
      },
      whatsapp: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        required: true,
        default: true
      },
    },
    { collection: "companies", timestamps: true }
  );
}
