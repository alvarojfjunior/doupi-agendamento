import Mongoose from 'mongoose';

export let ClientSchema: Mongoose.Schema;
try {
  ClientSchema = Mongoose.model('Client').schema;
} catch (error) {
  ClientSchema = new Mongoose.Schema(
    {
      companyId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
      active: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
    { collection: 'clients', timestamps: true }
  );
}
