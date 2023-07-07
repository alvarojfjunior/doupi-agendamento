import Mongoose from "mongoose";

export let UserSchema: Mongoose.Schema;
try {
  UserSchema = Mongoose.model("User").schema;
} catch (error) {
  UserSchema = new Mongoose.Schema(
    {
      companyId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true,
      },
      password: {
        type: String,
        required: true,
      },
      type: {
        type: Number,
        required: true,
        default: 0, //0 = admin | 2 = professor | 3 = aluno
      },
      status: {
        type: Number,
        required: true,
        default: 1, //0 = disabled | 1 = enabled
      },
    },
    { collection: "users", timestamps: true }
  );
}
