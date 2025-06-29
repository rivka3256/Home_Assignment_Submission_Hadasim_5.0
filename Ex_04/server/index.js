import dotenv from 'dotenv';
import express from "express";
import cors from "cors";
import connectDB from "./database.js";
import SupplierRoute from "./Routers/SuppliersRoute.js";
import ProductsRoute from './Routers/ProductsRoute.js';
import OrderRoute from './Routers/OrderRoute.js';
import GroceryOwnerRoute from './Routers/GroceryOwnerRoute.js';
import StockRoute from './Routers/StockRoute.js';
dotenv.config();


const app = express(); // יוצרת את האפליקציה של Express
const port = 5000; //משתנה שמכיל את הפורט שעליו השרת ירוץ

connectDB(); //חיבור למסד הנתונ

app.use(cors()); //מאפשרת חיבור בין השרת ללקוח

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

app.listen(port, () =>
console.log(`Example app listening on http://localhost:${port}`)
); //מאזינה לפורט 5000 ומדפיסה לקונסול שהשרת רץ
// app.use('/suppliers', SuppliersRoute);
app.use('/suppliers', SupplierRoute)
app.use('/products', ProductsRoute);
app.use('/orders', OrderRoute);
app.use('/owner', GroceryOwnerRoute);
app.use('/stocks', StockRoute);