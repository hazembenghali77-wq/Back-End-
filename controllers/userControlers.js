const User = require("../models/userSchema")
const Product = require("../models/productSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const mongoose = require("mongoose")
const Order = require("../models/orderSchema")

const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ msg: "User Exists Try To Login" })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Password Does Not Match" })
    }

    const hashedPW = await bcrypt.hash(password, 10)

    const createUser = await User.create({
      username,
      email,
      password: hashedPW
    })

    const token = jwt.sign(
      { id: createUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    return res.status(201).json({
      msg: "User Created",
      token,
      User: {
        _id: createUser._id,
        username: createUser.username,
        email: createUser.email,
        role: createUser.role
      }
    })

  } catch (err) {
    return res.status(500).json({
      msg: "Error In Authentication in /register",
      err: err.message
    })
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    const oldUser = await User.findOne({ email })
    if (!oldUser) {
      return res.status(400).json({
        msg: "User Doesn't Exist, Try To Register"
      })
    }

    const checkPW = await bcrypt.compare(password, oldUser.password)
    if (!checkPW) {
      return res.status(400).json({
        msg: "Wrong Password Try Again"
      })
    }

    const token = jwt.sign(
      { id: oldUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    )

    return res.status(200).json({
      msg: "Login Success",
      token,
      User: {
        _id: oldUser._id,
        username: oldUser.username,
        email: oldUser.email,
        role: oldUser.role
      }
    })

  } catch (err) {
    return res.status(500).json({
      msg: "Error In Authentication in /login",
      err: err.message
    })
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

const createProduct = async (req, res) => {
  try {
    const { title, description, price, image, size, category } = req.body

    // strict validation (ALL required)
    if (!title || !description || !price || !image || !size || !category) {
      return res.status(400).json({
        msg: "All fields are required: title, description, price, image, size, category"
      })
    }

    const newProduct = await Product.create({
      title,
      description,
      price,
      image,
      size,
      category
    })

    return res.status(201).json({
      msg: "Product Created",
      product: newProduct
    })

  } catch (err) {
    return res.status(500).json({
      msg: "Cant Create Product",
      err: err.message
    })
  }
}

const createOrder = async (req, res) => {
  try {
    const {
      productList,
      name,
      surname,
      phone,
      address
    } = req.body

    const ownerId = req.userId

    if (!ownerId) {
      return res.status(401).json({ msg: "Unauthorized" })
    }

    if (
      !productList ||
      !name ||
      !surname ||
      !phone ||
      !address
    ) {
      return res.status(400).json({
        msg: "All fields are required"
      })
    }

    const owner = await User.findById(ownerId)
    if (!owner) {
      return res.status(401).json({ msg: "Unauthorized user" })
    }

    const newOrder = await Order.create({
      products: productList,
      owner: ownerId,
      name,
      surname,
      email: owner.email, 
      phone,
      address
    })

    return res.status(201).json({
      msg: "Order Created",
      order: newOrder
    })

  } catch (err) {
    return res.status(500).json({
      msg: "Cant Create Order",
      err: err.message
    })
  }
}

const getUserorder = async (req, res) => {
  try {
    const userId = req.userId

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized" })
    }

    const user = await User.findById(userId).select("email")
    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    const userOrder = await Order.find({ owner: userId })

    return res.status(200).json({
      msg: "User Orders Retrieved",
      userOrder
    })

  } catch (err) {
    return res.status(500).json({
      msg: "Cant Find The Order",
      err: err.message
    })
  }
}

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await Product.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({
        msg: "Product not found"
      })
    }

    return res.status(200).json({
      msg: "Product deleted successfully"
    })

  } catch (error) {
    return res.status(500).json({
      msg: "Server error",
      error: error.message
    })
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

    return res.status(200).json({
      msg: "All Orders",
      orders
    })

  } catch (err) {
    return res.status(500).json({
      msg: "Cant Get Orders",
      err: err.message
    })
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

const getStats = async (req, res) => {
  try {
    const [totalOrders, totalProducts, totalUsers] = await Promise.all([
      Order.countDocuments(),
      Product.countDocuments(),
      User.countDocuments()
    ])

    return res.status(200).json({
      totalOrders,
      totalProducts,
      totalUsers
    })
  } catch (err) {
    return res.status(500).json({
      msg: "Error calculating stats",
      err: err.message
    })
  }
}

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await Order.findByIdAndDelete(id)

    if (!deleted) {
      return res.status(404).json({
        msg: "Order not found"
      })
    }

    return res.status(200).json({
      msg: "Order Deleted"
    })

  } catch (err) {
    return res.status(500).json({
      msg: "Cant Delete Order",
      err: err.message
    })
  }
}

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("username email")

    return res.status(200).json({
      msg: "All Users",
      users
    })

  } catch (err) {
    return res.status(500).json({
      msg: "Cant Get Users",
      err: err.message
    })
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

const LoggedInOrder = async (req, res) => {
  try {
    const userId = req.userId
    console.log("USER ID:", userId)

    const user = await User.findById(userId)
    console.log("USER FOUND:", user)

    if (!user) {
      return res.status(404).json({ msg: "User not found" })
    }

    const orders = await Order.find({ owner: user._id })
    console.log("ORDERS FOUND:", orders)

    return res.status(200).json({
      msg: "Orders Retrieved",
      orders
    })
  } catch (err) {
    console.log("ERROR:", err.message)
    return res.status(500).json({
      msg: "Cant Get Orders",
      err: err.message
    })
  }
}



module.exports = {LoggedInOrder,deleteOrder,register,login,getProduct,createProduct,createOrder,getUserorder,deleteProduct,updateProduct,getAllOrders,getTotalRevenue,getAllUsers,deleteUser,getStats}