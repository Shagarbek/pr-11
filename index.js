const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const ItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 }
});

const Item = mongoose.model('Item', ItemSchema);

app.get('/', async (req, res) => {
  try {
    const items = await Item.find().limit(10);

    const list = items.length
      ? items
          .map(i => `<li><a href="/api/items/${i._id}">/api/items/${i._id}</a> — ${i.name} (${i.price})</li>`)
          .join('')
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
            <li><a href="/version">/version</a></li>
            ${list}
          </ul>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('<h1>Server error</h1>');
  }
});

//Task 12: Version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: '1.1',
    updatedAt: '2026-01-21'
  });
});

function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

//Task 13 REST API
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.get('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch item' });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required' });
    }

    const item = new Item({ name, price });
    await item.save();

    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item' });
  }
});
app.put('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    if (!name || price === undefined) {
      return res.status(400).json({ error: 'name and price are required for PUT' });
    }

    const updated = await Item.findByIdAndUpdate(
      id,
      { name, price },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// PATCH partial update
app.patch('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = await Item.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to patch item' });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid id format' });
    }

    const deleted = await Item.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }


    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
