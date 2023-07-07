import Mongoose from "mongoose";

export let ProfessionalSchema: Mongoose.Schema;
try {
  ProfessionalSchema = Mongoose.model("Professional").schema;
} catch (error) {
  ProfessionalSchema = new Mongoose.Schema(
    {
      companyId: {
        type: String,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      photo: {
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
        default: true
      },
      whatsapp: {
        type: String,
        required: true,
      },
      defaultSchedule: {
        type: Object,
        required: true,
        default: {
          mon: ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
          tue: ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
          wed: ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
          thu: ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
          fri: ['08:00', '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
          sat: ['08:00', '09:00', '10:00', '11:00', '12:00'],
          sun: [],
        }
      },
    },
    { collection: "professionals", timestamps: true }
  );
}
