const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await mongoose.connect(process.env.MONGO_URI,);
        console.log("MongoDB Connected");
      } catch (error) {
        console.log("Error in DB Connection", error);
      }
}


module.exports = connectToDatabase
