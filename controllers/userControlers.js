const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const Order = require("../models/orderSchema")

const register = async (req,res) => {
  try {
     const {username,email,password} = req.body
     const newUser = await User.findOne({email})
     if(newUser) return res.status(400).json({msg:"User Exists Try To Login"})
        else {
               const hashedPW = await bcrypt.hash(password , 10)
               const createUser = await User.create({username,email,password:hashedPW})
               const token = jwt.sign({id:createUser._id}, process.env.JWT_SECRET, {expiresIn :"7d"})
               res.status(201).json({msg:"User Created" , token:token , User:createUser})
        }
  }
  catch(err) {
     res.status(500).json({msg:"Error In Authentification in /register" , err:err.message})
  }
}

const login = async (req,res) => {
  try {
     const {email,password} = req.body
     const oldUser = await User.findOne({email})
     if(!oldUser) res.status(400).json({msg:"User Doens't Match Try To Register"})
        else {
               const checkPW = await bcrypt.compare(password , oldUser.password)
               if(!checkPW) return res.status(400).json({msg:"Wrong Password Try Again"})
               const token = jwt.sign({id:oldUser._id}, process.env.JWT_SECRET, {expiresIn :"7d"})
               res.status(201).json({msg:"Login Success" , token:token , User:oldUser})
        }
  }
  catch(err) {
     res.status(500).json({msg:"Error In Authentification in /login" , err:err.message})
  }
}

const getProduct = async (req,res) => {
  try {
     const products = await Product.find()
    res.status(201).json({msg:"Get Products" , Product:products})
        
  }
  catch(err) {
     res.status(500).json({msg:"Cant Get Products" , err:err.message})
  }
}

const createProduct = async (req,res) => {
  try {
   const {title,description,price,image,size,category} = req.body
   const newProduct = await Product.create(req.body)
   res.status(201).json({msg:"Product Created" , product:newProduct})
  }
  catch(err) {
     res.status(500).json({msg:"Cant Create Product" , err:err.message})
  }
}

const createOrder = async (req,res) => {
   try {
       const {userId,productList,name, surname, email, phone, address} = req.body 
       const newOrder = await Order.create({products:productList,owner:userId,name:name, surname:surname, email:email, phone:phone,
         address:address})
       res.status(201).json({msg:"Order Created" , order:newOrder})
       

   }
   catch(err) {
     res.status(500).json({msg:"Cant Create Order" , err:err.message})

   }
}

const getUserorder = async(req,res) => {
   try {
   const userId = req.body
   const userOrder = await Order.find({owner:userId})
   res.status(201).json({msg:"All Orders Gatherd" , userOrder:userOrder})
   }
   catch(err) {
          res.status(500).json({msg:"Cant Find The Order" , err:err.message})
   }
}

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.body

    const deleted = await Product.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params
    const updated = await Product.findByIdAndUpdate(id, req.body, { new: true })
    if (!updated) return res.status(404).json({ message: "Product not found" })
    res.json({ message: "Product updated successfully", product: updated })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
    res.status(200).json({ msg: "All Orders", orders: orders })
  } catch(err) {
    res.status(500).json({ msg: "Cant Get Orders", err: err.message })
  }
}

const getTotalRevenue = async (req, res) => {
  try {
    const orders = await Order.find()
    const totalRevenue = orders.reduce((sum, order) => {
      if (order.status && ["cancelled", "refunded"].includes(order.status)) return sum
      const orderTotal = (order.products || []).reduce((s, item) => {
        const price = Number(item.price) || 0
        const qty = Number(item.quantity) || 0
        return s + price * qty
      }, 0)
      return sum + orderTotal
    }, 0)

    res.status(200).json({ totalRevenue })
  } catch (err) {
    res.status(500).json({ msg: "Error calculating revenue", err: err.message })
  }
}

const deleteOrder = async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id)
    res.status(200).json({ msg: "Order Deleted" })
  } catch(err) {
    res.status(500).json({ msg: "Cant Delete Order", err: err.message })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email")
    res.status(200).json({ msg: "All Users", users: users })
  } catch(err) {
    res.status(500).json({ msg: "Cant Get Users", err: err.message })
  }
}

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await User.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ msg: "User not found" })
    }
    res.status(200).json({ msg: "User deleted successfully" })
  } catch(err) {
    res.status(500).json({ msg: "Cant Delete User", err: err.message })
  }
}

const getStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments()
    const totalProducts = await Product.countDocuments()
    const totalUsers = await User.countDocuments()
    res.status(200).json({ totalOrders, totalProducts, totalUsers })
  } catch(err) {
    res.status(500).json({ msg: "Cant Get Stats", err: err.message })
  }
}

module.exports = {getStats,deleteOrder,register,login,getProduct,createProduct,createOrder,getUserorder,deleteProduct,updateProduct,getAllOrders,getTotalRevenue,getAllUsers,deleteUser}