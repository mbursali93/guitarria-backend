const express = require("express")
const app = express();
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const cors = require("cors")
dotenv.config()
const cookieParser = require("cookie-parser")



const authRoute = require("./routes/auth")
const userRoute = require("./routes/user")
const productRoute = require("./routes/product")
const orderRoute = require("./routes/order")
const stripeRoute = require("./routes/stripe")


app.use(express.json())
app.use(cors({
    credentials: true,
    origin:[process.env.THE_BACK_LINK, process.env.THE_FRONT_LINK]
    }))
    
app.use(cookieParser(process.env.THE_COOKIE_SECRET))


app.use("/api/auth", authRoute)
app.use("/api/users", userRoute)
app.use("/api/products", productRoute)
app.use("/api/orders", orderRoute)
app.use("/api/stripe", stripeRoute)








mongoose.connect(process.env.MONGO_URL).then(() => console.log("database connection is successfull")).catch((e) => console.log(e.message))



app.listen(process.env.PORT || 9000, () => console.log("server is running"))