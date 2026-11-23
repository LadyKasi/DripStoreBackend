const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas
router.get('/search', (req, res, next) => categoryController.pesquisar(req, res, next));
router.get('/:id', (req, res, next) => categoryController.obterPorId(req, res, next));

// Rotas protegidas por JWT
router.post('/', authMiddleware, (req, res, next) => categoryController.criar(req, res, next));
router.put('/:id', authMiddleware, (req, res, next) => categoryController.atualizar(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => categoryController.deletar(req, res, next));

module.exports = router;

