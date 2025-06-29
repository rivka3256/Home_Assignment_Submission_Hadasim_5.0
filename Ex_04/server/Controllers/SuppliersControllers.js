import Suppliers from "../Models/Suppliers.js";
import jwt from "jsonwebtoken";

const SuppliersController = {

// new supplier registration
  registerSupplier: async (req, res) => {
    console.log("Registering supplier...");
    console.log(req.body);

    const { companyName, phoneNumber, representativeName, password, products } = req.body;
    const existingSupplier = await Suppliers.findOne({ phoneNumber });
    if (existingSupplier) {
        return res.status(400).json({ message: "The phone number is already registered in the system" });
    }

    try {

        const newSupplier = new Suppliers({
            companyName,
            phoneNumber,
            representativeName,
            password,
            products  
        });

        await newSupplier.save();

        //create a token for the new supplier
        const token = jwt.sign({ id: newSupplier._id, role: "supplier" }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.status(201).json({ token });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
},

// התחברות
    loginSupplier: async (req, res) => {
        try {
console.log("📥 קיבלנו מהקליינט:", req.body);
            const { companyName, password } = req.body; 

             console.log("suppliername received:", companyName);
            const n=companyName;
            console.log(n);
            const supplier = await Suppliers.findOne({companyName:companyName});
                         console.log("supplier:", supplier);

            if (!supplier) return res.status(404).json({ message: "suppliername does not exist" });

              if (supplier.password !== password) {
            return res.status(400).json({ message: "problem whis passwor" });
        }
         
            //    const isMatch =id==user.id;  
                        // if (!isMatch) return res.status(400).json({ message: "No password exists." });

            //  const isMatch = await bcrypt.compare(password, supplier.password); 
            // if (!isMatch) return res.status(400).json({ message: "Invalid credentials2" });

            // const token = jwt.sign(
            //     { id: supplier._id },
            //      process.env.JWT_SECRET, 
            //     { expiresIn: "1h" }
            // );

                 const token = jwt.sign(
                { id: supplier._id, role: "supplier" },
                process.env.JWT_SECRET,
                { expiresIn: "1h" }
                );
                // console.log("תפקיד המשתמש מתוך הטוקן:", req.user.role);
                console.log("📦 תוכן הטוקן:", { id: supplier._id, role: "supplier" });
            res.json({ message: "Login successful", token });
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
         
      },
  


//get all suppliers
getSupplier: async (req, res) => {
    try {
        console.log("Getting suppliers...");
        const suppliers = await Suppliers.find();
        res.status(200).json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
  };
 export default SuppliersController;