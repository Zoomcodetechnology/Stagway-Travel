const mongoose = require('mongoose')

const AdminModel = new mongoose.Schema({
    first_Name: {
        type: String,
        default: ""
    },
    last_Name: {
        type: String,
        default: ""
    },
    email: {
        type: String,
        default: "",
        unique: true,
        lowercase: true
    },
    image: {
        type: String,
        default: ""
    },
    password: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },


}, { timestamps: true })

module.exports = mongoose.model('admins', AdminModel)