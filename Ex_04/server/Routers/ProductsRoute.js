import { Router } from "express";
import {  addProduct, getProducts } from "../Controllers/ProductsControllers.js";
import { jwtMiddleware, SupplierOnly } from "../Midllewares.js";

const productRoute = Router();

productRoute.get('/getProducts', jwtMiddleware, SupplierOnly, getProducts);
productRoute.post('/addProduct', jwtMiddleware, SupplierOnly, addProduct);

export default productRoute;