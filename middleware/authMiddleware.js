const jwt = require("jsonwebtoken")

const authMiddleware = async(req,res,next) => {
    try {
    const token = req.headers.token
    if(!token) 
        res.status(401).json({msg:"You Are Not Authorized"})
    else{
        const verifyToken = jwt.verify(token,process.env.JWT_SECRET)
        req.userId = verifyToken.id
        next()
    }
    }
    catch(err) {
               res.status(500).json({msg:"Error In Middleware"})
    }
}

module.exports = authMiddleware