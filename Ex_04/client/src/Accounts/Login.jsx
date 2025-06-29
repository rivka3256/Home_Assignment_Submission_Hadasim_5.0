import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/Login.css"; 
const Login = () => {
  const navigate = useNavigate();
   
  return (
    // <div className="login-container">
    //   <h2 className="login-title" style={{fontSize:"35px"}} >Grocery management system</h2>
    //   <div className="login-buttons">
    //     <button
    //       className="login-button storeOwner"
    //       onClick={() => navigate("/GroceryOwnerLogin")}
    //     >
    //       Grocery Owner Login
    //     </button>
    //     <button
    //       className="login-button supplier"
    //       onClick={() => navigate("/SupplierLogin")}
    //     >
    //       Supplier login        </button>
    //   </div>
    // </div>
    <div className="login-container">
  <div className="login-box">
    <h1 className="login-title">Grocery Management System</h1>
    <p className="login-subtitle">Welcome! Choose your role to continue</p>
    <div className="login-button-group">
      <button
        className="login-button owner-btn"
        onClick={() => navigate("/GroceryOwnerLogin")}
      >
         Grocery Owner
      </button>
      <button
        className="login-button supplier-btn"
        onClick={() => navigate("/SupplierLogin")}
      >
        Supplier
      </button>
    </div>
  </div>
</div>
  );
};

export default Login;