import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Token extends Document {
  @Prop({ required: true, index: true })
  identifier: string;

  @Prop({ required: true, index: true })
  token: string;

  @Prop({ expires: 120 })
  expiredAt: Date;
}

export const TokenSchema = SchemaFactory.createForClass(Token);
