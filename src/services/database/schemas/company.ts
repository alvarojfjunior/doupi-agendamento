import Mongoose from 'mongoose';

export let CompanySchema: Mongoose.Schema;
try {
  CompanySchema = Mongoose.model('Company').schema;

  // // DATABASE MIGRATION
  // CompanySchema.add({
  //   whatsappToken: {
  //     type: String
  //   },
  // });
  // const Company = Mongoose.model('Company', CompanySchema);
  // Company.updateMany(
  //   {},
  //   { $set: { whatsappToken: '' } }
  // )
  //   .then(res => console.log(res))
  //   .catch(error => console.log(error))


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
        unique: true,
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
      isWhatsappService: {
        type: Boolean,
        required: true,
        default: false,
      },
      whatsappToken: {
        type: String
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
