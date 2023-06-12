const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// middleware
require("dotenv").config();
app.use(cors());

app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "Do not have access in this router" });
  }
  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (er) {
      return res
        .status(401)
        .send({ error: true, message: "Do not have access in this router" });
    }
    req.decoded = decoded;
    next();
  });
};

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
    const usersCollections = client.db("dnacePlusDB").collection("users");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
      res.send(token);
    });

    // get all users

    app.get("/users", async (req, res) => {
      const result = await usersCollections.find().toArray();
      res.send(result);
    });

    //  get users API
    app.post("/users", async (req, res) => {
      const user = req.body;

      const query = { email: user.email };
      const existUser = await usersCollections.findOne(query);

      if (existUser) {
        return res.send({ message: "user already exists" });
      }
      const result = await usersCollections.insertOne(user);
      res.send(result);
    });
    // app.get("/users/admin/:email", verifyJWT, async (req, res) => {
    //   const email = req.params.email;

    //   if(req.decoded.email !== email){
    //     res.send({admin: false})
    //   }
    //   const query = { email: email };
    //   const user = await usersCollections.findOne(query);
    //   const result = { admin: user?.role === "admin" };
    //   console.log(result);
    //   res.send(result)
    // });


    app.get('/users/admin/:email', async(req,res)=>{
      const email = req.params.email
    
      
      const query = {email: email }
      const user = await usersCollections.findOne(query)
      const result = {admin: user?.role === "admin"}
      res.send(result)

    } )

    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filtering = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await usersCollections.updateOne(filtering, updateDoc);
      res.send(result);
    });
// admin check
app.get('/users/instructor/:email', async(req,res)=>{
  const email = req.params.email

  
  const query = {email: email }
  const user = await usersCollections.findOne(query)
  const result = {instructor: user?.role === "instructor"}
  res.send(result)

} )

    // make instructor
    app.patch("/users/instructor/:id", async (req, res) => {
      const id = req.params.id;
      const filtering = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "instructor",
        },
      };
      const result = await usersCollections.updateOne(filtering, updateDoc);
      res.send(result);
    });
    // make student
    app.patch("/users/student/:id", async (req, res) => {
      const id = req.params.id;
      const filtering = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "student",
        },
      };
      const result = await usersCollections.updateOne(filtering, updateDoc);
      res.send(result);
    });

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

      res.send(result);
    });

    app.get("/enroll", verifyJWT, async (req, res) => {
      const email = req.query.email;

      if (!email) {
        res.send([]);
      }
      const decodedEmail = req.decoded.email;
      if (email !== decodedEmail) {
        return res
          .status(403)
          .send({ error: true, message: "Forbidden Access" });
      }

      const query = { email: email };
      const result = await enrolledCollections.find(query).toArray();
      res.send(result);
    });

    //  my class
    app.get("/enroll/:mail", async (req, res) => {
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
