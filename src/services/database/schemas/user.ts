import Mongoose from 'mongoose';

export let UserSchema: Mongoose.Schema;
try {
  UserSchema = Mongoose.model('User').schema;

  // DATABASE MIGRATION
  // UserSchema.add({
  //   isDoupiAdmin: {
  //     type: Boolean,
  //     default: false,
  //   },
  // });
  // const User = Mongoose.model('User', UserSchema);
  // User.updateMany({}, { $set: { isDoupiAdmin: false } })
  //   .then((res) => console.log(res))
  //   .catch((error) => console.log(error));

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
      userAccess: {
        //0=basicUser, 1=adminUser
        type: Number,
        required: true,
        default: 1,
      },
      isDoupiAdmin: {
        type: Boolean,
        required: true,
        default: false,
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
