const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 4000;
const bcrypt = require("bcrypt");
// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5175",
  "https://real-estate-client-2025.web.app",
  "https://real-estate-client-2025.firebaseapp.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

app.use(express.json());

// MongoDB URI
const uri = process.env.MONGO_DB_URI;

// MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // For local dev if TLS errors
  tlsAllowInvalidCertificates: true,
});

async function run() {
  try {
    const db = client.db("Muktalchal");
    const usersCollection = db.collection("usersCollection");
    const agrodoothCollection = db.collection("agrodooth");
    const imageGalleryCollection = db.collection("imageGallery");
    const blogsCollection = db.collection("blog");

    // ==============image gallery related apis ============
    app.get("/image-gallery", async (req, res) => {
      const result = await imageGalleryCollection.find().toArray();
      res.send(result);
    });
    // delete image by id
    app.delete("/image-gallery/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const query = { _id: new ObjectId(id) };

        const result = await imageGalleryCollection.deleteOne(query);

        if (result.deletedCount === 0) {
          return res.status(404).send({ message: "Image not found" });
        }

        res.send({ success: true, message: "Image deleted successfully" });
      } catch (error) {
        console.error("Error deleting image:", error);
        res.status(500).send({ message: "Failed to delete image" });
      }
    });

    app.post("/image-gallery", async (req, res) => {
      const payload = req.body;
      const result = await imageGalleryCollection.insertOne(payload);
      res.send(result);
    });
    // ==============agrodooth related apis ============
    // get new agrodooth
    app.get("/agrodooth", async (req, res) => {
      const result = await agrodoothCollection.find().toArray();
      res.send(result);
    });
    app.get("/agrodooth/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await agrodoothCollection.findOne(query);
      res.send(result);
    });
    // delete agrodooth
    app.delete("/agrodooth/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };

      const result = await agrodoothCollection.deleteOne(query);
      res.send(result);
    });
    // post new agrodooth
    app.post("/agrodooth", async (req, res) => {
      const payload = req.body;
      const result = await agrodoothCollection.insertOne(payload);
      res.send(result);
    });
    // ========== user related issue ===========

    // get users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });
    // email specific user data
    app.get("/users/:email", async (req, res) => {
      try {
        const { email } = req.params;
        const query = { email };
        const result = await usersCollection.findOne(query);
        if (!result) {
          return res.status(404).send({ message: "User not found" });
        }
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Failed to fetch user" });
      }
    });

    app.get("/users/:email/role", async (req, res) => {
      const { email } = req.params;
      console.log(email);
      const query = { email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    //post users
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const existingUser = await usersCollection.findOne({
          email: user?.email,
        });
        if (existingUser) {
          return res.send({
            message: "User already exists",
            user: existingUser,
          });
        }

        const result = await usersCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.log(error);
        res.send({
          message: "falied to upload password",
        });
      }
    });

    // ========== blog related apis ==============
    app.get("/blog", async (req, res) => {
      const result = await blogsCollection.find().toArray();
      res.send(result);
    });
    // post a blog
    app.post("/blog", async (req, res) => {
      const blog = req.body; // ✅ Correctly get blog data
      console.log(blog);

      try {
        const result = await blogsCollection.insertOne(blog); // ❌ you had insertOne(req)
        res.send(result);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Failed to add blog" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log("Pinged MongoDB deployment successfully!");
  } catch (err) {
    console.error(err);
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
