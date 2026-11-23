'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_options', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      shape: {
        type: Sequelize.ENUM('square', 'circle'),
        defaultValue: 'square'
      },
      radius: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      type: {
        type: Sequelize.ENUM('text', 'color'),
        defaultValue: 'text'
      },
      values: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_options');
  }
};

