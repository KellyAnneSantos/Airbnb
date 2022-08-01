const router = require("express").Router();
const sessionRouter = require("./session.js");
const usersRouter = require("./users.js");
const spotsRouter = require("./spots.js");
const reviewsRouter = require("./reviews.js");
const bookingsRouter = require("./bookings.js");
const imagesRouter = require("./images.js");

router.use("/session", sessionRouter);

router.use("/users", usersRouter);

router.use("/spots", eventsRouter);

// router.use("/reviews", groupsRouter);

// router.use("/bookings", imagesRouter);

// router.use("/images", venuesRouter);

router.post("/test", function (req, res) {
  res.json({ requestBody: req.body });
});

module.exports = router;
