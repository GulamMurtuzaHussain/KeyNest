import mongoose from "mongoose";

const passwordsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    site: String,
    username: String,
    password: String,
    encryptIV: String
});

export const passwordsModel = mongoose.model("Password",passwordsSchema);