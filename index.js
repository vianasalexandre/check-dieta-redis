import express from 'express';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

const TTL = 60 * 60 * 24 * 365; // 1 ano

app.get('/verificar', async (req, res) => {
  const { telefone } = req.query;
  if (!telefone) return res.status(400).json({ erro: 'Telefone é obrigatório' });

  const data = await redis.get('appmax_data:' + telefone);
  return res.json({ ja_recebeu: !!data });
});

app.post('/marcar', async (req, res) => {
  const { telefone } = req.body;
  if (!telefone) return res.status(400).json({ erro: 'Telefone é obrigatório' });

  await redis.set('appmax_data:' + telefone, 'true', 'EX', TTL);
  return res.json({ status: 'ok' });
});

app.get('/', (_, res) => res.send('API rodando ✔️'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log('API online na porta ' + port));