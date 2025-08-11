// create the database template and export it
const mongoose = require('mongoose')

const TodoSchema = new mongoose.Schema({
    text : {
        type : String,
        required : true
    }
})

// create the collecton name 'todos' with some field
const Todo = mongoose.model('Todo', TodoSchema)

module.exports = Todo

