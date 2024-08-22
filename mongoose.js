require("dotenv").config();
const URI = process.env.mongodbURI;
const mongoose = require("mongoose");
const { Schema } = mongoose;

const connectToMongoDb = mongoose.connect(URI);    


const BooksSchema = new Schema({
    // _id: Schema.Types.ObjectId,
    title: String,
    pages: Number,
    author_id: {
        type: Schema.Types.ObjectId,
        ref: "authors",
    }
});

const AuthorsSchema = new Schema({
    // _id: Schema.Types.ObjectId,
    name: String,
    birthdate: Date,
});

const books = mongoose.model("books",BooksSchema);
const authors = mongoose.model("authors",AuthorsSchema);



module.exports = {
    connectToMongoDb,
    books,
    authors,    
}


