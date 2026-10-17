import mongoose from 'mongoose';


const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String
});

export const usersModel = mongoose.model('Users',userSchema);
