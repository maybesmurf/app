import { Document, model, Schema } from 'mongoose';
import { createdAtToDate, useId } from '../../utils/utils';
import validators from '../../utils/validators';
import { generateSnowflake } from '../snowflake-entity';

export interface TextChannelDocument extends Document, ChannelTypes.Text {
  _id: string | never;
  id: string;
  createdAt: never;
  guildId: string;
}
export type ChannelDocument = TextChannelDocument;

export const Channel = model<ChannelDocument>('channel', new Schema({
  _id: {
    type: String,
    default: generateSnowflake,
  },
  createdAt: {
    type: Date,
    get: createdAtToDate,
  },
  guildId: {
    type: String,
    validate: {
      validator: validators.optionalSnowflake,
      message: 'Invalid Snowflake ID',
    },
  },
  memberIds: {
    type: [String],
    default: [],
    validate: {
      validator: validators.maxLength(50),
      message: 'Channel member limit reached',
    }
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    maxlength: [32, 'Name too long'],
    validate: {
      validator: function(val: string) {
        const type = (this as any).type;
        const pattern = /^[A-Za-z\-\d]+$/;
        return type === 'TEXT'
          && pattern.test(val)
          || type !== 'TEXT';
      },
      message: 'Invalid name'
    }
  },
  lastMessageId: {
    type: String,
    validate: {
      validator: validators.optionalSnowflake,
      message: 'Invalid Snowflake ID'
    },
  },
  summary: {
    type: String,
    maxlength: [128, 'Summary too long'],
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    validate: [/^TEXT$|^VOICE$|^DM$/, 'Invalid type'],
  },
}, { toJSON: { getters: true } })
.method('toClient', useId)
.index(['guildId']));
