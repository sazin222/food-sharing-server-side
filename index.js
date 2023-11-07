
const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');


const port= process.env.PORT || 5000 


// middleware 
app.use(cors());
app.use(express.json()) 



const uri = `mongodb+srv://${process.env.DB_USERS}:${process.env.DB_PASS}@cluster0.na448cw.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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

app.delete('/foodRequests/:id', async(req,res)=>{
  const id= req.params.id 
  const query= {_id: new ObjectId(id)}
  const result= await foodRequestCollection.deleteOne(query)
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
    
app.get('/managefoods', async(req,res)=>{
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

     
app.get('/requestfood', async(req,res)=>{
  query={email: req.query.email}
    const coursor= foodRequestCollection.find(query)
    const result = await coursor.toArray()
    res.send(result)
  
  }) 

  app.get('/fooddetails/:id', async(req,res)=>{
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
    await client.db("admin").command({ ping: 1 });
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



