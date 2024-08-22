require("dotenv").config();
const express = require("express");
const router = express.Router();
const { books } = require("../mongoose.js");
// const authorsRouter = require("./authorsRouter.js");
const axios = require("axios");
const { ObjectId } = require("bson");
// const { default: mongoose } = require("mongoose");
const PORT = process.env.appPORT;


// router.use(express.json());

router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const book = {
            title: body.title,
            pages: parseInt(body.pages, 10),
            author: {
                name: body.author_name,
                birthdate: body.author_birthdate,
            }
        };
        if (typeof book.title !== "string") {
            return res.status(400).json({ message: "book title must be a string" });
        }
        if (book.title.trim() === "") {
            return res.status(400).json({ message: "book title required" });
        }
        if (isNaN(book.pages)) {
            return res.status(400).json({ message: "book pages must be a number" });
        }
        if (!book.author) {
            return res.status(500).json({ message: "author details are required" });
        }

        const foundBook = (await books.findOne({ title: book.title, pages: book.pages })).toObject();
        if (foundBook) {
            const response = await axios.get(`http://localhost:${PORT}/authors/${foundBook.author_id}`);
            const author = response.data;
            if (book.author.name === author.name && new Date(book.author.birthdate) === author.birthdate) {
                return res.status(400).json({ message: "books already exists" });
            }
        }

        let authorId;
        try {
            const response = await axios.post(`http://localhost:${PORT}/authors`, book.author);
            authorId = new ObjectId(response.data.author_id);
        } catch (err) {
            return res.status(500).json({ message: err });
        }

        
        const b = new books();
        b.title = book.title;
        b.pages = book.pages;
        b.author_id = authorId;
        await b.save();
        return res.status(200).json({ message: b });
    } catch (err) {
        return res.status(400).json({ message: err });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const bookId = req.params.id;
        if (!bookId) {
            return res.status(400).json({ message: "book id required" });
        }
        let foundBook = (await books.findById(new ObjectId(bookId))).toObject();
        if (!foundBook) {
            return res.status(400).json({ message: "book not found" });
        }

        let author;
        try {
            const response = await axios.get(`http://localhost:${PORT}/authors/${foundBook.author_id}`);
            author = response.data.author;
        } catch (err) {
            return res.status(500).json({ message: err });
        }

        delete foundBook.author_id;
        foundBook.author = author;
        return res.status(200).json(foundBook);
    } catch (err) {
        return res.status(500).json({ message: err });
    }

});

router.put("/:id", async (req, res) => {
    try {
        const bookId = req.params.id;
        const fields = req.body;
        if (!bookId) {
            return res.status(400).json({ message: "book id required" });
        }
        if (!fields) {
            return res.status(400).json({ message: "no fields to update" });
        }
        let fieldsToUpdate = {};
        for (let [key, value] of Object.entries(fields)) {
            fieldsToUpdate[key] = value;
        }


        if (fieldsToUpdate.title) {
            if (typeof fieldsToUpdate.title !== "string") {
                return res.status(400).json({ message: " book title must be a string" });
            }
        }
        if (fieldsToUpdate.pages) {
            if (isNaN(parseInt(fieldsToUpdate.pages, 10))) {
                return res.status(400).json({ message: " book pages must be a number" });
            }
        }

        // if(fieldsToUpdate.author_id){
        //     if(!fieldsToUpdate.author_id === ""){
        //         return res.status(400).json({message: "author id required"});
        //     }
        // }

        const result = await books.findByIdAndUpdate(bookId, fieldsToUpdate, { new: true });
        if (!result) {
            return res.status(400).json({ message: "book not found" });
        }
        return res.status(200).json({ result });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const bookId = req.params.id;
        if (!bookId) {
            return res.status(400).json({ message: "book id required" });
        };

        const result = await books.findByIdAndDelete(bookId);
        if (!result) {
            return res.status(400).json({ message: "book not found" });
        }
        return res.status(200).json({ result });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

module.exports = router;