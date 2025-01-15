const express = require('express');
const router = express.Router();

module.exports = (connection) => {
        router.post('/insert/farm', (req, res) => {
            const { name_farm, tumbol, district, province, detail, lat, lng, mid } = req.body;
        
            // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
            if (!name_farm || !tumbol || !district || !province || !mid) {
                return res.status(400).json({ message: "Required fields are missing" });
            }
        
            // คำสั่ง SQL สำหรับเพิ่มข้อมูลฟาร์ม
            const insertQuery = `
                INSERT INTO farm (name_farm, tumbol, district, province, detail, lat, lng, mid) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
        
            connection.query(insertQuery, [name_farm, tumbol, district, province, detail, lat, lng, mid], (err, result) => {
                if (err) {
                    console.error("Error inserting farm:", err);
                    return res.status(500).json({ message: "Failed to insert farm" });
                }
        
                // ตอบกลับพร้อมข้อมูล `fid` ที่ถูกเพิ่ม
                res.status(201).json({
                    message: "Farm added successfully!",
                    farmId: result.insertId, // `insertId` คือค่า `fid` ที่เพิ่งถูกเพิ่ม
                });
            });
    });

    router.get('/farms/:mid', (req, res) => {
        const mid = req.params.mid; // ดึงค่า mid จาก URL parameter
    
        // ตรวจสอบว่า mid มีค่าไหม
        if (!mid) {
            return res.status(400).json({ message: "mid is required" });
        }
    
        // คำสั่ง SQL สำหรับค้นหาฟาร์มที่มี mid เดียวกัน
        const selectQuery = `
            SELECT * FROM farm 
            WHERE mid = ?
        `;
    
        connection.query(selectQuery, [mid], (err, result) => {
            if (err) {
                console.error("Error fetching farms:", err);
                return res.status(500).json({ message: "Failed to fetch farms" });
            }
    
            // ถ้าไม่พบข้อมูลฟาร์ม
            if (result.length === 0) {
                return res.status(200).json({ 
                    message: "No farms found for the given mid", 
                    farms: null // ส่งค่า null ถ้าไม่พบข้อมูล
                });
            }
    
            // ส่งข้อมูลฟาร์มที่พบกลับไป
            res.status(200).json({
                message: "Farms fetched successfully",
                farms: result, // ส่งข้อมูลฟาร์มทั้งหมดที่ตรงกับ mid
            });
        });
    });
    
    

    router.put('/update/farm/:fid', (req, res) => {
        const { fid } = req.params;  // รับ `fid` จาก URL params
        const { name_farm, tumbol, district, province, detail, lat, lng } = req.body;
    
        // ตรวจสอบว่ามีข้อมูลที่จำเป็นครบถ้วนหรือไม่
        if (!name_farm || !tumbol || !district || !province) {
            return res.status(400).json({ message: "Required fields are missing" });
        }
    
        // คำสั่ง SQL สำหรับอัปเดตข้อมูลฟาร์ม
        const updateQuery = `
            UPDATE farm 
            SET name_farm = ?, tumbol = ?, district = ?, province = ?, detail = ?, lat = ?, lng = ? 
            WHERE fid = ?
        `;
    
        connection.query(updateQuery, [name_farm, tumbol, district, province, detail, lat, lng, fid], (err, result) => {
            if (err) {
                console.error("Error updating farm:", err);
                return res.status(500).json({ message: "Failed to update farm" });
            }
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Farm not found" });
            }
    
            // ตอบกลับว่าอัปเดตข้อมูลสำเร็จ
            res.status(200).json({
                message: "Farm updated successfully!",
            });
        });
    });

    router.delete('/delete/farm/:fid', (req, res) => {
        const { fid } = req.params;  // รับ `fid` จาก URL params
    
        // คำสั่ง SQL สำหรับลบข้อมูลฟาร์ม
        const deleteQuery = `DELETE FROM farm WHERE fid = ?`;
    
        connection.query(deleteQuery, [fid], (err, result) => {
            if (err) {
                console.error("Error deleting farm:", err);
                return res.status(500).json({ message: "Failed to delete farm" });
            }
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Farm not found" });
            }
    
            // ตอบกลับว่าได้ลบข้อมูลฟาร์มสำเร็จ
            res.status(200).json({
                message: "Farm deleted successfully!",
            });
        });
    });
    

    return router;
};