import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getOrdersByStoreOwnerApi, completeOrderApi } from "../../API/OrderApi";
import "../../Styles/OrderListByGroceryOwner.css";
import { useNavigate } from "react-router-dom";

const StoreOwnerOrders = () => {
    const [message, setMessage] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filter, setFilter] = useState("all");
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/OwnerLogin");
        }
    }, [token, navigate]);

    const { data: orders, error, isLoading, refetch } = useQuery({
        queryKey: ['storeOwnerOrders'],
        refetchInterval: 60000,
        refetchOnWindowFocus: true,
        queryFn: async () => {
            const data = await getOrdersByStoreOwnerApi(token);
            return data.map((order, index) => ({
                ...order,
                serialNumber: index + 1 // מספר סידורי קבוע לפי הסדר המקורי
            }));
        },
        enabled: !!token,
    });

    const mutation = useMutation({
        mutationFn: completeOrderApi,
        onSuccess: () => {
            refetch();
        },
        onError: (error) => {
            setMessage("Error updating the status: " + error.message);
        }
    });

    const handleCompleteOrder = async (orderId, status) => {
        setMessage("");
        try {
            await mutation.mutateAsync({ orderId, status, token });
        } catch (error) {
            setMessage("Error completing order: " + error);
        }
    };

    const handleViewProducts = (orderId) => {
        const order = orders.find(order => order._id === orderId);
        setSelectedOrder(order);
    };

    // 🔽 סינון לפי סטטוס
    const filteredOrders = orders?.filter(order => {
        if (filter === "all") return true;
        return order.status === filter;
    });

    if (isLoading) return <p>Loading orders...</p>;
    if (error) return <p>Error fetching orders: {error.message}</p>;

    return (
        <div className="orders-container">
            <h2 className="orders-title">Store owner orders</h2>

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
                        <th>Supplier</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Products</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredOrders?.length === 0 ? (
                        <tr>
                            <td colSpan="6" style={{ textAlign: "center", padding: "20px", color: "#666" }}>
                                אין הזמנות להצגה
                            </td>
                        </tr>
                    ) : (
                        filteredOrders.map((order) => (
                            <tr key={order._id}>
                                <td>{order.serialNumber}</td>
                                <td>{order.supplierName || ""}</td>
                                <td>{order.createdAt.split('T')[0]} {order.createdAt.split('T')[1].slice(0, 5)}</td>
                                <td>{order.status}</td>
                                <td>
                                    <button className="view-products-btn" onClick={() => handleViewProducts(order._id)}>
                                        View products
                                    </button>
                                </td>
                                <td>
                                    {order.status === "בתהליך" && (
                                        <button
                                            className="complete-btn"
                                            onClick={() => handleCompleteOrder(order._id, "ההזמנה הושלמה")}
                                        >
                                            ההזמנה הושלמה
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {selectedOrder && selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="order-products-modal">
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
            )}
        </div>
    );
};

export default StoreOwnerOrders;
