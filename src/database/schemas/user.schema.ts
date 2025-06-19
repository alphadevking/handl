import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

@Schema({ timestamps: true })
export class User extends Document {
  declare _id: Types.ObjectId; // Explicitly declare _id for better type inference

  @Prop({ unique: true, sparse: true }) // sparse allows null values to not violate unique constraint
  googleId: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop()
  picture: string;

  @Prop({ unique: true, required: true, default: uuidv4 })
  apiKey: string;

  @Prop({ type: Object })
  json_fields: object;

  @Prop({ type: Object })
  metadata: object;

  // Mongoose handles relationships by referencing ObjectIds.
  // No direct array of sub-documents here, but rather references from other schemas.
}

export const UserSchema = SchemaFactory.createForClass(User);
