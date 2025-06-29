import jwt from "jsonwebtoken";

// login owner
export const loginGroceryOwner = async (req, res) => {
    const { name, password } = req.body;

    // console.log("מה הגיע מהקליינט:", name, password);
    // console.log("מה הגיע מה .env :", process.env.GROCERYOWNER_NAME, process.env.GROCERYOWNER_PASSWORD);
     try {
        if (name !== process.env.GROCERYOWNER_NAME || password !== process.env.GROCERYOWNER_PASSWORD) {
            return res.status(400).json({ message: "One of the details is incorrect, try again" });
        }

        //create a token for the owner
        const token = jwt.sign({ role: "owner" }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.status(200).json({ token, role: "owner" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
