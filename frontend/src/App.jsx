import React, { useState, useEffect } from 'react';
import axios from 'axios';


function App() {
    const [todos, setTodos] = useState([]);
    const [todoItem, setTodoItem] = useState('');
    const API_URL = 'http://localhost:5000/api/todos';
    const [editId, setEditId] = useState(null);
    const [editTodoItem, setEditTodoItem] = useState('');

    // GET todos
    useEffect(() => {
        axios.get(API_URL)
            .then(response => {
                setTodos(response.data)
            })
            .catch(err => console.error('Error while fetching todos:', err));
    }, []);


    // POST new todo
    function handleFormSubmit(e) {
        e.preventDefault();
        if (!todoItem.trim()) {
            alert('Please enter a todo');
            return;
        }
        axios.post(API_URL, { text: todoItem })
            .then(response =>  {
                setTodos([...todos, response.data])
                setTodoItem('');
            })
            .catch(err => console.error('Error while sending the task to backend:', err));
    }

    function handleDeleteTodo(id) {
        // send the delete request
        axios.delete(`http://localhost:5000/api/todos/${id}`) 
            .then(response => {
                setTodos(response.data) // rerender iam not send the {message : ....}
            })
            .catch(err => console.log('failed to deleted the todo '))
    }

    function handleEditTodo(editId, todoText) {
        setEditId(editId)
        setEditTodoItem(todoText)
        console.log('id changed successfully...')
    }

    function handleUpdateTodo() {
        // send the update request
        axios.put(`http://localhost:5000/api/todos/${editId}`, {text: editTodoItem})
            .then(response => {
                setTodos(response.data)
                setEditId(null)
            })
            .catch(err => console.log('failed to update the todo'))
    }

    return (
        <div>
            <h1>My Planner</h1>
            <form onSubmit={handleFormSubmit}>
                <input
                    type="text"
                    value={todoItem}
                    onChange={(e) => setTodoItem(e.target.value)}
                    placeholder="Enter a todo"
                />
                <button type="submit">Add</button>
            </form>

            <ul>
                {todos && todos.map((todo, index) => (

                    <li key={todo._id}> 
        
                        {editId !== todo._id ? 
                        (
                            <>
                                {todo.text} 
                                <button onClick={() => handleDeleteTodo(todo._id)}>delete</button>
                                <button onClick={() => handleEditTodo(todo._id, todo.text)}>edit</button>
                            </>
                        ) :
                        (
                            <>
                                <input type="text" value={editTodoItem} onChange={(e) => setEditTodoItem(e.target.value)}/>
                                <button onClick={() => handleUpdateTodo()}>update</button>
                            </>
                        )}
                
                    </li>
                    
                ))}
            </ul>
        </div>
    );
}

export default App;
