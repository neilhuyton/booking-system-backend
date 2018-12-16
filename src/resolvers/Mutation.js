const jwt = require("jsonwebtoken");

const Mutation = {
  async addToCart(parent, args, ctx, info) {
    let { cartId } = ctx.request;

    if (!cartId) {
      const cart = await ctx.db.mutation.createCart(
        {
          data: {}
        },
        info
      );

      cartId = cart.id;
    }

    const token = jwt.sign({ cartId }, process.env.APP_SECRET);

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    const [existingCartUnit] = await ctx.db.query.cartUnits({
      where: {
        unit: { id: args.id }
      }
    });
    if (existingCartUnit) {
      console.log("This unit is already in their cart");
      return ctx.db.mutation.updateCartUnit(
        {
          where: { id: existingCartUnit.id },
          data: { quantity: existingCartUnit.quantity + 1 }
        },
        info
      );
    }
    return ctx.db.mutation.createCartUnit(
      {
        data: {
          cart: {
            connect: { id: cartId }
          },
          arrive: args.arrive,
          depart: args.depart,
          unit: {
            connect: { id: args.id }
          }
        }
      },
      info
    );
  },
  async createCart(parent, args, ctx, info) {
    const cart = await ctx.db.mutation.createCart(
      {
        data: {
          ...args
        }
      },
      info
    );

    const token = jwt.sign({ cartId: cart.id }, process.env.APP_SECRET);

    ctx.response.cookie("token", token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365 // 1 year cookie
    });

    return cart;
  },
  async createCustomer(parent, args, ctx, info) {
    const customer = await ctx.db.mutation.createCustomer(
      {
        data: {
          ...args
        }
      },
      info
    );

    return customer;
  },
  async createUnit(parent, args, ctx, info) {
    const unit = await ctx.db.mutation.createUnit(
      {
        data: {
          ...args
        }
      },
      info
    );

    return unit;
  },
  async createBooking(parent, args, ctx, info) {
    let customer = await ctx.db.query.customer(
      {
        where: {
          email: args.email
        }
      },
      info
    );

    if (!customer) {
      customer = await ctx.db.mutation.createCustomer(
        {
          data: {
            firstName: args.firstName,
            lastName: args.lastName,
            address1: args.address1,
            address2: args.address2,
            town: args.town,
            county: args.county,
            postCode: args.postCode,
            country: args.country,
            phone1: args.phone1,
            phone2: args.phone2,
            email: args.email
          }
        },
        info
      );
    }

    const cart = await ctx.db.query.cart(
      {
        where: { id: ctx.request.cartId }
      },
      `{ id 
        cartUnits {
          id, 
          arrive, 
          depart, 
          quantity,
          unit {
            id
            title
            description
          }
        }
      }`
    );

    const bookingUnits = cart.cartUnits.map(cartUnit => {
      const bookingUnit = {
        ...cartUnit,
        unit: {
          connect: {
            id: cartUnit.unit.id
          }
        }
      };
      delete bookingUnit.id;
      return bookingUnit;
    });

    const booking = await ctx.db.mutation.createBooking(
      {
        data: {
          bookingUnits: { create: bookingUnits },
          customer: {
            connect: {
              id: customer.id
            }
          }
        }
      },
      info
    );

    return booking;
  },
  updateUnit(parent, args, ctx, info) {
    const updates = { ...args };
    delete updates.id;
    return ctx.db.mutation.updateUnit(
      {
        data: updates,
        where: {
          id: args.id
        }
      },
      info
    );
  }
};

module.exports = Mutation;
