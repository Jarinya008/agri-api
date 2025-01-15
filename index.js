const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// เชื่อมต่อฐานข้อมูล
const connection = mysql.createConnection({
    host: '202.28.34.197',
    user: 'web66_65011212021',
    password: '65011212021@csmsu',
    database: 'web66_65011212021'
});

connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL successfully");
});

// Import เส้น API
const generalRoutes = require('./routes/general')(connection);
const clientRoutes = require('./routes/client')(connection);
const contractorRoutes = require('./routes/contractor')(connection);

// ใช้เส้นทาง
app.use('/general', generalRoutes); 
app.use('/client', clientRoutes);    
app.use('/contractor', contractorRoutes); 

// เริ่มต้นเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
