import Mongoose from "mongoose";

export let DossieSchema: Mongoose.Schema;
try {
  DossieSchema = Mongoose.model("Dossie").schema;
} catch (error) {
  DossieSchema = new Mongoose.Schema(
    {
      userId: {
        type: String,
        required: true,
      },
      action: {
        type: String,
        required: true,
      },
      identfier: {
        type: String,
        required: true,
      },
    },
    { collection: "dossie", timestamps: true }
  );
}
