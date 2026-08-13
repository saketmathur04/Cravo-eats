import mongoose, { Schema, Document } from "mongoose";

export interface IAddress extends Document {
  userId: string;
  mobile: number;

  formattedAddress: string;
  flat?: string;
  landmark?: string;
  label?: "home" | "work" | "other";

  location: {
    type: "Point";
    coordinates: [number, number];
  };

  createdAt: Date;
  updatedAt: Date;
}

const schema = new Schema<IAddress>(
  {
    userId: {
      type: String,
      required: true,
    },
    mobile: {
      type: Number,
      required: true,
    },
    formattedAddress: {
      type: String,
      required: true,
    },
    flat: {
      type: String,
    },
    landmark: {
      type: String,
    },
    label: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

schema.index({ location: "2dsphere" });

export default mongoose.model<IAddress>("Address", schema);
