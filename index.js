const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
// routes
const { auth } = require("./routes/auth");
const { jobSeeker } = require("./routes/jobSeeker");
const {recruiterAuth} = require("./routes/recruiterAuth")
const { recruiter } = require("./routes/recruiter")
const { newsletter } = require("./routes/newsletter");
const mongoose = require("mongoose");

const secret = process.env.SECRET;
const PORT = process.env.PORT || 3000;
const MONGO_URI = "mongodb://sameervers3:hk7LlOO2WOn0bNUA@ac-oduhene-shard-00-00.6k5ywbl.mongodb.net:27017,ac-oduhene-shard-00-01.6k5ywbl.mongodb.net:27017,ac-oduhene-shard-00-02.6k5ywbl.mongodb.net:27017/wizwork?replicaSet=atlas-rdvprw-shard-0&ssl=true&authSource=admin";


app.use(cors());
app.use(bodyParser.json());

app.use("/auth", auth);
app.use("/user", jobSeeker);
app.use("/auth/recruiter", recruiterAuth);
app.use("/recruiter", recruiter);
app.use("/newsletter", newsletter);

app.get("/", (req, res) => {
    res.send("Hello World");
})


app.use((err, req, res, next) => {
    res.status(500).send("Internet Server Error");
})


mongoose.connect(MONGO_URI)
  .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
          console.log(`Server listening on port ${PORT}`);
      });
  })
  .catch(error => {
      console.error('Error connecting to MongoDB:', error);
  });
