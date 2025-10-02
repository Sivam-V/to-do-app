// This file used to hadle the request and used to
// send response to the front end

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Todo = require('../models/todo.js')
const router = express.Router()

// ADD THIS ROUTE: GET all todos
router.get('/', async (req, res) => {
    try {
        const todos = await Todo.find().sort({ createdAt: -1 }); // Sort by newest first
        res.status(200).json(todos);
    } catch (err) {
        console.error('Error while fetching todos:', err);
        res.status(500).json({ message: 'Failed to fetch todos.' });
    }
});

// ✅ ADD THIS ROUTE: POST a new todo
router.post('/', async (req, res) => {
    try {
        if (!req.body.text) {
            return res.status(400).json({ message: 'Todo text cannot be empty' });
        }
        const newTodo = new Todo({
            text: req.body.text
        });
        const savedTodo = await newTodo.save();
        res.status(201).json(savedTodo); // Return only the newly created todo
    } catch (err) {
        console.error('Error while creating todo:', err);
        res.status(500).json({ message: 'Failed to create todo.' });
    }
});

// PATCH a todo to mark as complete/incomplete
router.patch('/:id/complete', async (req, res) => {
    try {
        const todoId = req.params.id;
        const { completed } = req.body;

        if (typeof completed !== 'boolean') {
            return res.status(400).json({ message: 'completed must be a boolean' });
        }

        const updated = await Todo.findByIdAndUpdate(todoId, { completed }, { new: true });
        if (!updated) return res.status(404).json({ message: 'Item not found on DB' });

        // return fresh list (keeps frontend simple)
        const todos = await Todo.find().sort({ createdAt: -1 });
        res.status(200).json(todos);
    } catch (err) {
        console.error('Error while updating completion:', err);
        res.status(500).json({ message: 'Failed to update completion.' });
    }
});


// DELETE a todo
router.delete('/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
        if (!deletedTodo) return res.status(404).json({ message: 'item not found on DB' });
        const todoAfterDelete = await Todo.find().sort({ createdAt: -1 });
        return res.status(200).json(todoAfterDelete);
    } catch (error) {
        console.error('Error while deleting todo...', error);
        res.status(500).json({ message: 'Failed to delete the todo' });
    }
});

// PUT (update) a todo's text
router.put('/:id', async (req, res) => {
    try {
        const editId = req.params.id;
        const update = {};
        if (req.body.text !== undefined) update.text = req.body.text;
        
        await Todo.findByIdAndUpdate(editId, update);
        const todos = await Todo.find().sort({ createdAt: -1 });
        return res.status(200).json(todos);
    } catch (err) {
        console.error('Error while updating the todo', err);
        res.status(500).json({ message: 'failed to update the item' });
    }
});


module.exports = router;

/*You're exporting an object that has HTTP methods (get, post, etc.) registered on it.

That router is like a mini Express app. When you do:

app.use('/api/todos', require('./routes/todos'));
You’re telling your main app:

“Hey! Any request that starts with /api/todos, pass it to this external router we made!”*/

