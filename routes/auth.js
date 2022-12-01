const router = require("express").Router();
const User = require("../models/User");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");


//REGISTER

router.post("/register", async (req,res) => {

    try {
        const hashedPassword = await bcryptjs.hash(req.body.password, 10)
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword
        })

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);

    } catch(e){
        res.status(500).json(e.message)
    }

});


//LOGIN

router.post("/login", async (req,res )=> {
    try {
        const user = await User.findOne({username: req.body.username})
        if(!user) {
            res.status(401).json("Username cannot be found")
        }
        else if (!await bcryptjs.compare(req.body.password,user.password)) {
            res.status(401).json("Wrong password")
        } else {

            const accessToken = jwt.sign({
                id: user._id,
                isAdmin : user.isAdmin
            }, process.env.JWT_ACCESS , {expiresIn:"11m"});

            const refreshToken = jwt.sign({
                id:user._id,
                isAdmin: user.isAdmin    
            },process.env.JWT_REFRESH, {expiresIn:"7d"});

            res.cookie('refreshToken', refreshToken, {
                httpOnly:true,
                path: '/',
                maxAge: 1000*60*60*24*7, // 7 days
               
            })


            const {password, ...others} = user._doc

            res.status(201).json({...others, accessToken})
        }

    } catch(e) {
        res.status(500).json(e.message)
    }

})

//LOGOUT 

router.get("/logout", async (req,res) => {
    try {
        res.clearCookie("refreshToken", {path:"/"})
        res.status(200).json("Logged out")
    } catch(e) {
        res.status(500).json(e.message)
    }
})

//REFRESH TOKEN

router.get("/refresh_token", async (req,res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if(!refreshToken) res.status(500).json("Please register oR login");

        else {
            jwt.verify(refreshToken, process.env.JWT_REFRESH, (err,user) => {
                if(err) res.status(500).json("Verification Failed!")
    
                const accessToken = jwt.sign({
                    id: user.id,
                    isAdmin: user.isAdmin
                }, process.env.JWT_ACCESS, {expiresIn:"11m"})
    
                res.status(200).json(accessToken)
            })
        }

    } catch(e) {

        res.status(500).json(e.message)
    }

})


module.exports = router;