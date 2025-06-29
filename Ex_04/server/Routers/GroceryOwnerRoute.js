import { Router } from "express";
import { loginGroceryOwner } from "../Controllers/GroceryOwnerControllers.js";


const ownerRoute = Router();

ownerRoute.post("/login", loginGroceryOwner);


export default ownerRoute;