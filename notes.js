const express = require('express');
const Notes = require('../models/Notes');
const router = require('express').Router();
const Fetchuser = require('../middleware/Fetchuser');
const { body, validationResult } = require('express-validator');

//Route 1:Get All the Notes using: GET "/api/notes/fetchallnotes".Login requried.

router.get('/fetchallnotes', Fetchuser, async (req, res) => {
    try {
        const notes = await Notes.find({ user: req.user.id });
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//Route 2:Add a new Note using: POST "/api/notes/addnote".Login requried.
router.post('/addnote', Fetchuser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;
        // if there are errors, return bad request and the errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const note = new Notes({
            title, description, tag, user: req.user.id
        })
        const savedNote = await note.save()
        res.json(savedNote)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//Route 3:Update an existing Note using: PUT "/api/notes/updatenote".Login requried.
router.put('/updatenote/:id', Fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;
    try {
        //create a newNote object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };

        //find the note to be updated and update it.
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})

//Route 4:Delete an existing Note using: DELETE "/api/notes/deletenote".Login requried.
router.delete('/deletenote/:id', Fetchuser, async (req, res) => {
    try {
        //find the note to be delete and delete it.
        let note = await Notes.findById(req.params.id);
        if (!note) { return res.status(404).send("Not Found") }

        //Allow deletion only if user owns this note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed");
        }
        note = await Notes.findByIdAndDelete(req.params.id)
        res.json({ "Sucess": "Note has been deleted", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error")
    }
})
module.exports = router