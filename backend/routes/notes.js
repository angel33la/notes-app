const express = require('express');
const passport = require('passport');
require('../services/passport');

const router = express.Router();
const NotesController = require('../controllers/notes_controller');

const requireAuth = passport.authenticate('jwt', { session: false });

// GET /api/v1/notes - returns notes for authenticated user
router.get('/', requireAuth, NotesController.getNotesForUser);

// POST /api/v1/notes - create a new note for authenticated user
router.post('/', requireAuth, NotesController.createNote);

// GET /api/v1/notes/:id - get a specific note for authenticated user
router.get('/:id', requireAuth, NotesController.getNote);

// PUT /api/v1/notes/:id - update a specific note for authenticated user
router.put('/:id', requireAuth, NotesController.updateNote);

// DELETE /api/v1/notes/:id - delete a specific note for authenticated user
router.delete('/:id', requireAuth, NotesController.deleteNote);

module.exports = router;
