const router = require("express").Router()

const {register,login,getProduct,createProduct,createOrder,
    getUserorder,deleteProduct,updateProduct,getAllOrders,getTotalRevenue,deleteOrder,getAllUsers,deleteUser,getStats} = require("../controllers/userControlers")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/register", register)
router.post("/login", login)
router.get("/getproduct", getProduct)
router.post("/createproduct",createProduct)
router.delete("/deleteproduct/:id",deleteProduct)
router.post("/createorder",createOrder)
router.get("/getuserorder",getUserorder)
router.put("/updateproduct/:id",updateProduct)
router.get("/orders", getAllOrders)
router.get("/revenue", getTotalRevenue)
router.delete("/deleteorder/:id", deleteOrder)
router.get("/allusers", getAllUsers)
router.delete("/deleteuser/:id", deleteUser)
router.get('/stats', getStats)

module.exports = router