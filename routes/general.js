const express = require('express');
const router = express.Router();

module.exports = (connection) => {

    router.get('/members', (req, res) => {
        // SQL Query เพื่อค้นหาข้อมูลสมาชิกทั้งหมด
        const query = `SELECT * FROM members`;
    
        connection.query(query, (err, result) => {
            if (err) {
                console.error("Error fetching members:", err);
                return res.status(500).json({ message: "Failed to fetch members" });
            }
    
            // หากไม่พบข้อมูลในตาราง
            if (result.length === 0) {
                return res.status(404).json({ message: "No members found", rowCount: 0 });
            }
    
            // ส่งข้อมูลสมาชิกกลับไป
            res.status(200).json({ 
                message: "Members fetched successfully", 
                rowCount: result.length, 
                users: result 
            });
        });
    });
    
    router.post('/register', (req, res) => {
        const { username, email, password, phone, image, contact, address, lat, lng, mtype } = req.body;
    
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required" });
        }
    
        // ตรวจสอบว่ามี username และ email ซ้ำกับ mtype เดียวกันหรือไม่
        const checkQuery = `
            SELECT * FROM members 
            WHERE (username = ? OR email = ?) AND mtype = ?
        `;
    
        connection.query(checkQuery, [username, email, mtype], (err, result) => {
            if (err) {
                console.error("Error checking existing user:", err);
                return res.status(500).json({ message: "Failed to check user" });
            }
    
            // หากพบว่า username และ email ซ้ำกับ mtype เดียวกัน
            if (result.length > 0) {
                return res.status(400).json({
                    message: "Username and email already exist for this mtype. Cannot register duplicate account.",
                });
            }
    
            // ตรวจสอบว่ามี email ซ้ำใน mtype อื่นหรือไม่
            const checkOtherTypeQuery = `
                SELECT * FROM members 
                WHERE email = ? AND mtype != ?
            `;
    
            connection.query(checkOtherTypeQuery, [email, mtype], (err, result) => {
                if (err) {
                    console.error("Error checking other mtypes:", err);
                    return res.status(500).json({ message: "Failed to check other mtypes" });
                }
    
                // หากพบว่า email ถูกใช้ไปแล้วในอีก mtype
                if (result.length > 0 && result.length >= 2) {
                    return res.status(400).json({
                        message: "This email already has accounts with both mtypes. Cannot register more accounts with this email.",
                    });
                }
    
                // เพิ่มผู้ใช้ใหม่
                const insertQuery = `
                    INSERT INTO members (username, email, password, phone, image, contact, address, lat, lng, mtype) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
    
                connection.query(insertQuery, [username, email, password, phone, image, contact, address, lat, lng, mtype], (err, result) => {
                    if (err) {
                        console.error("Error inserting data:", err);
                        return res.status(500).json({ message: "Failed to register user" });
                    }
    
                    res.status(201).json({
                        message: "User registered successfully!",
                        userId: result.insertId,
                    });
                });
            });
        });
    });
    
    
    router.post('/login', (req, res) => {
        const { email, username, password } = req.body;
    
        // ตรวจสอบว่าให้กรอกอีเมลหรือเบอร์โทร และรหัสผ่าน
        if ((!email && !username) || !password) {
            return res.status(400).json({ message: "Email or username and password are required" });
        }
    
        // SQL Query เพื่อค้นหาผู้ใช้โดยใช้ email หรือ phone และ password
        const query = `SELECT * FROM members WHERE (email = ? OR username = ?) AND password = ?`;
    
        connection.query(query, [email, username, password], (err, result) => {
            if (err) {
                console.error("Error checking login:", err);
                return res.status(500).json({ message: "Failed to login" });
            }
    
            // หากไม่พบผู้ใช้
            if (result.length === 0) {
                return res.status(400).json({ message: "Invalid email/phone or password", rowCount: 0 });
            }
    
            // ส่งจำนวนแถว (rowCount) และข้อมูลผู้ใช้ (users)
            res.status(200).json({ message: "Login successful", rowCount: result.length, users: result });
        });
    });

    return router;
};