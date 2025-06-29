import { Router } from "express";
import { createNewOrder,getOrdersBySupplier, getOrdersByGroceryOwner, confirmOrder, completeOrder } from "../Controllers/OrdersControllers.js";
import { jwtMiddleware, GroceryOwnerOnly, SupplierOnly } from "../Midllewares.js";

const OrderRoute = Router();

OrderRoute.get("/getOrdersSupplier",jwtMiddleware, SupplierOnly, getOrdersBySupplier);
OrderRoute.get("/getOrdersOwner", jwtMiddleware, GroceryOwnerOnly, getOrdersByGroceryOwner);
OrderRoute.put("/confirm/:id", jwtMiddleware, SupplierOnly,confirmOrder);
OrderRoute.put("/complete/:id",jwtMiddleware, GroceryOwnerOnly, completeOrder);
OrderRoute.post("/newOrder",jwtMiddleware, GroceryOwnerOnly, createNewOrder);


export default OrderRoute;