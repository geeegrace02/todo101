const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 15000;

// env override or local default (use 127.0.0.1 to avoid IPv6 issues)
const mongoURL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/todos';

app.use(cors());
app.use(express.json());

// Mongoose Schema & Model
const Task = mongoose.model(
  'Task',
  new mongoose.Schema({
    text: String,
    completed: Boolean
  })
);

// Routes
app.get('/tasks', async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post('/tasks', async (req, res) => {
  const task = await Task.create(req.body);
  res.json(task);
});

app.put('/tasks/:id', async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(task);
});

app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.sendStatus(204);
});

// Connect to MongoDB and start server only when ready
const connectWithRetry = () => {
  console.log('Trying to connect to MongoDB...');
  mongoose
    .connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => {
        console.log(`Backend running on port ${PORT}`);
      });
    })
    .catch(err => {
      console.error('MongoDB connection error. Retrying in 5s...', err.message);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();
