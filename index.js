// Redeploy solicitado via GitHub
import express from 'express';
import pkg from 'ioredis';
const Redis = pkg;
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL);

const TTL = 60 * 60 * 24 * 365; // 1 ano

app.get('/verificar', async (req, res) => {
  const { telefone, email } = req.query;

  if (!telefone && !email) {
    return res.status(400).json({ erro: 'Telefone ou email é obrigatório' });
  }

  const chave = telefone
    ? 'dieta_entregue:' + telefone
    : 'cliente:' + email;

  const data = await redis.get(chave);
  return res.json({ ja_recebeu: !!data });
});

app.post('/marcar', async (req, res) => {
  const { telefone } = req.body;
  if (!telefone) return res.status(400).json({ erro: 'Telefone é obrigatório' });

  await redis.set('dieta_entregue:' + telefone, 'true', 'EX', TTL);
  return res.json({ status: 'ok' });
});

app.get('/', (_, res) => res.send('API rodando ✔️'));

const port = process.env.PORT;
app.listen(port, () => console.log('API online na porta ' + port));
