require("dotenv").config();
const express = require("express");
const path = require("path");
const booksRouter = require(path.join(__dirname, "./routers/booksRouter.js"));
const authorsRouter = require(path.join(__dirname, "routers/authorsRouter.js"));
const { connectToMongoDb } = require("./mongoose.js");

const app = express();
const PORT = process.env.appPORT;

connectToMongoDb.then((db)=>{
    console.log("connect to DB");
})

app.use(express.json());

app.use("/books", booksRouter);
app.use("/authors", authorsRouter);

app.listen(PORT, () => {
    console.log(`app running on http://localhost:${PORT}`);
})