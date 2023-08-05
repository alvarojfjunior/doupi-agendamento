import Mongoose from 'mongoose';

export let UserSchema: Mongoose.Schema;
try {
  UserSchema = Mongoose.model('User').schema;
} catch (error) {
  UserSchema = new Mongoose.Schema(
    {
      companyId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true,
      },
      name: {
        type: String,
        required: true,
      },
      phone: {
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
      active: {
        type: Number,
        required: true,
        default: 1,
      },
    },
    { collection: 'users', timestamps: true }
  );
}
