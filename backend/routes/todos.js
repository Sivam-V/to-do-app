// This file used to hadle the request and used to
// send response to the front end

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Todo = require('../models/todo.js')
const router = express.Router()

// ✨ UPDATED AND ENHANCED: GET all todos with Search, Filter & Pagination
// Examples:
// GET /api/todos -> Gets the first page
// GET /api/todos?page=2&limit=5 -> Gets page 2 with 5 items per page
// GET /api/todos?search=work -> Searches for "work"
// GET /api/todos?priority=High -> Filters for high-priority tasks
router.get('/', async (req, res) => {
    try {
        const { search, priority, page = 1, limit = 10 } = req.query;

        // Build the query object
        let query = {};

        if (search) {
            // Case-insensitive regex search on the 'text' field
            query.text = { $regex: search, $options: 'i' };
        }

        if (priority && ['Low', 'Medium', 'High'].includes(priority)) {
            // Filter by priority level
            query.priority = priority;
        }

        // Calculate the number of documents to skip for pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Execute query with pagination and sorting
        const todos = await Todo.find(query)
            .sort({ createdAt: -1 }) // Sort by newest first
            .skip(skip)
            .limit(parseInt(limit));

        // Get the total count of documents that match the filter
        const totalTodos = await Todo.countDocuments(query);
        const totalPages = Math.ceil(totalTodos / parseInt(limit));

        // Send a structured response
        res.status(200).json({
            todos,
            currentPage: parseInt(page),
            totalPages,
            totalTodos,
        });
    } catch (err) {
        console.error('Error while fetching todos:', err);
        res.status(500).json({ message: 'Failed to fetch todos.' });
    }
});

// ✨ UPDATED: POST a new todo with dueDate and priority
router.post('/', async (req, res) => {
    try {
        if (!req.body.text) {
            return res.status(400).json({ message: 'Todo text cannot be empty' });
        }
        const newTodo = new Todo({
            text: req.body.text,
            dueDate: req.body.dueDate, // Add dueDate from request body
            priority: req.body.priority, // Add priority from request body
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

        // ✨ IMPROVEMENT: Return the updated document directly
        const updatedTodo = await Todo.findByIdAndUpdate(
            todoId,
            { completed },
            { new: true } // {new: true} returns the modified document
        );

        if (!updatedTodo) return res.status(404).json({ message: 'Item not found' });

        res.status(200).json(updatedTodo);
    } catch (err) {
        console.error('Error while updating completion:', err);
        res.status(500).json({ message: 'Failed to update completion.' });
    }
});

// DELETE a todo
router.delete('/:id', async (req, res) => {
    try {
        const deletedTodo = await Todo.findByIdAndDelete(req.params.id);
        if (!deletedTodo) return res.status(404).json({ message: 'Item not found' });
        
        // ✨ IMPROVEMENT: Send a success confirmation instead of the whole list
        res.status(200).json({ message: 'Todo deleted successfully', id: req.params.id });
    } catch (error) {
        console.error('Error while deleting todo...', error);
        res.status(500).json({ message: 'Failed to delete the todo' });
    }
});

// ✨ UPDATED: PUT (update) a todo's text, dueDate, and priority
router.put('/:id', async (req, res) => {
    try {
        const update = {};
        // Build the update object dynamically based on what's in the request body
        if (req.body.text !== undefined) update.text = req.body.text;
        if (req.body.dueDate !== undefined) update.dueDate = req.body.dueDate;
        if (req.body.priority !== undefined) update.priority = req.body.priority;

        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            update,
            { new: true, runValidators: true } // {new: true} returns the modified doc, runValidators ensures enum for priority is checked
        );

        if (!updatedTodo) return res.status(404).json({ message: 'Item not found' });

        res.status(200).json(updatedTodo); // Return the updated todo
    } catch (err) {
        console.error('Error while updating the todo', err);
        res.status(500).json({ message: 'Failed to update the item' });
    }
});

module.exports = router;