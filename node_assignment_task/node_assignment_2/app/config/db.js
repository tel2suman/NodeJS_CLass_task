require ('dotenv').config();
const mongoose = require('mongoose');

const URL = process.env.MONGODB_URL

const connectDB = async () => {
    try {
        const connection = await mongoose.connect(URL)
        if(connection){
            console.log('MongoDB connected successfully');
        }else{
            console.log('MongoDB connection failed');
        }
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`);
    }
}

module.exports = connectDB;