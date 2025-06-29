import { Router } from "express";
import SuppliersController from "../Controllers/SuppliersControllers.js";
import { GroceryOwnerOnly, jwtMiddleware } from "../Midllewares.js";

const supplierRoute = Router();

supplierRoute.post("/register", SuppliersController.registerSupplier);

supplierRoute.post("/login", SuppliersController.loginSupplier);

supplierRoute.get("/getSupplier",jwtMiddleware, GroceryOwnerOnly, SuppliersController.getSupplier);

export default supplierRoute;
