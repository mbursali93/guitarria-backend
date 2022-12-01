const jwt = require("jsonwebtoken");
const User = require("../models/User")





const verifyUser = (req,res,next) => {
    try {
        const token = req.header("Authorization")
        if(!token) return res.status(500).json("No token to be found")
        jwt.verify(token, process.env.JWT_ACCESS, (err,user) => {
            if(err) return res.status(500).json(err.message)
            req.user = user
            next()
    })
    } catch{

    }
    
}

const verifyAdmin = async (req,res,next) => {
    try {
        const user = await User.findOne({
            _id:req.user.id
        })

        if(!user.isAdmin) {
            res.status(500).json("You are not the admin")
            next()
        }
    } catch(e){
        res.status(500).json(e.message)
    }
}

module.exports = {verifyUser, verifyAdmin}
