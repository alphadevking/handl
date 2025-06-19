import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields automatically
export class FormDefinition extends Document {
  @Prop({ unique: true, required: true })
  declare id: string;

  // Stores the JSON Schema itself as a flexible object
  @Prop({ type: Object, required: true })
  declare schema: any;

  @Prop()
  description: string; // Optional description for the form

  @Prop({ type: Object })
  json_fields: object;

  @Prop({ type: Object })
  metadata: object;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Reference to the User who created the definition
}

export const FormDefinitionSchema = SchemaFactory.createForClass(FormDefinition);
