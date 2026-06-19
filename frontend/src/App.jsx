/*This is acts as a front end of the todo app and each and every
function is writtern by me interms of understand the frontend, backend, and database configuration
to increat the knowledge on the developement journey*/
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

// The API base URL
const API_URL = 'http://localhost:5000/api/todos';

function App() {
    // State for the list of todos and pagination
    const [todos, setTodos] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // State for the new todo form inputs
    const [newTodoText, setNewTodoText] = useState('');
    const [newTodoPriority, setNewTodoPriority] = useState('Medium');
    const [newTodoDueDate, setNewTodoDueDate] = useState('');

    // State for editing a todo
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ text: '', priority: '', dueDate: '' });

    // State for search and filter controls
    const [searchTerm, setSearchTerm] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');

    // Central function to fetch todos
    const fetchTodos = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                page,
                limit: 10,
            });
            if (searchTerm) params.append('search', searchTerm);
            if (priorityFilter) params.append('priority', priorityFilter);

            const response = await axios.get(`${API_URL}?${params.toString()}`);
            setTodos(response.data.todos);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error('Error while fetching todos:', err);
        }
    }, [page, searchTerm, priorityFilter]);

    // Fetch todos on initial component mount and when dependencies change
    useEffect(() => {
        fetchTodos();
    }, [fetchTodos]);


    // === FORM HANDLERS ===

    function handleAddTodo(e) {
        e.preventDefault();
        if (!newTodoText.trim()) return alert('Please enter a todo');

        const newTodo = {
            text: newTodoText,
            priority: newTodoPriority,
            dueDate: newTodoDueDate || null,
        };

        axios.post(API_URL, newTodo)
            .then(() => {
                setNewTodoText('');
                setNewTodoPriority('Medium');
                setNewTodoDueDate('');
                setPage(1); 
                fetchTodos();
            })
            .catch(err => console.error('Error while creating the task:', err));
    }

    function handleUpdateTodo() {
        if (!editData.text.trim()) return alert('Todo text cannot be empty');

        axios.put(`${API_URL}/${editId}`, {
                text: editData.text,
                priority: editData.priority,
                dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : null
            })
            .then(response => {
                setTodos(prev => prev.map(t => t._id === editId ? response.data : t));
                setEditId(null);
            })
            .catch(err => console.error('failed to update the todo', err));
    }


    // === TODO ITEM ACTIONS ===
    // This function uses the particularly for delete TO DO using the id (this is how logic works in the MongoDB)
    // axios is the function is used from front end to send request to the backend
    function handleDeleteTodo(id) {
        axios.delete(`${API_URL}/${id}`)
            .then(() => {
                fetchTodos();
            })
            .catch(err => console.error('failed to delete the todo', err));
    }

    function handleEditTodo(todo) {
        setEditId(todo._id);
        setEditData({
            text: todo.text,
            priority: todo.priority,
            dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''
        });
    }

    function handleToggleComplete(id, newCompleted) {
        axios.patch(`${API_URL}/${id}/complete`, { completed: newCompleted })
            .then(response => {
                setTodos(prev => prev.map(t => (t._id === id ? response.data : t)));
            })
            .catch(err => console.error('Failed to toggle completed', err));
    }
    
    // Helper to format date for display
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-CA'); // YYYY-MM-DD format
    }

    return (
        // Added main container class
        <div className="planner-container">
            <h1>My Planner...</h1>

            {/*Form for adding a new todo */}
            <form onSubmit={handleAddTodo} className="add-task-form">
                {/* No h3 needed, placeholder is enough */}
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Enter a new todo..."
                />
                <select value={newTodoPriority} onChange={(e) => setNewTodoPriority(e.target.value)}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
                <input
                    type="date"
                    value={newTodoDueDate}
                    onChange={(e) => setNewTodoDueDate(e.target.value)}
                />
                {/*  Added button class */}
                <button type="submit" className="btn-primary">Add Task</button>
            </form>

            <hr />
            
            {/*  Search and Filter controls */}
            <div>
                <h3>Find Tasks</h3>
                {/*  Added wrapper div with class for flex layout */}
                <div className="find-tasks-form">
                    <input
                        type="text"
                        placeholder="Search by text..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                        <option value="">All Priorities</option>
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                    </select>
                </div>
            </div>
            
            <hr />

            {/* ✨ Todo List */}
            <ol className="task-list">
                {todos.map((todo) => (
                    <li 
                        key={todo._id} 
                        // ✨ REMOVED inline style
                        // ✨ ADDED dynamic classes for priority and overdue status
                        className={`
                            task-item 
                            priority-${todo.priority.toLowerCase()}
                            ${todo.isOverdue ? 'overdue' : ''}
                        `}
                    >
                        <input
                            type="checkbox"
                            checked={!!todo.completed}
                            onChange={(e) => handleToggleComplete(todo._id, e.target.checked)}
                        />

                        {editId !== todo._id ? (
                            <>
                                {/* ✨ Added .task-details wrapper for layout */}
                                <div className="task-details">
                                    <span>
                                        <strong>{todo.text}</strong>
                                        <em> (Priority: {todo.priority})</em>
                                    </span>
                                    {/* ✨ Added .due-date class for styling */}
                                    {todo.dueDate && <span className="due-date">Due: {formatDate(todo.dueDate)}</span>}
                                </div>
                                
                                {/* ✨ Added .task-actions wrapper for buttons */}
                                <div className="task-actions">
                                    <button onClick={() => handleDeleteTodo(todo._id)} className="btn-danger">Delete</button>
                                    <button onClick={() => handleEditTodo(todo)} className="btn-secondary">Edit</button>
                                </div>
                            </>
                        ) : (
                            // ✨ This is the edit-in-place form
                            // ✨ We wrap it in a div to apply flex layout
                            <div className="task-item-edit-form">
                                <input
                                    type="text"
                                    value={editData.text}
                                    onChange={(e) => setEditData({ ...editData, text: e.target.value })}
                                />
                                <select value={editData.priority} onChange={(e) => setEditData({ ...editData, priority: e.target.value })}>
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                                <input 
                                    type="date" 
                                    value={editData.dueDate}
                                    onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                                />
                                <button onClick={handleUpdateTodo} className="btn-primary">Update</button>
                                <button onClick={() => setEditId(null)} className="btn-secondary">Cancel</button>
                            </div>
                        )}
                    </li>
                ))}
            </ol>

            {/* Pagination Controls */}
            <div className="pagination">
                <button onClick={() => setPage(p => p - 1)} disabled={page <= 1}>
                    Previous
                </button>
                <span> Page {page} of {totalPages} </span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages}>
                    Next
                </button>
            </div>
        </div>
    );
}

export default App;