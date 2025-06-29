import { useState, useEffect } from "react";
import { createOrderApi } from "../../API/OrderApi";
import { getSuppliersApi } from "../../API/SupplierApi";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import "../../Styles/ProductList.css"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const ProductList = () => {
    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [products, setProducts] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [message, setMessage] = useState("");

    const token = localStorage.getItem("token"); 
    // go to the login page if the token is not exist
    const navigate=useNavigate()
        useEffect(() => {
            if (!token) {
                navigate("/OwnerLogin");
            }
        }, [token, navigate]);
// useEffect(() => {
//   if (selectedSupplier && orderItems.length > 0) {
//     setMessage(""); // מנקה את ההודעה אם התנאי כבר תקף
//   }
// }, [selectedSupplier, orderItems]);

        const { data: suppliers, error, isLoading } = useQuery({
        queryKey: ['suppliers'],
        refetchOnWindowFocus: true,
        refetchInterval: 60000, 
        queryFn: () => {
                    const response = getSuppliersApi(token);
                    return response;
        },
    });

    //loading products of the selected supplier
const handleSupplierSelect = (supplierId) => {
  setSelectedSupplier(supplierId);

  const selectedSupplierObj = suppliers.find(s => s._id === supplierId);

  if (selectedSupplierObj && selectedSupplierObj.products.length > 0) {
    setProducts(selectedSupplierObj.products);
    setMessage("");
  } else {
    setProducts([]);
    setMessage("לא נמצאו מוצרים לספק זה");
  }

  setOrderItems([]); // אפס את העגלה
};
    // const handleSupplierChange = (e) => {
    //     const supplierId = e.target.value;
    //     setSelectedSupplier(supplierId);
    
    //     const selectedSupplierObj = suppliers.find(s => s._id === supplierId);
    
    //     if (selectedSupplierObj && selectedSupplierObj.products.length > 0) {
    //         setProducts(selectedSupplierObj.products);
    //         setMessage("");
    //     } else {
    //         setProducts([]);
    //         setMessage("לא נמצאו מוצרים לספק זה");
    //     }
    
    //     setOrderItems([]); 
    // };

    //adding product to the order
    const handleAddProduct = (product) => {
        setOrderItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.productId === product._id);

            if (existingItem) {
                //if the product already exists in the order, increase the quantity
                return prevItems.map((item) =>
                    item.productId === product._id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                //if the product is new, add it to the order with quantity 1
                return [...prevItems, { productId: product._id, productName:product.name, quantity: 1 }];
            }
        });
    };

    const getTotalPrice = () => {
  return orderItems.reduce((sum, item) => {
    const product = products.find(p => p._id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
};

    //updating the quantity of the product in the order
    const handleQuantityChange = (index, value) => {
        const updatedItems = [...orderItems];
        updatedItems[index].quantity = value;
        setOrderItems(updatedItems);
    };

    const mutation = useMutation({
        mutationFn: createOrderApi,
        onError: (error) => {
            setMessage("Error " + error);
        }
    });

    const handleSubmit = async (e) => {
        setMessage(""); //reset previous message
        e.preventDefault();
        if (!selectedSupplier || orderItems.length === 0) {
            toast.error("Please select a supplier and add products to the order");
            return;
        }


        const selectedSupplierObj = suppliers.find(s => s._id === selectedSupplier);
        const supplierName = selectedSupplierObj ? selectedSupplierObj.companyName : "";
       
       
        let hasError = false; // check if there is an error in the quantity
        // check if the quantity is less than the minimum quantity
        orderItems.map(item => {
            const product = products.find(p => p._id === item.productId);
            if (product) {
                if (item.quantity < product.minQuantity) {
                    setMessage("The minimum units to order for " + product.name + " is " + product.minQuantity);
                    hasError = true;
                    return; 
                }
            }
        });
    
        // if there is an error, do not send the order
        if (hasError) {
            return;
        }
  // הוספת minQuantity לכל פריט
    const itemsWithMinQuantity = orderItems.map(item => {
        const product = products.find(p => p._id === item.productId);
        return {
            ...item,
            minQuantity: product?.minQuantity || 1 // ברירת מחדל 1 אם לא קיים
        };
    });


        const orderData = { supplierId: selectedSupplier, supplierName: supplierName, items: orderItems };

        try {
            await mutation.mutateAsync({ orderData, token }); // send the order
    toast.success("ההזמנה נשלחה בהצלחה!");

        } catch (error) {
            setMessage("Error: " + error);
            toast.error("התרחשה שגיאה בשליחת ההזמנה");
    }
        
    };

    if (isLoading) return <p>Loading suppliers...</p>;
    if (error) return <p>Error loading suppliers: {error.message}</p>;

    return (
        <div className="order-container">
            <h2 className="order-title">add order</h2>
            {mutation.isSuccess && <p className="success">The order has been successfully added!</p>}
            {message && <p className="status-message">{message}</p>}
            <form className="order-form" onSubmit={handleSubmit}>
                <label style={{textAlign:"left"}} className="order-label">Select supplier</label>
<div className="supplier-buttons">
  {suppliers?.map(supplier => (
    <button
      key={supplier._id}
      className={`supplier-btn ${selectedSupplier === supplier._id ? "selected" : ""}`}
      onClick={() => handleSupplierSelect(supplier._id)}
    >
      {supplier.companyName}
    </button>
  ))}
</div>

                             {/* <select
                    className="order-select"
                    value={selectedSupplier}
                    onChange={handleSupplierChange}
                    required
                >
                    <option value="">select supplier</option>
                    {suppliers?.map(supplier => (
                        <option key={supplier._id} value={supplier._id}>
                            {supplier.companyName}
                        </option>
                    ))}
                </select> */}
{selectedSupplier && (
  <>
    {selectedSupplier && (
  <h3 className="products-title">
    Products available from the supplier:{" "}
    {
      suppliers.find((s) => s._id === selectedSupplier)?.companyName || ""
    }
  </h3>
)}
    <div className="available-products">
      {products.map(product => (
        <div key={product._id} className="product-item">
          <span className="product-name">{product.name} - ₪{product.price}</span>
          <button
            type="button"
            className="btn-add"
            onClick={() => handleAddProduct(product)}
          >
            add product
          </button>
        </div>
      ))}
    </div>
  </>
)}

        {orderItems.length > 0 && (
  <>
    <h3 className="order-details-title">Order details</h3>
    <table className="order-table">
  <thead>
    <tr>
      <th>מוצר</th>
      <th>כמות</th>
      <th>סה״כ</th>
    </tr>
  </thead>
  <tbody>
    {orderItems.map((item, index) => {
      const product = products.find(p => p._id === item.productId);
      return (
        <tr key={item.productId}>
          <td>{product?.name}</td>
          <td>
            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={(e) =>
                handleQuantityChange(index, Number(e.target.value))
              }
            />
          </td>
          <td>₪{(product?.price * item.quantity).toFixed(2)}</td>
        </tr>
      );
    })}
  </tbody>
</table>
    <p className="total-price">
   Total order price: ₪{getTotalPrice().toFixed(2)}
</p> 
<button
  type="submit"
  className="btn-primary"
  disabled={!selectedSupplier || orderItems.length === 0}
>
  send order
</button>  </>
)} 


 </form>

        </div>
    );

};
export default ProductList;