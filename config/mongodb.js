import mongoose from 'mongoose';

const connectDB = async () => {
    console.log("Trying to connect to MongoDB");
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/voter`);
        console.log("Connected to MongoDB");

        mongoose.connection.on('connected' , () => {
            console.log("MongoDB Connected Suucesfully ");
        })

        mongoose.connection.on('error', (err) => {
            console.error(" MongoDb connection error  ",err )
        } )

        mongoose.connection.on('disconnected', () => {
            console.log("⚠️ MongoDB disconnected");
            });
        } catch (error) {
            console.error("❌ Error connecting to MongoDB:", error.message);
            process.exit(1);  // Exit the app if DB connection fails
        }
}

export default connectDB;