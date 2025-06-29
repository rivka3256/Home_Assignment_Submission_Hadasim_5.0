import { useEffect, useState } from "react";
import axios from "axios";

const StockManagement = () => {
  const [stock, setStock] = useState([]);
  const [token, setToken] = useState(""); // שימי את זה לפי איך ששומרים אצלך את הטוקן

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const res = await axios.get("http://localhost:5000/stocks/getAllStock", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStock(res.data);
      } catch (err) {
        console.error("שגיאה בשליפת המלאי", err);
      }
    };

    fetchStock();
  }, [token]);

  const handleMinQuantityChange = (index, newMin) => {
    const updated = [...stock];
    updated[index].minQuantity = newMin;
    setStock(updated);
  };

  const saveChanges = async () => {
    try {
      await Promise.all(
        stock.map((item) =>
       axios.put(`http://localhost:5000/stocks/updateStockItem/${item._id}`, item, {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
        )
      );
      alert("הכמויות עודכנו בהצלחה!");
    } catch (err) {
      console.error("שגיאה בעדכון הכמויות", err);
      alert("הייתה שגיאה בשמירה 😞");
    }
  };

  return (
    <div>
      <h2>📦 ניהול סחורה</h2>
      <table>
        <thead>
          <tr>
            <th>מוצר</th>
            <th>כמות נוכחית</th>
            <th>כמות מינימלית</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item, index) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.quantity}</td>
              <td>
                <input
                  type="number"
                  value={item.minQuantity}
                  onChange={(e) =>
                    handleMinQuantityChange(index, parseInt(e.target.value))
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={saveChanges}>💾 שמור שינויים</button>
    </div>
  );
};

export default StockManagement;