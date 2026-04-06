const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    CreatedAt:{type:Date , default: Date.now},
    products:Array,
    owner:{type:mongoose.Schema.Types.ObjectId , ref:"User"},
})

const Order = mongoose.model( "Order", orderSchema)

module.exports = Order