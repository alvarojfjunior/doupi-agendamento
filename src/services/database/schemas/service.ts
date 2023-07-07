import Mongoose from "mongoose";

export let ServiceSchema: Mongoose.Schema;
try {
  ServiceSchema = Mongoose.model("Service").schema;
} catch (error) {
  ServiceSchema = new Mongoose.Schema(
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
      price: {
        type: Number,
        required: true,
      },
      duration : {
        type: String,
        required: true,
        default: '01:00'
      },
      active: {
        type: Boolean,
        required: true,
        default: true
      },
    },
    { collection: "services", timestamps: true }
  );
}
