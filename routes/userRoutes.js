const router = require("express").Router()

const {register,login,getProduct,createProduct,createOrder,getUserorder} = require("../controllers/userControlers")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/register", register)
router.post("/login", login)
router.get("/getproduct", getProduct)
router.post("/createproduct",createProduct)
router.post("/createorder",authMiddleware,createOrder)
router.get("/getuserorder",authMiddleware,getUserorder)

module.exports = router