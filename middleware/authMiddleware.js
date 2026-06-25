const jwt = require("jsonwebtoken")

const authMiddleware = async(req,res,next) => {
    try {
    const token = req.headers.token
    console.log("TOKEN RECEIVED:", token)
    if(!token) 
    return res.status(401).json({msg:"You Are Not Authorized"})
    else{
        const verifyToken = jwt.verify(token,process.env.JWT_SECRET)
        req.userId = verifyToken.id
        next()
    }
    }
    catch(err) {
    return res.status(500).json({msg:"Error In Middleware"})
    }
}

module.exports = authMiddleware