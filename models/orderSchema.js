const mongoose = require("mongoose")

const orderSchema = mongoose.Schema({
    CreatedAt: { type: Date, default: Date.now },
    products: Array,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true }
})

const Order = mongoose.model("Order", orderSchema)

module.exports = Order