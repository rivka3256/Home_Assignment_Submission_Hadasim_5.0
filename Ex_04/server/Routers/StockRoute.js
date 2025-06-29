import { Router } from "express";
import { handleStockData,  getAllStock, updateStockItem } from "../Controllers/StockControllers.js";

const stockRoute = Router();

stockRoute.post("/handleStockData", handleStockData);
stockRoute.get("/getAllStock", getAllStock);
stockRoute.put("/updateStockItem/:id", updateStockItem);

export default stockRoute;