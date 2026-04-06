const router = require("express").Router()
const {searchProducts} = require("../controllers/productControles.js")

router.get("/products", searchProducts)

module.exports = router
