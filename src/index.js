import express from 'express';
const app = express();
const port = 8000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Sports Engine Active');
});

app.listen(port, () => {
  console.log('Server running at http://localhost:8000');
});