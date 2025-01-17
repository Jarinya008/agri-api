const express = require('express');
const router = express.Router();

module.exports = (connection) => {
    router.post('/insert/tract', (req, res) => {
        const { name_tract, amount, price, image, mid} = req.body;
    
        // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
        if (!name_tract || !amount || !price || !image || !mid) {
            return res.status(400).json({ message: "Required fields are missing" });
        }
    
        // คำสั่ง SQL สำหรับเพิ่มข้อมูลฟาร์ม
        const insertQuery = `
            INSERT INTO tracts (name_tract, amount, price, image, mid) 
            VALUES (?, ?, ?, ?, ?)
        `;
    
        connection.query(insertQuery, [name_tract, amount, price, image, mid], (err, result) => {
            if (err) {
                console.error("Error inserting tract:", err);
                return res.status(500).json({ message: "Failed to insert tract" });
            }
    
            // ตอบกลับพร้อมข้อมูล `fid` ที่ถูกเพิ่ม
            res.status(201).json({
                message: "tract added successfully!",
                tractId: result.insertId, // `insertId` คือค่า `fid` ที่เพิ่งถูกเพิ่ม
            });
        });
});

    return router;
};