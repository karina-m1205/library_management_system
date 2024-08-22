const express = require("express");
const router = express.Router();
const { authors } = require("../mongoose.js");
const { ObjectId } = require("bson");

// router.use(express.json());

router.post("/", async (req, res) => {
    try {
        const body = req.body;
        const author = {
            name: body.name,
            birthdate: body.birthdate,
        }
        if (typeof author.name !== "string") {
            return res.status(400).json({ message: "author name must be a string" });
        }
        if (author.name.trim() === "") {
            return res.status(400).json({ message: "author name required" });
        }

        
        const foundAuthor = (await authors.findOne({ name: author.name })).toObject();
        if (foundAuthor) {
            return res.status(200).json({ author_id: foundAuthor._id});
        }

        const auth = new authors();
        auth.name = author.name;
        auth.birthdate = new Date(author.birthdate);
        await auth.save();
        return res.status(200).json({ author_id: auth._id });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const authorId = req.params.id;
        if (!authorId) {
            return res.status(400).json({ message: "author id required" });
        }
        const foundAuthor = (await authors.findById(new ObjectId(authorId))).toObject();
        if (!foundAuthor) {
            return res.status(400).json({ message: "author not found" });
        }
        return res.status(200).json({ author: foundAuthor });
    } catch (err) {
        return res.status(400).json({ message: err });
    }


});

router.put("/:id", async (req, res) => {
    try {
        const authorId = req.params.id;
        const fields = req.body;
        if (!authorId) {
            return res.status(400).json({ message: "author id required" });
        }
        if (!fields) {
            return res.status(400).json({ message: "no fields to update" });
        }
        let fieldsToUpdate = {};
        for (let [key, value] of Object.entries(fields)) {
            fieldsToUpdate[key] = value;
        }


        if (fieldsToUpdate.name) {
            if (typeof fieldsToUpdate.title !== "string") {
                return res.status(400).json({ message: " author name must be a string" });
            }
        }
        if (fieldsToUpdate.birthdate) {
            fieldsToUpdate.birthdate = new Date(fieldsToUpdate.birthdate);
        }

        const result = await authors.findByIdAndUpdate(authorId, fieldsToUpdate, { new: true });
        if (!result) {
            return res.status(400).json({ message: "author not found" });
        }
        return res.status(200).json({ result });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const authorId = req.params.id;
        if (!authorId) {
            return res.status(400).json({ message: "author id required" });
        };

        const result = await authors.findByIdAndDelete(authorId);
        if (!result) {
            return res.status(400).json({ message: "author not found" });
        }
        return res.status(200).json({ result });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

module.exports = router;