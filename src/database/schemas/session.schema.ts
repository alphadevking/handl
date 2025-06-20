import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Session extends Document {
  @Prop({ required: true })
  expires: Date; // The expiration date of the session

  @Prop({ required: true })
  session: string; // The session data (JSON string)
}

export const SessionSchema = SchemaFactory.createForClass(Session);
