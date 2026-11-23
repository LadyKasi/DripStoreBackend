const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const ProductImage = require('./ProductImage');
const ProductOption = require('./ProductOption');
const ProductCategory = require('./ProductCategory');

// Relacionamentos Produto <-> Imagens (1:N)
Product.hasMany(ProductImage, {
  foreignKey: 'product_id',
  as: 'images',
  onDelete: 'CASCADE'
});
ProductImage.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// Relacionamentos Produto <-> Opções (1:N)
Product.hasMany(ProductOption, {
  foreignKey: 'product_id',
  as: 'options',
  onDelete: 'CASCADE'
});
ProductOption.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product'
});

// Relacionamentos Produto <-> Categoria (N:N através de ProductCategory)
Product.belongsToMany(Category, {
  through: ProductCategory,
  foreignKey: 'product_id',
  otherKey: 'category_id',
  as: 'categories'
});
Category.belongsToMany(Product, {
  through: ProductCategory,
  foreignKey: 'category_id',
  otherKey: 'product_id',
  as: 'products'
});

Product.hasMany(ProductCategory, {
  foreignKey: 'product_id',
  as: 'productCategories'
});
ProductCategory.belongsTo(Product, {
  foreignKey: 'product_id'
});

Category.hasMany(ProductCategory, {
  foreignKey: 'category_id',
  as: 'categoryProducts'
});
ProductCategory.belongsTo(Category, {
  foreignKey: 'category_id'
});

module.exports = {
  sequelize,
  User,
  Category,
  Product,
  ProductImage,
  ProductOption,
  ProductCategory
};

