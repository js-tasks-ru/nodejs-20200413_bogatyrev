const Order = require('../models/Order');
const Product = require('../models/Product');
const sendMail = require('../libs/sendMail');

module.exports.checkout = async function checkout(ctx, next) {
  const order = await Order.create({
    user: ctx.user,
    product: ctx.request.body.product,
    phone: ctx.request.body.phone,
    address: ctx.request.body.address,
  });

  const product = await Product.findById(ctx.request.body.product);

  await sendMail({
    template: 'order-confirmation',
    locals: {id: order.id, product: product},
    to: ctx.user.email,
    subject: 'Заказ оформлен',
  });

  ctx.status = 200;
  ctx.body = {order: order.id};
};

module.exports.getOrdersList = async function ordersList(ctx, next) {
  const orders = await Order.find({user: ctx.user});

  ctx.status = 200;
  ctx.body = {orders: orders};

};
