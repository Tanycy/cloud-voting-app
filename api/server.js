const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

const app = express();
app.use(cors());
app.use(express.json());

const mongoUrl = "mongodb://mongo:27017";
const client = new MongoClient(mongoUrl);

let db;

async function startServer() {
  await client.connect();
  db = client.db("votingDB");
  console.log("Connected to MongoDB");

  app.listen(8080, () => {
    console.log("API running on port 8080");
  });
}

app.post("/vote/:lang", async (req, res) => {
  const lang = req.params.lang;

  await db.collection("votes").updateOne(
    { name: lang },
    { $inc: { count: 1 } },
    { upsert: true }
  );

  res.sendStatus(200);
});

app.get("/votes", async (req, res) => {
  const results = await db.collection("votes").find().toArray();

  const formatted = {};
  results.forEach(item => {
    formatted[item.name] = item.count;
  });

  res.json(formatted);
});

startServer();