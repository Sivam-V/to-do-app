// import React, { useState, useEffect } from 'react';
import React, { useState, useEffect, useCallback } from 'react'; // ✨ FIX: Add useCallback here
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

    // ✨ NEW: Central function to fetch todos based on current state (page, search, filter)
    const fetchTodos = useCallback(async () => {
        try {
            // Construct query parameters
            const params = new URLSearchParams({
                page,
                limit: 10, // You can make this dynamic if you want
            });
            if (searchTerm) params.append('search', searchTerm);
            if (priorityFilter) params.append('priority', priorityFilter);

            const response = await axios.get(`${API_URL}?${params.toString()}`);
            setTodos(response.data.todos);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            console.error('Error while fetching todos:', err);
        }
    }, [page, searchTerm, priorityFilter]); // Re-run this function if these dependencies change

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
            dueDate: newTodoDueDate || null, // Send null if date is empty
        };

        axios.post(API_URL, newTodo)
            .then(() => {
                // Reset form and refetch todos to see the new one
                setNewTodoText('');
                setNewTodoPriority('Medium');
                setNewTodoDueDate('');
                setPage(1); // Go back to the first page to see the newest item
                fetchTodos();
            })
            .catch(err => console.error('Error while creating the task:', err));
    }

    function handleUpdateTodo() {
        if (!editData.text.trim()) return alert('Todo text cannot be empty');

        axios.put(`${API_URL}/${editId}`, {
                text: editData.text,
                priority: editData.priority,
                // Format date correctly before sending
                dueDate: editData.dueDate ? new Date(editData.dueDate).toISOString() : null
            })
            .then(response => {
                // Update the single todo in the list
                setTodos(prev => prev.map(t => t._id === editId ? response.data : t));
                setEditId(null);
            })
            .catch(err => console.error('failed to update the todo', err));
    }


    // === TODO ITEM ACTIONS ===

    function handleDeleteTodo(id) {
        axios.delete(`${API_URL}/${id}`)
            .then(() => {
                // After deleting, refetch the current page
                fetchTodos();
            })
            .catch(err => console.error('failed to delete the todo', err));
    }

    function handleEditTodo(todo) {
        setEditId(todo._id);
        setEditData({
            text: todo.text,
            priority: todo.priority,
            // Format date for the date input field, which expects 'YYYY-MM-DD'
            dueDate: todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''
        });
    }

    function handleToggleComplete(id, newCompleted) {
        axios.patch(`${API_URL}/${id}/complete`, { completed: newCompleted })
            .then(response => {
                // Update the single todo in the list
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
        <div>
            <h1>My Planner...</h1>

            {/* ✨ NEW: Form for adding a new todo */}
            <form onSubmit={handleAddTodo}>
                <h3>Add New Task</h3>
                <input
                    type="text"
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    placeholder="Enter a todo"
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
                <button type="submit">Add Task</button>
            </form>

            <hr />
            
            {/* ✨ NEW: Search and Filter controls */}
            <div>
                <h3>Find Tasks</h3>
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
            
            <hr />

            {/* Todo List */}
            <ol>
                {todos.map((todo) => (
                    <li key={todo._id} style={{
                        // ✨ NEW: Highlight overdue tasks in red
                        color: todo.isOverdue ? 'red' : 'black',
                        textDecoration: todo.completed ? 'line-through' : 'none'
                    }}>
                        <input
                            type="checkbox"
                            checked={!!todo.completed}
                            onChange={(e) => handleToggleComplete(todo._id, e.target.checked)}
                        />

                        {editId !== todo._id ? (
                            <>
                                <span>
                                    <strong>{todo.text}</strong>
                                    {/* ✨ NEW: Display Priority and Due Date */}
                                    <em> (Priority: {todo.priority})</em>
                                    {todo.dueDate && <em> - Due: {formatDate(todo.dueDate)}</em>}
                                </span>
                                <button onClick={() => handleDeleteTodo(todo._id)}>Delete</button>
                                <button onClick={() => handleEditTodo(todo)}>Edit</button>
                            </>
                        ) : (
                            <>
                                {/* ✨ NEW: Expanded Edit Form */}
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
                                <button onClick={handleUpdateTodo}>Update</button>
                                <button onClick={() => setEditId(null)}>Cancel</button>
                            </>
                        )}
                    </li>
                ))}
            </ol>

            {/* ✨ NEW: Pagination Controls */}
            <div>
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
