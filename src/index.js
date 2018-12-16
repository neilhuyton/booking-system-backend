const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const Security = require("./Security");

require("dotenv").config({ path: "variables.env" });
const createServer = require("./createServer");
const db = require("./db");

const server = createServer();
const session = require("express-session");

server.express.use(cookieParser());

// decode the JWT so we can get the user Id on each request
server.express.use((req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const { cartId } = jwt.verify(token, process.env.APP_SECRET);
    // put the cartId onto the req for future requests to access
    req.cartId = cartId;
  }
  next();
});

server.express.use(async (req, res, next) => {
  // if they aren't logged in, skip this
  if (!req.cartId) return next();
  const cart = await db.query.cart(
    { where: { id: req.cartId } }
    // "{ id, permissions, email, name }"
  );
  req.cart = cart;
  next();
});

// // 2. Create a middleware that populates the user on each request
// server.express.use(async (req, res, next) => {
//   // if they aren't logged in, skip this
//   if (!req.userId) return next();
//   const user = await db.query.user(
//     { where: { id: req.userId } },
//     "{ id, permissions, email, name }"
//   );
//   req.user = user;
//   next();
// });

server.start(
  {
    cors: {
      credentials: true,
      origin: process.env.FRONTEND_URL
    }
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
