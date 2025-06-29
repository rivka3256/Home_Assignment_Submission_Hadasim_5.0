import Order from "../Models/Orders.js";
import Stock from "../Models/Stock.js";
import Suppliers from "../Models/Suppliers.js";
//by suppliers
export const getOrdersBySupplier = async (req, res) => { 
    try {
        const orders = await Order.find({ supplierId: req.user.id }) 
        res.status(200).json(orders); 
    } catch (error) {// אם הוא לא מוצא הזמנות של הספק המחובר הוא נותן שגיאה
        res.status(500).json({ message: error.message });
    }
};

//by Grocery Owner
export const getOrdersByGroceryOwner = async (req, res) => {
    try {
        console.log("Orders for Grocery Owner...");
        const orders = await Order.find()// כל ההזמנות
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//add -new order
export const createNewOrder = async (req, res) => {
                        console.log("📥 כל הבקשה שהגיעה מהקליינט:", req.body);
                        const { supplierId, supplierName, items } = req.body;
                    console.log("📦 הזמנה חדשה:", { supplierId, supplierName, items });
    if (!items || items.length === 0) {
        return res.status(400).json({ message: "orders must include products" });
    }

    // שולפים את הספק מהמסד כדי לגשת למוצרים והמחירים
const supplier = await Suppliers.findById(supplierId);
if (!supplier) {
  return res.status(404).json({ message: "Supplier not found" });
}
console.log("🔍 supplierId שהתקבל:", supplierId);

// בונים מחדש את items עם המחיר לכל מוצר
// const itemsWithPrice = items.map((item) => {
//   const productFromSupplier = supplier.products.find(
//     (p) => p.name === item.productName
//   );

//   return {
//     ...item,
//     price: productFromSupplier ? productFromSupplier.price : 0 // או תייצרי שגיאה אם לא נמצא
//   };
// });
console.log("📋 supplier.products:", supplier.products);

const itemsWithPrice = items.map((item) => {
  const productFromSupplier = supplier.products.find(
    (p) => p.name === item.productName
  );

  if (!productFromSupplier) {
    throw new Error(`המוצר "${item.productName}" לא קיים אצל הספק`);
  }

  // 🔍 הדפסה לזיהוי ודאי
  console.log("📦 פריט מהספק לפני שמירה:", productFromSupplier);



  return {
    ...item,
    price: productFromSupplier.price,
    minQuantity: productFromSupplier.minQuantity  // ⬅️ שימי לב לזה!
  };
});
console.log("✅ פריטים עם מחירים ומינימום:", itemsWithPrice);
    try {
        const newOrder = new Order({
            supplierId,
            supplierName,
            items: itemsWithPrice,
            status: "ממתין",  
        });

        await newOrder.save();

        for (const item of newOrder.items) {//תוספת לבונוס, עדכון המלאי
            const stockItem = await Stock.findOne({ name: item.productName });
            if (stockItem) {
                stockItem.quantity += item.quantity;
                await stockItem.save();
            }
        }
        
console.log("🎯 -------פריטים להזמנה כולל minQuantity:", newOrder.items);
for (const item of newOrder.items) {
  const stockItem = await Stock.findOne({ name: item.productName });

  if (stockItem) {
    stockItem.quantity += item.quantity;
    await stockItem.save();
  } else {
    const newStock = new Stock({
      name: item.productName,
      quantity: item.quantity,
      minQuantity: item.minQuantity // ⬅️ זה יעבוד כי שמרנו את זה קודם!
    });
    await newStock.save();
  }
}


        res.status(201).json(newOrder);
    } catch (error) {
        // res.status(500).json({ message: error.message });
  console.error("❌ שגיאה ביצירת הזמנה:", error); // ⬅️ מדפיס את כל השגיאה
  res.status(500).json({ message: error.message });

    }
};

// update order status to "ההזמנה הושלמה"
export const completeOrder = async (req, res) => {
    const { id } = req.params;
    try {
        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        order.status = "ההזמנה הושלמה"; 
        await order.save();
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// update order status to "בתהליך"
// export const confirmOrder = async (req, res) => {
//     const { id } = req.params;
//     try {
//         const order = await Order.findById(id);
//         if (!order) return res.status(404).json({ message: "Order not found" });
//         console.log("order", order); 
//         order.status = "בתהליך"; 
//         console.log("🧾 order items:", order.items);
//         await order.save();
//         res.status(200).json(order);
//     } catch (error) {
//   console.error("🔥 שגיאה בעדכון סטטוס להזמנה:", error);
//   res.status(500).json({ message: error.message });
// }
// };
export const confirmOrder = async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    for (let item of order.items) {
      if (item.minQuantity === undefined) {
        item.minQuantity = 0;
      }
    }

    order.status = "בתהליך";
    await order.save();
    res.status(200).json(order);
  } catch (error) {
    console.error("🔥 שגיאה בעדכון סטטוס להזמנה:", error);
    res.status(500).json({ message: error.message });
  }
};