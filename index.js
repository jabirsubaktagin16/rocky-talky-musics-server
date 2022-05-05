const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

//Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dpnrf.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const productCollection = client
      .db("rockyTalkyMusic")
      .collection("product");

    // AUTH
    app.post("/signin", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });

    // GET All Items
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET Details from a single product
    app.get("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const productDetails = await productCollection.findOne(query);
      res.send(productDetails);
    });

    // POST New Item
    app.post("/products", async (req, res) => {
      const newProduct = req.body;
      const result = await productCollection.insertOne(newProduct);
      res.send(result);
    });

    // DELETE an item
    app.delete("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productCollection.deleteOne(query);
      res.send(result);
    });

    // Stock Update
    app.put("/inventory/:id", async (req, res) => {
      const id = req.params.id;
      const updatedStock = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedStock.name,
          price: updatedStock.price,
          image: updatedStock.image,
          quantity: updatedStock.quantity,
          category: updatedStock.category,
          sold: updatedStock.sold,
          email: updatedStock.email,
          description: updatedStock.description,
        },
      };
      const result = await productCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    app.get("/inventory", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const cursor = productCollection.find(query);
      const myItems = await cursor.toArray();
      res.send(myItems);
    });
  } finally {
    // await client.close();
  }
};

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Running Rocky Talky Music Server");
});

app.listen(port, () => {
  console.log(`Listening to Port ${port}`);
});
