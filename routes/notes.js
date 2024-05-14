const express = require("express");
const router = express.Router();
const User = require("../models/User");
var fetchuser = require("../middleware/fetchuser");
const Notes = require("../models/Notes");
const { body, validationResult } = require("express-validator");

//ROUTE 1://GET all the notes User using :GET "/api/notes/fetchallnotes".Login Required.

router.get("/fetchallnotes", fetchuser, async (req, res) => {
  try {
    const notes = await Notes.find({ user: req.user.id });
    res.json(notes);
    console.log(notes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error... route1");
  }
});

//ROUTE 2://Add a new Note using :POST "/api/notes/addnote".Login Required.

router.post(
  "/addnote",
  fetchuser,
  [
    body("title", "Enter a valid Title").isLength({ min: 3 }),
    body("description", "Description must be atleast 5 character").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    try {
      const { title, description, tag, user } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        //if there are errors ,return bad request and the errors
        return res.status(400).json({ errors: errors.array() });
      }
      const note = new Notes({
        title,
        description,
        tag,
        user: req.user.id,
      });
      const savednote = await note.save();
      console.log(savednote);
      res.json(savednote);
    } catch (error) {
      res.status(500).send("Internal Server Error...route 2");
      console.error(error.message);
    }
  }
);

//ROUTE 3: Update an existing Note using :PUT "/api/notes/updatenote".Login Required.
router.put("/updatenote/:id", fetchuser, async (req, res) => {
  const { title, description, tag } = req.body;
  //Creata a NewNote object
  try {
    const newNote = {};
    if (title) {
      newNote.title = title;
    }
    if (description) {
      newNote.description = description;
    }
    if (tag) {
      newNote.tag = tag;
    }

    //Find the note to be updated and update it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndUpdate(
      req.params.id,
      { $set: newNote },
      { new: true }
    );
    res.json({ note });
  } catch (error) {
    res.status(500).send("Internal Server Error...route 2");
    console.error(error.message);
  }
});

//ROUTE 4=: Delete an existing Note using :DELETE "/api/notes/deletenote".Login Required.
router.delete("/deletenote/:id", fetchuser, async (req, res) => {
  try {
    //Find the note to be delete and delete it
    let note = await Notes.findById(req.params.id);
    if (!note) {
      return res.status(404).send("Not Found");
    }

    //allow deletion only if user owns this Note
    if (note.user.toString() !== req.user.id) {
      return res.status(401).send("Not Allowed");
    }

    note = await Notes.findByIdAndDelete(req.params.id);
    res.json({ "Success ": "Note has been deleted", note: note });
  } catch (error) {
    res.status(500).send("Internal Server Error...route 2");
    console.error(error.message);
  }
});

module.exports = router;
