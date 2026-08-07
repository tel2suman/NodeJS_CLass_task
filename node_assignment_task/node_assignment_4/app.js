const express = require('express');
const path = require('path');
const connectDB = require('./app/config/db');
require('dotenv').config();

const app = express();

connectDB();

app.use(express.json());
app.use(express.urlencoded({extended:true}))

app.use('/public', express.static(path.join(__dirname, 'public')));

//user all routes
app.use("/api/v1", require("./app/routes/index"))


app.get('/', (req, res) => res.json({ success: true, message: "API is running" }));

const PORT = process.env.PORT || 6000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
