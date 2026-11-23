const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas
router.post('/token', (req, res, next) => userController.gerarToken(req, res, next));
router.post('/', (req, res, next) => userController.criar(req, res, next));
router.get('/:id', (req, res, next) => userController.obterPorId(req, res, next));

// Rotas protegidas por JWT
router.put('/:id', authMiddleware, (req, res, next) => userController.atualizar(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => userController.deletar(req, res, next));

module.exports = router;

