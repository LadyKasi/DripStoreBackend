require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const routes = require('./routes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Documentação da API via Swagger UI
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/docs', (req, res) => res.redirect('/swagger'));
app.use('/api-docs', (req, res) => res.redirect('/swagger'));

// Rotas da versão 1 da API
app.use('/v1', routes);

// Rota raiz para verificação de status
app.get('/', (req, res) => {
  return res.status(200).json({
    projeto: 'dripStoreBackend',
    status: 'online',
    documentacao: '/swagger'
  });
});

// Middleware de tratamento de erros
app.use(errorMiddleware);

module.exports = app;

