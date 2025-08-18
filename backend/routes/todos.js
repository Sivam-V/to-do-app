// This file used to hadle the request and used to
// send response to the front end

const express = require('express')
const mongoose = require('mongoose')
const app = express()
const Todo = require('../models/todo.js')
const router = express.Router()

router.get('/', async(req, res) => {
    // const ToDoItemsArray = await Todo.find()
    // res.json(ToDoItemsArray);
    try {
        const ToDoItemsArray = await Todo.find();
        res.json(ToDoItemsArray);
    } catch (err) {
        console.error("Error fetching todos:", err);
        res.status(500).json({ message: "Failed to retrieve todos from the database." });
    }
})

router.post('/', async(req, res) => {
    try {
        // save in the Todo collection
        const itemName = req.body.text;

        // Basic validation to ensure text is not empty
        if (!itemName) return res.status(400).json({ message: "Todo text cannot be empty." });

        console.log("Creating new todo with text:", itemName);
        const newTodoItem = new Todo({ text: itemName });
        const savedItem = await newTodoItem.save();
        
        // send to frontend
        res.status(201).json(savedItem); // 201 Created is more appropriate for a successful POST
    } catch (err) {
        console.error("Error saving new todo:", err);
        res.status(500).json({ message: "Failed to save the new todo." });
    }
})

router.delete('/:id', async(req, res) => {
    const todoId = req.params.id;
    console.log(todoId)
    try {
        const deletedTodo = await Todo.findByIdAndDelete(todoId)
        if (!deletedTodo) {
            return res.status(404).json({message : 'item not found on DB'})
        }
        const todoAfterDelete = await Todo.find()
        console.log('Item deleted successfully...')
        return res.status(200).json(todoAfterDelete)
    }catch (error){
        console.log('Error while delete todo...')
        res.status(500).json({message : "Filed to delete the todo"})
    } 
})

router.put('/:id', async(req, res) => {
    try {
        const updatedTodo = req.body.text
        const editId = req.params.id
        const  itemAfterUpdate = await Todo.findByIdAndUpdate(editId, {text : req.body.text})
        console.log('Item updated successfully...🔥')
        const  todoAfterUpdate = await Todo.find()
        return res.status(200).json(todoAfterUpdate)
    }catch(err) {
        console.log('Error while update the todo')
        res.status(500).json({message : 'failed to update the item'})
    }
})
module.exports = router;

/*You're exporting an object that has HTTP methods (get, post, etc.) registered on it.

That router is like a mini Express app. When you do:

app.use('/api/todos', require('./routes/todos'));
You’re telling your main app:

“Hey! Any request that starts with /api/todos, pass it to this external router we made!”*/

