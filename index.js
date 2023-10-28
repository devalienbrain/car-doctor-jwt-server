// BASIC CODE OF NODE SERVER
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("The Car Doctor SERVER is running!");
});

app.listen(port, () => {
  console.log(`Car Doctor SERVER running on port: ${port}`);
});

// MONGODB CONNECTION CODE
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

require("dotenv").config();
console.log(process.env.DB_USER, process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m38robg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    //GET SERVICES FROM DB
    const serviceCollection = client.db("carDoctorDB").collection("services");

    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projecttion: { title: 1, price: 1, service_id: 1, img: 1 },
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });

    // Buyer DB
    const buyerCollection = client.db("carDoctorDB").collection("buyers");

    // app.get("/buyers", async (req, res) => {
    //   const cursor = buyerCollection.find();
    //   const result = await cursor.toArray();
    //   res.send(result);
    // });

    // GET SOME DATA (CONDITIONAL) USING QUERY
    app.get("/buyers", async (req, res) => {
      let query = {};
      console.log(req.query.email);
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const result = await buyerCollection.find(query).toArray();
      res.send(result);
    });

    app.post("/buyers", async (req, res) => {
      const buyer = req.body;
      console.log(buyer);
      const result = await buyerCollection.insertOne(buyer);
      res.send(result);
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
