import mongoose, { Schema, model } from "mongoose";

const orderSchema = new Schema({
     supplierId: 
    { 
        type: Schema.Types.ObjectId, 
        ref: "Supplier", 
        required: true 
    },
    supplierName: 
    { 
        type: String, 
        required: true 
    },
    items: [{
        productId: 
        { 
            type: Schema.Types.ObjectId,
            ref: "Product", 
            required: true 
        },
        productName: 
        { 
            type: String,
            required: true 
        }, 
        quantity: 
        { 
            type: Number, 
            required: true 
        },
        price: 
        {
            type: Number,
            required: true,
            min: 0,
        },
        minQuantity: 
        {
            type: Number,
            required: true,
            min: 0,
        }
    }],
    status: 
    { 
        type: String, 
        enum: ["ממתין","בתהליך", "ההזמנה הושלמה"], 
        default: "ממתין" 
    },
    createdAt: 
    {
         type: Date, 
         default: Date.now 
    }
});

const Orders = mongoose.model('Orders', orderSchema,'Orders');
export default Orders;