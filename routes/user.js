const router = require("express").Router();
const User = require("../models/User");
const bcryptjs = require("bcryptjs")
const { verifyToken, verifyUser, verifyAdmin } = require("./verifyToken")



//GET USER
router.get("/", verifyUser, async (req,res) => {
    try {
        const user = await User.findById(req.user.id);
    if(!user) res.status(500).json("no user found with that id")
    const {password, ...others} = user._doc;
    res.status(201).json(others)
    } catch(e) {
        res.status(500).json(e.message)
    }

})


//UPDATE

router.put("/:id", verifyUser, async (req,res) => {
    if(req.body.password) {
        req.body.pasword = await bcryptjs.hash(req.body.password, 10)
    }
   
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new: true})
        res.status(200).json(updatedUser)
    } catch(e) {
        res.status(500).json(e.message)
    }
})




//UPDATE CART

router.patch("/cart", verifyUser, async(req,res) => {
    try {
        const updatedCart = await User.findOneAndUpdate({_id: req.user.id}, {
            cart: req.body.cart
        }, {new:true})
        res.status(201).json(updatedCart)
    } catch(e) {
        res.status(500).json(e.message)
    }

})




module.exports = router;