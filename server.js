const express = require("express")
const app = express()
const cors = require("cors")
require("dotenv").config()


app.use(express.json())
app.use(cors())
app.use("/api", require("./routes/userRoutes"))
app.use("/api", require("./routes/productRoutes"))


//data base connection 
const connectDB = require("./config/connectDB")
connectDB()






const port = process.env.PORT || 8081
app.listen(port,()=>console.log("Server Started On: ", port))