import Mongoose from 'mongoose';

export let CompanySchema: Mongoose.Schema;
try {
  CompanySchema = Mongoose.model('Company').schema;

  // DATABASE MIGRATION
  // CompanySchema.add({
  //   userAccess: {
  //     type: Number,
  //     default: false,
  //   },
  // });
  // const Company = Mongoose.model('Company', CompanySchema);
  // Company.updateMany({}, { $set: { userAccess: 1 } })
  //   .then((res) => console.log(res))
  //   .catch((error) => console.log(error));


} catch (error) {
  CompanySchema = new Mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        unique: true,
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
      coverImage: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      phone: {
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
        default: true,
      },
    },
    {
      collection: 'companies',
      timestamps: true,
    }
  );
}
