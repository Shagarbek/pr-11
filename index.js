const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const ItemSchema = new mongoose.Schema({
  name: String,
  price: Number
});

const Item = mongoose.model('Item', ItemSchema);

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.get('/api/items', async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

app.get('/api/items/:id', async (req, res) => {
  const item = await Item.findById(req.params.id);
  res.json(item);
});

// POST
app.post('/api/items', async (req, res) => {
  const item = new Item(req.body);
  await item.save();
  res.json(item);
});

// PUT
app.put('/api/items/:id', async (req, res) => {
  const item = await Item.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  );
  res.json(item);
});

// DELETE
app.delete('/api/items/:id', async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: 'Item deleted' });
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
