import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // Adds createdAt and updatedAt fields automatically
export class FormEntry extends Document {
  // Declare createdAt and updatedAt for TypeScript type safety due to timestamps: true
  createdAt: Date;
  updatedAt: Date;

  // Reference to the User who submitted the form
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  formId: string; // To link back to the FormDefinition (which has 'id' as its unique identifier)

  @Prop({ type: Object, required: true }) // Store the entire form data as a flexible object
  formData: Record<string, any>; // The dynamic data object

  @Prop({ type: Object })
  json_fields: object;

  @Prop({ type: Object })
  metadata: object;
}

export const FormEntrySchema = SchemaFactory.createForClass(FormEntry);
