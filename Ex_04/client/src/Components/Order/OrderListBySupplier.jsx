import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getOrdersBySupplierApi, updateOrderStatusApi } from "../../API/OrderApi";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const SupplierOrders = () => {
    const [message, setMessage] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    if (token) {
        const decoded = jwtDecode(token);
        const role = decoded.role;
    } else {
        console.warn("⚠️ טוקן לא קיים — המשתמש לא מחובר");
    }

    useEffect(() => {
        if (!token) {
            navigate("/SupplierLogin");
        }
    }, [token, navigate]);

    const decodedToken = jwtDecode(token);
    const supplierId = decodedToken._id;

    const { data: orders, error, isLoading, refetch } = useQuery({
        queryKey: ['orders', supplierId],
        queryFn: async () => {
            const data = await getOrdersBySupplierApi(token);
            return data.map((order, index) => ({
                ...order,
                serialNumber: index + 1
            }));
        },
        refetchInterval: 60000,
        refetchOnWindowFocus: true,
        enabled: !!token,
    });

    useEffect(() => {
        refetch();
    }, [filter]);

    const mutation = useMutation({
        mutationFn: updateOrderStatusApi,
        onSuccess: () => {
            refetch();
        },
        onError: (error) => {
            setMessage("Error updating the status:" + error.message);
        }
    });

    const handleStartProcessingOrder = async (orderId, status) => {
        setMessage("");
        try {
            await mutation.mutateAsync({ orderId, status, token });
        } catch (error) {
            setMessage("Error starting order processing: " + error.message);
        }
    };

    // ✨ פונקציית סינון לפי סטטוס
    const filteredOrders = orders?.filter((order) => {
        if (filter === "all") return true;
        return order.status === filter;
    });

    if (isLoading) return <p>Loading orders...</p>;
    if (error) return <p>Error fetching orders: {error.message}</p>;

    return (
        <div className="orders-container">
            <h2 className="orders-title">Supplier orders</h2>

              {/* 🔽 כפתורי סינון */}
            <div className="filter-buttons">
                <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>
                    כל ההזמנות
                </button>
                <button className={filter === "ממתין" ? "active" : ""} onClick={() => setFilter("ממתין")}>
                    הזמנות בהמתנה
                </button>
                <button className={filter === "בתהליך" ? "active" : ""} onClick={() => setFilter("בתהליך")}>
                    הזמנות בתהליך
                </button>
                <button className={filter === "ההזמנה הושלמה" ? "active" : ""} onClick={() => setFilter("ההזמנה הושלמה")}>
                    הזמנות שהושלמו
                </button>
            </div>

            {mutation.isSuccess && <p className="success">The status has been updated successfully!</p>}
            {message && <p className="status-message">{message}</p>}

            <table className="orders-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Products</th>
                        <th>Is it completed?</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders?.length === 0 ? (
                        <tr>
                            <td colSpan="5" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                There are no orders to display
                            </td>
                        </tr>
                    ) : (
                        filteredOrders.map((order) => (
                            <tr key={order._id}>
                                <td>{order.serialNumber}</td>
                                <td>{new Date(order.createdAt).toLocaleString("he-IL")}</td>
                                <td>{order.status}</td>
                                <td>
                                    <button
                                        className="view-products-btn"
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        View products
                                    </button>
                                </td>
                                <td>
                                    {order.status}
                                    {order.status === "ממתין" && (
                                        <button
                                            className="complete-btn"
                                            onClick={() => handleStartProcessingOrder(order._id, "בתהליך")}
                                        >
                                            Start process
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {selectedOrder && selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="order-products-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Products on order</h3>
                        <ul>
                            {selectedOrder.items.map((item, index) => (
                                <li key={index}>
                                    {item.productName} - {item.quantity} quantities
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setSelectedOrder(null)}>close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierOrders;
