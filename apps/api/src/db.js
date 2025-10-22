import mongoose from 'mongoose';

const { Schema } = mongoose;

let connectionPromise = null;

const addressSchema = new Schema(
  {
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false },
);

const customerSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: String,
    address: addressSchema,
    preferences: {
      favoriteCategories: [String],
      locale: { type: String, default: 'en-US' },
    },
  },
  { timestamps: true },
);

customerSchema.index({ email: 1 }, { unique: true });

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    category: String,
    tags: [String],
    imageUrl: String,
    stock: { type: Number, default: 0 },
    creatorId: String,
  },
  { timestamps: true },
);

productSchema.index({ tags: 1 });
productSchema.index({ category: 1 });

const orderLineItemSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false },
);

export const ORDER_STATUS_SEQUENCE = ['Placed', 'Packed', 'Shipped', 'Delivered'];

const orderSchema = new Schema(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    email: { type: String, required: true },
    status: { type: String, enum: ORDER_STATUS_SEQUENCE, default: 'Placed' },
    items: { type: [orderLineItemSchema], required: true },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    idempotencyKey: { type: String, index: true },
    estimatedDelivery: Date,
    carrier: String,
    history: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
  },
  { timestamps: true },
);

const assistantMetricSchema = new Schema(
  {
    intent: { type: String, required: true },
    success: { type: Boolean, default: true },
    citedPolicies: [String],
    durationMs: Number,
    customerEmail: String,
    metadata: Schema.Types.Mixed,
  },
  { timestamps: true },
);

assistantMetricSchema.index({ intent: 1, createdAt: -1 });

export const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema);
export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export const AssistantMetric =
  mongoose.models.AssistantMetric || mongoose.model('AssistantMetric', assistantMetricSchema);

export function connectToDatabase(uri) {
  if (connectionPromise) {
    return connectionPromise;
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected'); // eslint-disable-line no-console
  });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error', error); // eslint-disable-line no-console
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected'); // eslint-disable-line no-console
  });

  connectionPromise = mongoose.connect(uri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000,
  });

  return connectionPromise;
}

export function disconnectFromDatabase() {
  connectionPromise = null;
  return mongoose.disconnect();
}
