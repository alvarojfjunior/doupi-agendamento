import Mongoose from 'mongoose';

export let CashierSchema: Mongoose.Schema;
try {
  CashierSchema = Mongoose.model('Cashier').schema;
} catch (error) {
  CashierSchema = new Mongoose.Schema(
    {
      companyId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        index: true,
        required: true,
      },
      fatherName: {
        type: String,
        required: true,
      },
      fatherId: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      cashierType: {
        type: String,
        enum: ['Geral', 'Dinheiro', 'Cartão', 'Transferência bancária'],
        default: 'Geral',
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      value: {
        type: Number,
        required: true,
      },
    },
    { collection: 'cashiers', timestamps: true }
  );
}
