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
   const {title,description,price,image} = req.body
   const newProduct = await Product.create(req.body)
   res.status(201).json({msg:"Product Created" , product:newProduct})
  }
  catch(err) {
     res.status(500).json({msg:"Cant Create Product" , err:err.message})
  }
}

const createOrder = async (req,res) => {
   try {
       const {userId,productList} = req.body 
       const newOrder = await Order.create({products:productList,owner:userId})
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

module.exports = {register,login,getProduct,createProduct,createOrder,getUserorder}