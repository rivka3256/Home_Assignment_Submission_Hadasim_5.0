import mongoose, { version } from "mongoose";

const supplierSchema = mongoose.Schema({
    companyName: 
    { 
        type: String, 
        required: true 
    },
    password: 
    {
         type: String,
         required: true 
    },
    phoneNumber: 
    { 
        type: String,
        required: true 
    
    },
    representativeName: 
    {
        type: String,
        required: true 
    },
    products: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        minQuantity: { type: Number, required: true }
    }]
});

const Suppliers = mongoose.model('Suppliers', supplierSchema,'Suppliers');
export default Suppliers;
