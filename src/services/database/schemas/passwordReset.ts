// models/token.model.js
import Mongoose from "mongoose";

export let PasswordResetSchema: Mongoose.Schema;
try {
  PasswordResetSchema = Mongoose.model("PasswordReset").schema;
} catch (error) {
  PasswordResetSchema = new Mongoose.Schema(
    {
      userId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
        expires: 3600, // this is the expiry time in seconds
      },
    },
    { collection: "passwordreset", timestamps: true }
  );
}
