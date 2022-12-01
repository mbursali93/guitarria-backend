const mongoose = require("mongoose")

const ProductSchema = new mongoose.Schema(
    {
        title: { type:String, required:true, unique: true },
        desc: { type:String, required:true },
        img: {type: String, required:true },
        brand:{ type: String, required:true },
        color: {type: Array },
        inStock:{type: Number, required:true},
        sold: {type: Number, default:0}, 
        price: {type: Number, required: true}
    },{timestamps:true}
);

module.exports = mongoose.model("Product", ProductSchema);

