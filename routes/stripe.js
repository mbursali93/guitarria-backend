const express = require("express")
const router = express.Router()
const stripe = require("stripe")(process.env.STRIPE_SK)
const { verifyUser } = require("./verifyToken")
const Order = require("../models/Order") 
const Product = require("../models/Product")
const User = require("../models/User")


//STRIPE PAYMENT

router.post('/checkout', async (req, res) => {
    const cart = req.body.cart;
    let totalPrice;

    for(let i=0; i<cart.length; i++) {

      const product = await Product.findById(cart[i].product._id)
      cart[i].product.price = product.price

    }



    const customer = await stripe.customers.create({
      metadata:{
        user_id: req.body.user_id,
        cart: cart.toString()
      }
    })
    const line_items = cart.map(item => {
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                  name: item.product.title,
                  description: item.product.desc,
                  
                },
                unit_amount: item.product.price * 100,
              },
              quantity: item.quantity,
        
    }

    })

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
    shipping_address_collection: {
      allowed_countries: ['US', 'CA'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 0,
            currency: 'usd',
          },
          display_name: 'Free shipping',
          // Delivers between 5-7 business days
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 5,
            },
            maximum: {
              unit: 'business_day',
              value: 7,
            },
          }
        }
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 1500,
            currency: 'usd',
          },
          display_name: 'Next day air',
          // Delivers in exactly 1 business day
          delivery_estimate: {
            minimum: {
              unit: 'business_day',
              value: 1,
            },
            maximum: {
              unit: 'business_day',
              value: 1,
            },
          }
        }
      },
    ],
      customer: customer.id,
      line_items,
      mode: 'payment',
      success_url: process.env.THE_FRONT_LINK,
      cancel_url: process.env.THE_FRONT_LINK + "/cart",
    });
  
    res.send({url: session.url});
  }); 


  //STRIPE WEBHOOKS
  

  router.post('/webhook', express.raw({type: 'application/json'}),  (request, response) => {
   

    const payload = request.body;
    
    
    const payloadString = JSON.stringify(payload, null, 2);
    const secret = process.env.STRIPE_END_SECRET;
    
    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });
    


  
    let data;
    let eventType;

    if(secret) {
      let event;
  
    try {
      
       event = stripe.webhooks.constructEvent(payloadString, header, secret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      console.log(err.message)
      return;
    }

      data = event.data.object;
      eventType = request.body.type;

    } else {
      data = request.body.data.object;
      eventType = request.body.type;

    }
  
    // Handle the event
    
    if(eventType === "checkout.session.completed") {
      stripe.customers.retrieve(data.customer).then(
        (customer)=> {
          
          createOrder(customer, data)
          
        }
      ).catch((e) => {
        console.log(e.message)
      }) 

    }
  
    // Return a 200 response to acknowledge receipt of the event
    response.send().end();
  });


  const sold = async (id, quantity, oldSold) =>{
    await Product.findOneAndUpdate({_id: id}, {
        sold: quantity + oldSold
    })
}
  const createOrder = async (customer,data) => {
    
      

    const id = customer.metadata.user_id
    const user = await User.findById(id)

    let cart = user.cart
    let totalPrice = 0;

    for(let i=0; i<cart.length; i++) {

      const product = await Product.findById(cart[i].product._id)
      cart[i].product.price = product.price
      totalPrice = totalPrice + cart[i].product.price * cart[i].quantity

    }

    const newOrder = new Order({
      user_id:customer.metadata.user_id,
      products: cart,
      address: data.customer_details,
      total: totalPrice
    })
    try {
      const savedOrder = await newOrder.save()

      cart.filter(item=> {
        return sold(item.product._id, item.quantity, item.product.sold)
      })

      await User.findOneAndUpdate({_id: customer.metadata.user_id}, {
        cart: []
    }, {new:true})
      
    } catch(e) {
      console.log(e.message)
    }
  }

  module.exports = router;