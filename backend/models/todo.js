// create the database template and export it
const mongoose = require('mongoose')

// TEMPLATE
const TodoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    // ✨ NEW: Add a due date for the task
    dueDate: {
        type: Date,
        default: null // Or you can set a default if you like
    },
    // ✨ NEW: Add priority levels
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'], // Only allow these three values
        default: 'Medium' // Set a default priority
    }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt automatically

// // create the collection name 'todos' with some field [Export the TEMPLATE]
// const Todo = mongoose.model('Todo', TodoSchema);
// module.exports = Todo;

// ✨ FIX: Add this virtual property to calculate if a task is overdue
TodoSchema.virtual('isOverdue').get(function() {
    // A task is overdue if it has a due date, that date is in the past, AND it is not completed.
    return this.dueDate && this.dueDate < new Date() && !this.completed;
});

// ✨ FIX: Tell Mongoose to include virtuals when you send the data as JSON
TodoSchema.set('toJSON', { virtuals: true });
TodoSchema.set('toObject', { virtuals: true });


const Todo = mongoose.model('Todo', TodoSchema);
module.exports = Todo;

