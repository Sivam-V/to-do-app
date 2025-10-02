import React, { useState, useEffect } from 'react';
import axios from 'axios';


function App() {
    const [todos, setTodos] = useState([]);
    const [todoItem, setTodoItem] = useState('');
    const API_URL = 'http://localhost:5000/api/todos';
    const [editId, setEditId] = useState(null);
    const [editTodoItem, setEditTodoItem] = useState('');


    useEffect(() => {
        axios.get(API_URL)
        .then(response => setTodos(response.data))
        .catch(err => console.error('Error while fetching todos:', err));
    }, []);


    function handleFormSubmit(e) {
        e.preventDefault();
        if (!todoItem.trim()) return alert('Please enter a todo');


        axios.post(API_URL, { text: todoItem })
            .then(response => {
                setTodos(prev => [...prev, response.data]);
                setTodoItem('');
            })
            .catch(err => console.error('Error while sending the task to backend:', err));
    }


    function handleDeleteTodo(id) {
        axios.delete(`${API_URL}/${id}`)
        .then(response => setTodos(response.data))
        .catch(err => console.error('failed to delete the todo', err));
    }


    function handleEditTodo(id, text) {
        setEditId(id);
        setEditTodoItem(text);
    }


    function handleUpdateTodo() {
        axios.put(`${API_URL}/${editId}`, { text: editTodoItem })
        .then(response => {
            setTodos(response.data);
            setEditId(null);
            setEditTodoItem('');
        })
        .catch(err => console.error('failed to update the todo', err));
    }


    // NEW: toggle completed (optimistic UI)
    function handleToggleComplete(id, newCompleted) {
    // optimistic update
        setTodos(prev => prev.map(t => t._id === id ? { ...t, completed: newCompleted } : t));


        axios.patch(`${API_URL}/${id}/complete`, { completed: newCompleted })
            .then(response => setTodos(response.data))
            .catch(err => {
            console.error('Failed to toggle completed', err);
        // rollback
            setTodos(prev => prev.map(t => t._id === id ? { ...t, completed: !newCompleted } : t));
        });
    }

    return (
        <div style={{ maxWidth: 600, margin: '2rem auto', padding: '1rem' }}>
            <h1>My Planner...</h1>


            <form onSubmit={handleFormSubmit} style={{ marginBottom: '1rem' }}>
            <input
                type="text"
                value={todoItem}
                onChange={(e) => setTodoItem(e.target.value)}
                placeholder="Enter a todo"
                style={{ padding: '0.5rem', width: '70%' }}
            />
                <button type="submit" style={{ padding: '0.5rem 1rem', marginLeft: '0.5rem' }}>Add</button>
            </form>


            <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                {todos.map((todo) => (
                <li key={todo._id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>


                    <input
                        type="checkbox"
                        checked={!!todo.completed}
                        onChange={(e) => handleToggleComplete(todo._id, e.target.checked)}
                    />


                    {editId !== todo._id ? (
                    <>
                        <span style={{ textDecoration: todo.completed ? 'line-through' : 'none', opacity: todo.completed ? 0.6 : 1, flex: 1 }}>
                            {todo.text}
                        </span>
                        <button onClick={() => handleDeleteTodo(todo._id)}>delete</button>
                        <button onClick={() => handleEditTodo(todo._id, todo.text)}>edit</button>
                    </>
                    ) : (
                    <>
                        <input type="text" value={editTodoItem} onChange={(e) => setEditTodoItem(e.target.value)} />
                        <button onClick={handleUpdateTodo}>update</button>
                        <button onClick={() => setEditId(null)}>cancel</button>
                    </>
                    )}

                </li>
                ))}
            </ul>
        </div>
        );
}

export default App;
