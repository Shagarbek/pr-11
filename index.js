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

app.get('/', async (req, res) => {
  const items = await Item.find().limit(10);

  const list = items.length
    ? items.map(i => `<li><a href="/api/items/${i._id}">/api/items/${i._id}</a> — ${i.name} (${i.price})</li>`).join('')
    : `<li>No items yet. Create one via POST /api/items</li>`;

  res.send(`
    <html>
      <head>
        <title>Shop API</title>
      </head>
      <body>
        <h1>Shop API</h1>
        <ul>
          <li><a href="/api/items">/api/items</a></li>
          ${list}
        </ul>
      </body>
    </html>
  `);
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

app.get('/version', (req, res) => {
  res.json({
    version: "1.1",
    updatedAt: "2026-01-21"
  });
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
