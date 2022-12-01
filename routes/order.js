const router =require("express").Router();
const Order = require("../models/Order")
const { verifyUser, verifyAdmin } = require("./verifyToken")

//GET USER ORDERS
router.get("/", verifyUser, async (req,res) => {
    try {
        
        const order = await Order.find({user_id: req.user.id })
        res.status(200).json(order)
    } catch(e) {
        res.status(500).json(e.message)

    }

} )




//DELETE ORDER 

router.delete("/", verifyAdmin, async (req,res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.body.id)
        res.status(200).json(deletedOrder)
    } catch(e) {
        res.status(500).json(e.message)
    }

})


module.exports = router;