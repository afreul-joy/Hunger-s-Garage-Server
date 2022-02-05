const express = require("express");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

const { MongoClient } = require("mongodb");
const app = express();

const port = process.env.PORT || 5000;
// middleware
app.use(cors());
app.use(express.json());
//env import
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vljpp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("dbms connected");
    const database = client.db("Hungry");
    const mealsCollection = database.collection("Meals");
    const purchaseCollection = database.collection("purchase");
    const usersCollection = database.collection("users");

    //----------GET API ALL MEALS -----------------
    app.get("/meals", async (req, res) => {
      const cursor = mealsCollection.find({});
      const product = await cursor.toArray();
      res.json(product);
    });
    //----------GET API ALL ORDERS -----------------
    app.get("/allOrders", async (req, res) => {
      const cursor = purchaseCollection.find({});
      const product = await cursor.toArray();
      res.json(product);
    });
    //----------GET API FILTERING BY EMAIL -----------------
    app.get("/myOrders", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = purchaseCollection.find(query);
      const product = await cursor.toArray();
      res.json(product);
    });
    //----------GET API SINGLE ID -----------------
    app.get("/meals/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id is", id);
      const query = { _id: ObjectId(id) };
      const product = await mealsCollection.findOne(query);
      res.send(product);
    });
    // ----------GET API SINGLE ID FOR UPDATE/EDIT -----------------
    app.get("/myOrders/:id", async (req, res) => {
      const id = req.params.id;
      console.log("id is", id);
      const query = { _id: ObjectId(id) };
      const product = await purchaseCollection.findOne(query);
      res.send(product);
    });
    // ----------GET API CHECK ADMIN OR NOT BY EMAIL -----------------
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin=true;
      }
      res.json({ admin: isAdmin });
    });
    //----------POST API PURCHASE/BUY NOW -----------------
    app.post("/purchase", async (req, res) => {
      const newUser = req.body;
      const result = await purchaseCollection.insertOne(newUser);
      res.json(result);
    });
    // ----------POST API REGISTER/LOGIN USERS  -----------------
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });
    //----------PUT API UPDATE INFORMATION-----------------
    app.put("/myOrders/:id", async (req, res) => {
      const id = req.params.id;
      const updatedUser = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updatedUser.name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
        },
      };
      const result = await purchaseCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("updating user", result);
      res.json(result);
    });
    //----------PUT API UPSERT FOR GOOGLE SING-IN USER -----------------
    app.put("/users", async (req, res) => {
      const user = req.body;
      // console.log("put", user);
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("Putting user", result);
      res.json(result);
    });
    //----------PUT API ADMIN -----------------
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      console.log("put", user);
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //----------DELETE API -----------------
    app.delete("/myOrders/:id", async (req, res) => {
      const id = req.params.id;
      // console.log(id);
      const query = { _id: ObjectId(id) };
      const result = await purchaseCollection.deleteOne(query);
      console.log("Delete id", result);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`Server is Running at  http://localhost:${port}`);
});
