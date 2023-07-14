import Mongoose from "mongoose";

export let ScheduleSchemaSchema: Mongoose.Schema;
try {
  ScheduleSchemaSchema = Mongoose.model("Schedule").schema;
} catch (error) {
  ScheduleSchemaSchema = new Mongoose.Schema(
    {
      companyId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
      },
      clientID: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
      },
      professionalId: {
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Professional',
        required: true
      },
      serviceIds: [{
        type: Mongoose.Schema.Types.ObjectId,
        ref: 'Service'
      }],
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
    { collection: "schedules", timestamps: true }
  );
}
