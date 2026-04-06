const Product = require("../models/productSchema")

const searchProducts = async(req, res) => {
    try {
        const searchQuery = req.query.search || ""
        const products = await Product.find({
            title: { $regex: searchQuery, $options: "i" }
        })
        res.status(200).json({products})
    } catch(error) {
        res.status(500).json({message: error.message})
    }
}

module.exports = {searchProducts}