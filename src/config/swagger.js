const swaggerJSDoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Drip Store Backend API',
    version: '1.0.0',
    description: 'Documentação da API RESTful para o e-commerce Drip Store, desenvolvida com Express.js, Sequelize e MySQL.',
    contact: {
      name: 'Equipe Drip Store'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Servidor Local de Desenvolvimento'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Insira o token JWT gerado no endpoint /v1/user/token no formato: Bearer <token>'
      }
    },
    schemas: {
      Usuario: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          firstname: { type: 'string', example: 'João' },
          surname: { type: 'string', example: 'Silva' },
          email: { type: 'string', example: 'joao.silva@email.com' }
        }
      },
      CadastroUsuario: {
        type: 'object',
        required: ['firstname', 'surname', 'email', 'password', 'confirmPassword'],
        properties: {
          firstname: { type: 'string', example: 'João' },
          surname: { type: 'string', example: 'Silva' },
          email: { type: 'string', example: 'joao.silva@email.com' },
          password: { type: 'string', example: '123@123' },
          confirmPassword: { type: 'string', example: '123@123' }
        }
      },
      LoginUsuario: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'joao.silva@email.com' },
          password: { type: 'string', example: '123@123' }
        }
      },
      Categoria: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Calçados' },
          slug: { type: 'string', example: 'calcados' },
          use_in_menu: { type: 'boolean', example: true }
        }
      },
      Produto: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          enabled: { type: 'boolean', example: true },
          name: { type: 'string', example: 'Tênis Esportivo Drip' },
          slug: { type: 'string', example: 'tenis-esportivo-drip' },
          stock: { type: 'integer', example: 25 },
          description: { type: 'string', example: 'Tênis de alta performance' },
          price: { type: 'number', example: 299.90 },
          price_with_discount: { type: 'number', example: 249.90 },
          category_ids: {
            type: 'array',
            items: { type: 'integer' },
            example: [1, 2]
          },
          images: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                content: { type: 'string', example: '/uploads/img_tenis.png' }
              }
            }
          },
          options: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'integer', example: 1 },
                title: { type: 'string', example: 'Tamanho' },
                shape: { type: 'string', example: 'square' },
                radius: { type: 'string', example: '4px' },
                type: { type: 'string', example: 'text' },
                values: {
                  type: 'array',
                  items: { type: 'string' },
                  example: ['39', '40', '41', '42']
                }
              }
            }
          }
        }
      }
    }
  },
  paths: {
    '/v1/user/token': {
      post: {
        summary: 'Gera token JWT de autenticação',
        tags: ['Usuários / Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginUsuario' }
            }
          }
        },
        responses: {
          200: {
            description: 'Token gerado com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { token: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' } }
                }
              }
            }
          },
          400: { description: 'Credenciais inválidas ou ausentes' }
        }
      }
    },
    '/v1/user': {
      post: {
        summary: 'Cadastra um novo usuário',
        tags: ['Usuários / Autenticação'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CadastroUsuario' }
            }
          }
        },
        responses: {
          201: {
            description: 'Usuário cadastrado com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Usuario' }
              }
            }
          },
          400: { description: 'Dados incorretos ou e-mail já cadastrado' }
        }
      }
    },
    '/v1/user/{id}': {
      get: {
        summary: 'Obtém informações do usuário pelo ID',
        tags: ['Usuários / Autenticação'],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Dados do usuário retornados com sucesso',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Usuario' }
              }
            }
          },
          404: { description: 'Usuário não encontrado' }
        }
      },
      put: {
        summary: 'Atualiza um usuário existente',
        tags: ['Usuários / Autenticação'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstname: { type: 'string' },
                  surname: { type: 'string' },
                  email: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          204: { description: 'Usuário atualizado com sucesso' },
          400: { description: 'Dados inválidos' },
          401: { description: 'Token de autorização não enviado ou inválido' },
          404: { description: 'Usuário não encontrado' }
        }
      },
      delete: {
        summary: 'Remove um usuário pelo ID',
        tags: ['Usuários / Autenticação'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          204: { description: 'Usuário removido com sucesso' },
          401: { description: 'Token de autorização não enviado ou inválido' },
          404: { description: 'Usuário não encontrado' }
        }
      }
    },
    '/v1/category/search': {
      get: {
        summary: 'Lista e pesquisa categorias com paginação e filtros',
        tags: ['Categorias'],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 }, description: 'Itens por página (-1 para todos)' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Número da página' },
          { name: 'fields', in: 'query', schema: { type: 'string' }, description: 'Campos separados por vírgula (ex: name,slug)' },
          { name: 'use_in_menu', in: 'query', schema: { type: 'boolean' }, description: 'Filtrar se aparece no menu' }
        ],
        responses: {
          200: {
            description: 'Lista de categorias retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Categoria' } },
                    total: { type: 'integer' },
                    limit: { type: 'integer' },
                    page: { type: 'integer' }
                  }
                }
              }
            }
          },
          400: { description: 'Parâmetros de busca incorretos' }
        }
      }
    },
    '/v1/category': {
      post: {
        summary: 'Cadastra uma nova categoria',
        tags: ['Categorias'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'slug'],
                properties: {
                  name: { type: 'string', example: 'Calçados' },
                  slug: { type: 'string', example: 'calcados' },
                  use_in_menu: { type: 'boolean', example: true }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Categoria criada com sucesso', content: { 'application/json': { schema: { $ref: '#/components/schemas/Categoria' } } } },
          400: { description: 'Dados incorretos' },
          401: { description: 'Não autorizado' }
        }
      }
    },
    '/v1/category/{id}': {
      get: {
        summary: 'Obtém uma categoria pelo ID',
        tags: ['Categorias'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Categoria encontrada', content: { 'application/json': { schema: { $ref: '#/components/schemas/Categoria' } } } },
          404: { description: 'Categoria não encontrada' }
        }
      },
      put: {
        summary: 'Atualiza uma categoria',
        tags: ['Categorias'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  use_in_menu: { type: 'boolean' }
                }
              }
            }
          }
        },
        responses: {
          204: { description: 'Categoria atualizada' },
          400: { description: 'Dados incorretos' },
          401: { description: 'Não autorizado' },
          404: { description: 'Categoria não encontrada' }
        }
      },
      delete: {
        summary: 'Deleta uma categoria',
        tags: ['Categorias'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Categoria deletada' },
          401: { description: 'Não autorizado' },
          404: { description: 'Categoria não encontrada' }
        }
      }
    },
    '/v1/product/search': {
      get: {
        summary: 'Lista e pesquisa produtos com filtros avançados',
        tags: ['Produtos'],
        parameters: [
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 }, description: 'Itens por página (-1 para todos)' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 }, description: 'Número da página' },
          { name: 'fields', in: 'query', schema: { type: 'string' }, description: 'Campos separados por vírgula (ex: name,images,price)' },
          { name: 'match', in: 'query', schema: { type: 'string' }, description: 'Busca por texto no nome ou descrição' },
          { name: 'category_ids', in: 'query', schema: { type: 'string' }, description: 'IDs de categorias separados por vírgula' },
          { name: 'price-range', in: 'query', schema: { type: 'string' }, description: 'Faixa de preço (ex: 100-200)' }
        ],
        responses: {
          200: {
            description: 'Lista de produtos retornada com sucesso',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Produto' } },
                    total: { type: 'integer' },
                    limit: { type: 'integer' },
                    page: { type: 'integer' }
                  }
                }
              }
            }
          },
          400: { description: 'Parâmetros incorretos' }
        }
      }
    },
    '/v1/product': {
      post: {
        summary: 'Cadastra um novo produto com imagens e opções',
        tags: ['Produtos'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'slug', 'price', 'price_with_discount'],
                properties: {
                  enabled: { type: 'boolean', example: true },
                  name: { type: 'string', example: 'Tênis Esportivo Drip' },
                  slug: { type: 'string', example: 'tenis-esportivo-drip' },
                  stock: { type: 'integer', example: 10 },
                  description: { type: 'string', example: 'Descrição detalhada' },
                  price: { type: 'number', example: 199.90 },
                  price_with_discount: { type: 'number', example: 149.90 },
                  category_ids: { type: 'array', items: { type: 'integer' }, example: [1, 2] },
                  images: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string', example: 'image/png' },
                        content: { type: 'string', example: 'data:image/png;base64,...' }
                      }
                    }
                  },
                  options: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', example: 'Tamanho' },
                        shape: { type: 'string', enum: ['square', 'circle'], example: 'square' },
                        radius: { type: 'string', example: '4px' },
                        type: { type: 'string', enum: ['text', 'color'], example: 'text' },
                        values: { type: 'array', items: { type: 'string' }, example: ['38', '39', '40'] }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Produto criado com sucesso', content: { 'application/json': { schema: { $ref: '#/components/schemas/Produto' } } } },
          400: { description: 'Dados incorretos' },
          401: { description: 'Não autorizado' }
        }
      }
    },
    '/v1/product/{id}': {
      get: {
        summary: 'Obtém informações do produto por ID',
        tags: ['Produtos'],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          200: { description: 'Produto encontrado', content: { 'application/json': { schema: { $ref: '#/components/schemas/Produto' } } } },
          404: { description: 'Produto não encontrado' }
        }
      },
      put: {
        summary: 'Atualiza informações do produto, imagens e opções',
        tags: ['Produtos'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  name: { type: 'string' },
                  slug: { type: 'string' },
                  stock: { type: 'integer' },
                  description: { type: 'string' },
                  price: { type: 'number' },
                  price_with_discount: { type: 'number' },
                  category_ids: { type: 'array', items: { type: 'integer' } },
                  images: { type: 'array', items: { type: 'object' } },
                  options: { type: 'array', items: { type: 'object' } }
                }
              }
            }
          }
        },
        responses: {
          204: { description: 'Produto atualizado' },
          400: { description: 'Dados incorretos' },
          401: { description: 'Não autorizado' },
          404: { description: 'Produto não encontrado' }
        }
      },
      delete: {
        summary: 'Deleta um produto por ID',
        tags: ['Produtos'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: {
          204: { description: 'Produto deletado' },
          401: { description: 'Não autorizado' },
          404: { description: 'Produto não encontrado' }
        }
      }
    }
  }
};

const swaggerSpec = swaggerJSDoc({
  swaggerDefinition,
  apis: []
});

module.exports = swaggerSpec;

