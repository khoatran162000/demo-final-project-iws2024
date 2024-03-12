// Import dependencies
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

// Create Express app
const app = express();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.log('Error connecting to MongoDB:', error);
});

// Define Todo schema
const todoSchema = new mongoose.Schema({
  title: String,
  description: String,
  dueDate: Date,
  status: String,
  userId: String
});

// Define Todo model
const Todo = mongoose.model('Todo', todoSchema);

// API Endpoints

// Retrieve all todo items
app.get('/todos', (req, res) => {
  const { status, dueDate, sortBy } = req.query;
  const filter = {};
  const sort = {};

  if (status) {
    filter.status = status;
  }

  if (dueDate) {
    filter.dueDate = dueDate;
  }

  if (sortBy) {
    const [sortField, sortOrder] = sortBy.split(':');
    sort[sortField] = sortOrder === 'desc' ? -1 : 1;
  }

  Todo.find(filter)
    .sort(sort)
    .exec((err, todos) => {
      if (err) {
        res.status(500).json({ error: 'Internal server error' });
      } else {
        res.json(todos);
      }
    });
});

// Create a new todo item
app.post('/todos', (req, res) => {
  const { title, description, dueDate, status } = req.body;
  const userId = req.headers.authorization;

  const todo = new Todo({
    title,
    description,
    dueDate,
    status,
    userId
  });

  todo.save((err, savedTodo) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(201).json(savedTodo);
    }
  });
});

// Retrieve a specific todo item by its ID
app.get('/todos/:id', (req, res) => {
  const todoId = req.params.id;
  Todo.findById(todoId, (err, todo) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
    } else {
      res.json(todo);
    }
  });
});

// Update a specific todo item by its ID
app.put('/todos/:id', (req, res) => {
  const todoId = req.params.id;
  const { title, description, dueDate, status } = req.body;

  Todo.findByIdAndUpdate(
    todoId,
    { title, description, dueDate, status },
    { new: true },
    (err, updatedTodo) => {
      if (err) {
        res.status(500).json({ error: 'Internal server error' });
      } else if (!updatedTodo) {
        res.status(404).json({ error: 'Todo not found' });
      } else {
        res.json(updatedTodo);
      }
    }
  );
});

// Delete a specific todo item by its ID
app.delete('/todos/:id', (req, res) => {
  const todoId = req.params.id;
  Todo.findByIdAndRemove(todoId, (err, removedTodo) => {
    if (err) {
      res.status(500).json({ error: 'Internal server error' });
    } else if (!removedTodo) {
      res.status(404).json({ error: 'Todo not found' });
    } else {
      res.json({ message: 'Todo deleted successfully' });
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});