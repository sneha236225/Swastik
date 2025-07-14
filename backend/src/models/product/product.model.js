import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String 
    },
    capacity: { 
        type: String 
    },
    cartridgeLife: { 
        type: String 
    },
    warranty: { 
        type: String 
    },
    price: { 
        type: Number, 
        required: true 
    },
    discountPrice: { 
        type: Number 
    },
    stock: { 
        type: Number, 
        default: 0 
    },
    images: [String],
    videos: [String],
    isActive: { 
        type: Boolean, 
        default: true 
    },
    variants: [
      {
        name: String,
        options: [String],
      },
    ],
  },
  { timestamps: true }
);
const productModel = mongoose.model("Product",productSchema);
export default productModel;