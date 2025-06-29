import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "../Accounts/Login";
import ProductList from "../Components/Product/ProductList";
import OrdersListBySupplier from "../Components/Order/OrderListBySupplier";
import OrderListByGroceryOwner from '../Components/Order/OrderListByGroceryOwner';
import SupplierRegister from "../Accounts/SupplierRegister";
import SupplierLogin from "../Accounts/SupplierLogin";
import GroceryOwnerLogin from "../Accounts/GroceryOwnerLogin";
import AddProduct from "../Components/Product/AddProduct";
import Navbar from "../Components/NavBar";
import StockManagement from "../Components/StockManagement";

const Routing = () => {
    return (
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Login />} />
                <Route path="/SupplierRegister" element={<SupplierRegister />} />
                <Route path="/SupplierLogin" element={<SupplierLogin />} />
                <Route path="/GroceryOwnerLogin" element={<GroceryOwnerLogin></GroceryOwnerLogin>} />
                <Route path="/ordersBySupplier" element={<OrdersListBySupplier />} />
                <Route path="/OrderListByGroceryOwner" element={<OrderListByGroceryOwner />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/addProduct" element={<AddProduct />} />
                <Route path="/navbar" element={<Navbar></Navbar>} /> 
                <Route path="/stockManagement" element={<StockManagement />} />
            </Routes>
    );
};

export default Routing;