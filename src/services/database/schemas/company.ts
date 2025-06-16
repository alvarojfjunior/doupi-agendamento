import Mongoose from 'mongoose';

export let CompanySchema: Mongoose.Schema;
try {
  CompanySchema = Mongoose.model('Company').schema;

  // to add a new field on schema
  // CompanySchema.add({
  //   isStripeEnabled: {
  //     type: Boolean,
  //     default: false,
  //   },
  //   stripePublishableKey: {
  //     type: String,
  //     default: '',
  //   },
  //   stripeSecretKey: {
  //     type: String,
  //     default: '',
  //   },
  // });
  // const Company = Mongoose.model('Company', CompanySchema);
  // Company.updateMany({}, { $set: { isStripeEnabled: false, stripePublishableKey: '', stripeSecretKey: '' } })
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
      isWhatsappApi: {
        type: Boolean,
        default: false,
      },
      isStripeEnabled: {
        type: Boolean,
        default: false,
      },
      stripePublishableKey: {
        type: String,
        default: '',
      },
      stripeSecretKey: {
        type: String,
        default: '',
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
