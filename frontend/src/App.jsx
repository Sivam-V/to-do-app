// import React, { useState, useEffect } from 'react';

// This is a basic functional component for your App.
// You can place this logic in your App.js or any other component.
// function App() {

//     // --- 1. STATE MANAGEMENT ---
//     // We need to store two pieces of information in our component's state:
//     // a) The list of all todo items we get from the server.
//     // b) The text the user is currently typing into the input box.
//     const [todos, setTodos] = useState([]); // Starts as an empty array
//     const [inputText, setInputText] = useState(''); // Starts as an empty string

//     // --- 2. FETCHING EXISTING TODOS (GET Request) ---
//     // The `useEffect` hook is perfect for running code when the component first loads.
//     // We use it here to fetch all the todos from your backend as soon as the app is ready.
//     useEffect(() => {
//         // We define an async function inside the effect to use await
//         const fetchTodos = async () => {
//             try {
//                 // Your backend is running on port 5000, so we fetch from that URL.
//                 const response = await fetch('http://localhost:5000/api/todos');
                
//                 // Check if the request was successful
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
                
//                 const data = await response.json();
//                 setTodos(data); // Update our state with the todos from the server
//             } catch (error) {
//                 console.error("Could not fetch todos:", error);
//             }
//         };

//         fetchTodos(); // Call the function to execute the fetch
//     }, []); // The empty array `[]` tells React to run this effect only ONCE, when the component mounts.

//     // --- 3. HANDLING THE FORM SUBMISSION (POST Request) ---
//     // This function will be called when the user submits the form to add a new todo.
//     const handleFormSubmit = async (e) => {
//         // e.preventDefault() stops the browser from doing a full page reload,
//         // which is the default behavior for HTML forms.
//         e.preventDefault();

//         // Basic validation: do nothing if the input is empty.
//         if (!inputText.trim()) {
//             alert("Please enter some text for your todo!");
//             return;
//         }

//         try {
//             // Here we send the new todo to your backend API.
//             const response = await fetch('http://localhost:5000/api/todos', {
//                 method: 'POST', // We specify the POST method
//                 headers: {
//                     // This header tells the server we are sending data in JSON format.
//                     'Content-Type': 'application/json',
//                 },
//                 // The `body` is the actual data. `JSON.stringify` converts our JS object
//                 // to a JSON string that the server can understand.
//                 // The key `text` must match what your backend expects (`req.body.text`).
//                 body: JSON.stringify({ text: inputText }),
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             // The server responds with the newly created todo item (including its _id).
//             const newTodoFromServer = await response.json();

//             // To make the UI update instantly, we add the new todo to our existing
//             // `todos` state array.
//             setTodos([...todos, newTodoFromServer]);

//             // Finally, we clear the input box for the next entry.
//             setInputText('');

//         } catch (error) {
//             console.error("Could not add the new todo:", error);
//             alert("There was an error saving your todo.");
//         }
//     };

//     // --- 4. JSX - The User Interface ---
//     // This is the HTML-like structure. You can design this part however you like!
//     // The important parts are `onSubmit`, `value`, and `onChange`.
//     return (
//         <div>
//             <h1>My Todo List</h1>
            
//             {/* When this form is submitted, it will call our handleFormSubmit function */}
//             <form onSubmit={handleFormSubmit}>
//                 <input
//                     type="text"
//                     placeholder="What do you need to do?"
//                     // The `value` is tied to our `inputText` state.
//                     value={inputText}
//                     // `onChange` updates the state every time the user types.
//                     onChange={(e) => setInputText(e.target.value)}
//                 />
//                 <button type="submit">Add Todo</button>
//             </form>

//             {/* We map over the `todos` array in our state to display each one. */}
//             <ul>
//                 {todos.map((todo) => (
//                     // The `key` needs to be a unique value. The `_id` from MongoDB is perfect for this.
//                     <li key={todo._id}>
//                         {todo.text}
//                     </li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// export default App;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// function App() {

//     const [todoItem, setTodoItem] = useState('')
//     const [todos, setTodos] = useState([])
    
//     const API_URL = 'http://localhost:5000/api/todos'
//     useEffect(() => {
//         axios.get(API_URL)
//         .then(response => setTodos(response.data))
//         .catch(err => console.log('Error while give GET request'))
//     }, [])


//     function handleFormSubmit() {
//         e.preventDefault()
        
//         axios.post(API_URL, {text : todoItem})
//         .then(response => setTodos([...todos, response.data]))
//         .catch(err => console.log('Error while send the task to the backend'))

//         // reset 
//         setTodoItem('')
//     }
    
//     return (
//         <div>
//             <h1>My Todo List</h1>
//             <form onSubmit={handleFormSubmit}>
//                 <input
//                     type="text"
//                     placeholder="What do you need to do?"
//                     value={todoItem}
//                     onChange={(e) => setTodoItem(e.target.value)}
//                 />
//                 <button type="submit">Add Todo</button>
//             </form>

//             <ul>
//                 {todos.map((todo) => (
//                     <li key={todo._id}>{todo.text}</li>
//                 ))}
//             </ul>
//         </div>
//     );
// }

// export default App;



import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
    const [todos, setTodos] = useState([]);
    const [todoItem, setTodoItem] = useState('');
    const API_URL = 'http://localhost:5000/api/todos';

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

        // send the delete responce
        axios.delete(`http://localhost:5000/api/todos/${id}`) 
            .then(response => {
                setTodos(response.data) // rerender iam not send the {message : ....}
            })
            .catch(err => console.log('failed to deleted the todo '))

    }

    return (
        <div>
            <h1>My Todo List</h1>
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
                        {todo.text} 
                        <button onClick={() => handleDeleteTodo(todo._id)}>delete</button>
                        <button>edit</button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default App;
