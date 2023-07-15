import Mongoose from 'mongoose';

export let ScheduleSchemaSchema: Mongoose.Schema;
try {
  ScheduleSchemaSchema = Mongoose.model('Schedule').schema;
} catch (error) {
  ScheduleSchemaSchema = new Mongoose.Schema(
    {
      companyId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true,
      },
      clientID: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
        index: true,
      },
      professionalId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true,
        index: true,
      },
      serviceIds: [
        {
          type: Mongoose.Schema.Types.ObjectId,
          ref: 'Service',
        },
      ],
      date: {
        type: Date,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
      duration: {
        type: String,
        required: true,
      },
    },
    { collection: 'schedules', timestamps: true }
  )
  ScheduleSchemaSchema.index({ serviceIds: 1 })
}
