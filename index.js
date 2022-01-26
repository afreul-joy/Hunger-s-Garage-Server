const express = require('express');
const cors = require('cors');
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

      // get 
      app.get("/meals", async (req, res) => {
        const cursor = mealsCollection.find({});
        const product = await cursor.toArray();
        res.json(product);
      })

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is Running at  http://localhost:${port}`)
})