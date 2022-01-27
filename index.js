const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId

const { MongoClient } = require('mongodb');
const app = express();

const port = process.env.PORT || 5000
// middleware 
app.use(cors());
app.use(express.json());
//env import
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vljpp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    console.log("dbms connected");
    const database = client.db("Hungry");
    const mealsCollection = database.collection("Meals");
    const purchaseCollection = database.collection("purchase");

      // get 
      app.get("/meals", async (req, res) => {
        const cursor = mealsCollection.find({});
        const product = await cursor.toArray();
        res.json(product);
      })
      app.get("/myOrders", async (req, res) => {
        const cursor = purchaseCollection.find({});
        const product = await cursor.toArray();
        res.json(product);
      })
      //get single id
      app.get("/meals/:id", async (req, res) => {
      const id = req.params.id 
      console.log("id is",id);
      const query = {_id:ObjectId(id)}
      const product = await mealsCollection.findOne(query)
      res.send(product)
      })
      //post Api
        app.post("/purchase",async (req, res) => {
          const newUser = req.body;
          const result = await purchaseCollection.insertOne(newUser);
          res.json(result);
        })
            //delete 
      app.delete('/myOrders/:id',async (req, res) => {
        const id = req.params.id;
        console.log(id);
        const query = {_id:ObjectId(id)}
        const result = await purchaseCollection.deleteOne(query);
        console.log("Delete id",result);
        res.json(result)
      })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is Running at  http://localhost:${port}`)
})