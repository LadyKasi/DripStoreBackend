'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {
    const passwordHash = await bcrypt.hash('123@123', 10);

    // Seed de Usuários
    await queryInterface.bulkInsert('users', [
      {
        id: 1,
        firstname: 'Admin',
        surname: 'DripStore',
        email: 'admin@dripstore.com',
        password: passwordHash,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Seed de Categorias
    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Tênis',
        slug: 'tenis',
        use_in_menu: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 2,
        name: 'Camisetas',
        slug: 'camisetas',
        use_in_menu: true,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: 3,
        name: 'Acessórios',
        slug: 'acessorios',
        use_in_menu: false,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Seed de Produtos
    await queryInterface.bulkInsert('products', [
      {
        id: 1,
        enabled: true,
        name: 'Tênis Nike Revolution 6 Next Nature',
        slug: 'tenis-nike-revolution-6',
        use_in_menu: true,
        stock: 50,
        description: 'Tênis confortável ideal para corrida e dia a dia.',
        price: 399.90,
        price_with_discount: 299.90,
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // Seed de Imagens do Produto
    await queryInterface.bulkInsert('product_images', [
      {
        id: 1,
        product_id: 1,
        enabled: true,
        path: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'
      }
    ], {});

    // Seed de Opções do Produto
    await queryInterface.bulkInsert('product_options', [
      {
        id: 1,
        product_id: 1,
        title: 'Tamanho',
        shape: 'square',
        radius: 4,
        type: 'text',
        values: '38,39,40,41,42'
      }
    ], {});

    // Seed de Associação Produto x Categoria
    await queryInterface.bulkInsert('product_categories', [
      {
        product_id: 1,
        category_id: 1
      }
    ], {});
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('product_categories', null, {});
    await queryInterface.bulkDelete('product_options', null, {});
    await queryInterface.bulkDelete('product_images', null, {});
    await queryInterface.bulkDelete('products', null, {});
    await queryInterface.bulkDelete('categories', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};

