const mongoose = require("mongoose")

const OrderSchema = new mongoose.Schema({
    user_id: {type:String, required: true},

    username: {type:String, requrired: true},

    email: {type:String, requrired: true},

    status: {type:String, default: "pending"},

    products: {type:Array, required:true},

    address: {type:Object, required:true},

    total: {type: Number, required: true}

}, {timestamps:true})

module.exports = mongoose.model("Order", OrderSchema)



