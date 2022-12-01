const router = require("express").Router();
const Product = require("../models/Product");
const { verifyAdmin } = require("./verifyToken");

//GET ALL PRODUCTS
router.get("/", async (req,res) => {
    
    const search = req.query.search || "";
    let filter = req.query.filter || "";
    const sort = req.query.sort;
    const page = parseInt(req.query.page) -1 || 0;
    const limit = parseInt(req.query.limit);

    //SORTINGS ADJUST

    let sortOption;

    if(sort==="popular") {
        sortOption = { sold: -1}

    } else if(sort === "descending") {
        sortOption = {price: -1}
    } else if(sort ==="ascending")
        sortOption = {price: 1}
    else {
        sortOption = {createdAt: -1}
        }
    
    //FILTER ADJUST
    const allBrands = ["LSD", "EOH", "Gerson", "Bender", "Deen", "Earphone"]
    
    filter === "" ? (filter =[...allBrands]) : (filter= req.query.filter.split(","));



    try {
        const products = await Product.find(
            {title: {$regex: search, $options:"i"}}).where("brand").in(filter)
            .sort(sortOption).skip(page*limit).limit(limit)

        const pageNumber = await Product.countDocuments({
            brand: { $in: [...filter] },
            title: { $regex: search, $options: "i" },
            });

        res.status(200).json({products,pageNumber})

        
    } catch(e) {
        res.status(500).json(e.message)
    }
})


//GET PRODUCT

router.get("/:id", async (req,res) => {
    try {
        const product = await Product.findById(req.params.id)
        res.status(200).json(product)
    } catch(e) {
        res.status(500).json(e.message)

    }
})


//CREATE PRODUCT

router.post("/", verifyAdmin, async (req,res) => {
    const newProduct = new Product(req.body)
    try {
        const savedProduct = await newProduct.save()
        res.status(200).json(savedProduct)
    } catch(e) {
        res.status(500).json(e.message)
    }

})


//UPDATE PRODUCT

router.put("/:id", verifyAdmin, async (req,res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, {
            $set: req.body
        }, {new:true})
        res.status(200).json(updatedProduct)
    } catch(e) {
        res.status(500).json(e.message)
    }
})

//DELETE PRODUCT

router.delete("/:id", verifyAdmin, async (req,res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id)
        res.status(200).json(`${deletedProduct.title} has been deleted`) 
    } catch(e) {
        res.status(500).json(e.message)
    }    
})





module.exports = router