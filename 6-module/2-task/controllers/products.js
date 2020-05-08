const Product = require('../models/Product');
const ObjectID = require('mongodb').ObjectID;

const productProjection = {
  title: 1,
  id: 1,
  category: 1,
  subcategory: 1,
  price: 1,
  description: 1,
  images: 1
};

function renderResults(products) {
  if (!products) {
    return [];
  }

  let result = [];
  for (let product of products) {
    result.push({
      title: product.title,
      id: product.id,
      category: product.category,
      subcategory: product.subcategory,
      price: product.price,
      description: product.description,
      images: product.images
    });
  }

  return result;
}

module.exports.productsBySubcategory = async function productsBySubcategory(ctx, next) {
  let subcategoryId = ctx.query.subcategory;

  if (subcategoryId) {
    let products = await Product.find({subcategory: subcategoryId}, productProjection);
    ctx.body = {products: renderResults(products)};
    return;
  }

  return next();
};

module.exports.productList = async function productList(ctx) {
  const products = await Product.find({}, productProjection);
  ctx.body = {products: renderResults(products)};
};

module.exports.productById = async function productById(ctx) {
  let productId = ctx.params.id;
  try {
    productId = new ObjectID(productId);
  } catch (e) {
    ctx.status = 400;
    return;
  }

  const product = await Product.findById(productId);
  if (product === null) {
    ctx.status = 404;
    return;
  }

  ctx.body = {product: product};
};

