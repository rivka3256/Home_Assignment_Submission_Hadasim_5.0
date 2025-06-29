import mongoose, { version } from "mongoose";

const stockSchema = mongoose.Schema({
    name: { type: String, required: true, unique: true }, 
    quantity: { type: Number, required: true },            //current quantity in stock
    minQuantity: { type: Number, required: true }          // minimum quantity in stock
});

const Stock = mongoose.model('Stock', stockSchema,'Stock');
export default Stock;