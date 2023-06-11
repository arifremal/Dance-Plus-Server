const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// middleware
require("dotenv").config();
app.use(cors());

app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@aremal.jgqn0oc.mongodb.net/?retryWrites=true&w=majority`;

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

    const clssesCollections = client
      .db("dnacePlusDB")
      .collection("popularClasses");
    const instructorsCollections = client
      .db("dnacePlusDB")
      .collection("popularInstructors");
    const enrolledCollections = client.db("dnacePlusDB").collection("enroll");

    app.get("/class", async (req, res) => {
      const result = await clssesCollections.find().toArray();
      res.send(result);
    });
    app.get("/instructors", async (req, res) => {
      const result = await instructorsCollections.find().toArray();
      res.send(result);
    });

    // enrolled students
    app.post("/enroll", async (req, res) => {
      const item = req.body;
      const result = await enrolledCollections.insertOne(item);
      console.log(result);
      res.send(result);
    });

    app.get("/enroll", async (req, res) => {
      const email = req.query.email;
      if (!email) {
        res.send([]);
      }
      const query = { email: email };
      const result = await enrolledCollections.find(query).toArray();
      res.send(result);
    });
    
    //  my class
    app.get("/enroll/:mail", async (req, res) => {
      console.log(req.params.mail);
      const result = await enrolledCollections
        .find({ email: req.params.mail })
        .toArray();
      res.send(result);
    });
    // class Delete 

    app.delete("/enroll/:id", async (req, res) => {
      const id = req.params.id;
      const data = { _id: new ObjectId(id) };
      const result = await enrolledCollections.deleteOne(data);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("running bro");
});
app.listen(port, () => {
  console.log("running on port 5000");
});
