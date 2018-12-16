const { forwardTo } = require("prisma-binding");

const Query = {
  async booking(parent, args, ctx, info) {
    const booking = await ctx.db.query.booking(
      {
        where: { id: args.id }
      },
      info
    );

    return booking;
  },
  async cart(parent, args, ctx, info) {
    const cart = await ctx.db.query.cart(
      {
        where: { id: ctx.request.cartId }
      },
      info
    );

    return cart;
  },
  async bookingUnits(parent, args, ctx, info) {
    return ctx.db.query.bookingUnits({}, info);
  },
  async cartUnits(parent, args, ctx, info) {
    const cartUnits = await ctx.db.query.cartUnits(
      {
        where: { cart: { id: ctx.request.cartId } }
      },
      info
    );

    return cartUnits;
  },
  async units(parent, args, ctx, info) {
    return ctx.db.query.units({}, info);
  }
};

module.exports = Query;
