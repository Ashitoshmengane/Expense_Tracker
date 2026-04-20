import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect("mongodb+srv://ashitoshmengane7_db_user:0kmabhCPfxiv34Au@cluster0.61wz0nr.mongodb.net/Expense")
    .then(()=> console.log('DB CONNECTED'))
}