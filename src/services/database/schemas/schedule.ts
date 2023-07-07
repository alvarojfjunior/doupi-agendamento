import Mongoose from "mongoose";

export let ScheduleSchemaSchema: Mongoose.Schema;
try {
  ScheduleSchemaSchema = Mongoose.model("ScheduleSchema").schema;
} catch (error) {
  ScheduleSchemaSchema = new Mongoose.Schema(
    {
      companyId: {
        type: String,
        required: true,
      },
      profissionalId: {
        type: String,
        required: true,
      },
      serviceId: {
        type: String,
        required: true,
      },
      userPhone: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
        default: Date.now
      },
      time: {
        type: String,
        required: true,
      },
    },
    { collection: "schedules", timestamps: true }
  );
}
