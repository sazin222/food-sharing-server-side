
const express = require('express');
const cors = require('cors');
const cookieParser=require('cookie-parser')
const jwt= require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();

const port= process.env.PORT || 5000 


// middleware 
app.use(cors({
  origin:['http://localhost:5173'],
  credentials:true 
}))
// app.use(cors())
app.use(express.json()) 
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USERS}:${process.env.DB_PASS}@cluster0.na448cw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
}); 

const verifyToken= async(req,res,next)=>{
  const token= req?.cookies?.token
  // console.log('value of token in middleware', token);
  if(!token){
    return res.status(401).send({message: 'not authorized'})
  }
  jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      console.log(err);
      return res.status(401).send({message:'unauthorized'})
    }
    console.log('value in the token', decoded);
    req.user= decoded
    next()
  })
 
}

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const foodsCollection= client.db('foodDB').collection('foods')
    const foodRequestCollection= client.db('foodDB').collection('requestFood')



   
app.post('/foodRequest', async(req,res)=>{
  const foodDetails= req.body
  const result= await foodRequestCollection.insertOne(foodDetails)
  res.send(result)
}) 


app.post('/jwt', async(req,res)=>{
  const user= req.body
  const token= jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
  console.log(user);

  res
  .cookie('token', token, {
    httpOnly: false,
    // secure: process.env.NODE_ENV === 'production', // Set to true in production
    // sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // Adjust based on your requirements
    // // maxAge: // how much time the cookie will exist
    secure: true,
    sameSite:'none'
})
  .send({success:true})
  
})

app.post('/logout', async(req, res)=>{
  const users= req.body 
  console.log('logged in user', users);
  res
  .clearCookie('token',{maxAge:0, sameSite: 'none', secure:true})
  .send({success:true})
})


app.delete('/foodRequests/:id', async(req,res)=>{
  const id= req.params.id 
  const query= {_id: new ObjectId(id)}
  const result= await foodRequestCollection.deleteOne(query)
  res.send(result)
})


app.delete('/foodDelete/:id', async(req,res)=>{
  const id= req.params.id 
  const query= {_id: new ObjectId(id)}
  const result= await foodsCollection.deleteOne(query)
  res.send(result)
})

app.post('/food', async(req,res)=>{
  const foodDetails= req.body
  const result= await foodsCollection.insertOne(foodDetails)
  res.send(result)
}) 
    
app.get('/foods', async(req,res)=>{

  let queryObj={}
  let sortObj={}
  const foodName= req.query.foodName
  const sortField= req.query.sortField
  const sortOrder= req.query.sortOrder
  console.log(sortField);
  if(foodName){
    queryObj.foodName= foodName
  }
  if(sortField && sortOrder){
    sortObj[sortField]= sortOrder
  }
    const coursor= foodsCollection.find(queryObj).sort(sortObj)
    const result = await coursor.toArray()
    res.send(result)
  
  }) 
    
app.get('/managefoods', verifyToken, async(req,res)=>{
  query={email: req.query.email}
    const coursor= foodsCollection.find(query)
    const result = await coursor.toArray()
    res.send(result)
  
  }) 

  app.put('/foodUpdate/:id', async(req,res)=>{
    const id = req.params.id
    console.log(id);
    const filter ={_id: new ObjectId(id) }
    const UpdateFood= req.body
    const options = { upsert: true };
    const Product= {
      $set:{
        foodName: UpdateFood.foodName,
        foodImage: UpdateFood.foodImage,
        foodQuantity: UpdateFood.foodQuantity,
        pickupLocation: UpdateFood.pickupLocation,
        additionalNotes: UpdateFood.additionalNotes,
        expireddate: UpdateFood.expireddate,
        
      }
    }
    const result = await foodsCollection.updateOne(filter,Product,options) 
    res.send(result)
  })

  app.get('/requestfood', verifyToken, async(req,res)=>{
   query={email:req.query.email}
    const coursor= foodRequestCollection.find(query)
    const result = await coursor.toArray()
    res.send(result)
  
  }) 
  
app.get('/manages/:email', verifyToken, async(req,res)=>{
  const email= req.params.email
  console.log(email);
  const query={email: email}
    const coursor= foodRequestCollection.find(query)
    const result = await coursor.toArray()
    res.send(result)
  
  }) 

  app.get('/fooddetails/:id', verifyToken, async(req,res)=>{
    const id= req.params.id
    const query={_id: new ObjectId(id)}
    const result= await foodsCollection.findOne(query)
    res.send(result)
    
  })
  app.get('/foods/short', async(req,res)=>{
    const coursor= foodsCollection.find().sort({ foodQuantity: -1 }).limit(6);
    const result = await coursor.toArray()
    res.send(result)
  })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('community food sharing ')
}) 


app.listen(port,()=>{
    console.log(`community food sharing  is running on port : ${port}`);
})



