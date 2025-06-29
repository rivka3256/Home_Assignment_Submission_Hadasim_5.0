import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginSupplierApi } from "../API/SupplierApi";
import "../Styles/SupplierLogin.css"
import { Link } from "react-router-dom";

const SupplierLogin = () => {
  const [formData, setFormData] = useState({
    companyName: "",
    password: ""
  });

  const mutation = useMutation({
    mutationFn: loginSupplierApi,
    onSuccess: (response) => {
      localStorage.setItem("token", response.token);
      localStorage.setItem("role", "supplier");
      window.location.href = "/ordersBySupplier";
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("🧾 Data before login:", formData);
    mutation.mutate(formData); // call loginSupplierApi with form data
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title"> Supplier login</h2>
        {mutation.isError && <p className="error-text">Error: {mutation.error}</p>}
        {mutation.isSuccess && <p className="success-text"> Successful login!</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>companyName</label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label>password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
          </div>

          <button type="submit" className="login2-button" disabled={mutation.isLoading}>
            Login
          </button>

          <Link className="to-register" to="/SupplierRegister">To register, click here.</Link>
        </form>
      </div>
    </div>
  );
};

export default SupplierLogin;