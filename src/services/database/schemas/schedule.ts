import Mongoose from "mongoose";

export let ScheduleSchemaSchema: Mongoose.Schema;
try {
  ScheduleSchemaSchema = Mongoose.model("Schedule").schema;
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
      time: {
        type: String,
        required: true,
      },
    },
    { collection: "schedules", timestamps: true }
  );
}
