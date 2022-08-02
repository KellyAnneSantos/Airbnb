const express = require("express");

const router = express.Router();

const { Booking, Spot } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateBooking = [
  check("endDate")
    .custom((value, { req }) => value > req.body.startDate)
    .withMessage("endDate cannot come before startDate"),
  handleValidationErrors,
];

router.put("/:bookingId", requireAuth, validateBooking, async (req, res) => {
  const { user } = req;
  let { startDate, endDate } = req.body;
  const { bookingId } = req.params;

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    res.status(404);
    return res.json({
      message: "Booking couldn't be found",
      statusCode: 404,
    });
  }

  const date = new Date(startDate);
  const today = new Date();
  if (date < today) {
    res.status(403);
    return res.json({
      message: "Past bookings can't be modified",
      statusCode: 403,
    });
  }

  if (user.id === booking.userId) {
    const updatedBooking = await booking.update({
      startDate,
      endDate,
    });

    return res.json(updatedBooking);
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.delete("/:bookingId", requireAuth, async (req, res) => {
  const { bookingId } = req.params;
  const { user } = req;

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    res.status(404);
    return res.json({
      message: "Booking couldn't be found",
      statusCode: 404,
    });
  }

  const date = new Date(startDate);
  const today = new Date();
  if (date < today) {
    res.status(403);
    return res.json({
      message: "Bookings that have been started can't be deleted",
      statusCode: 403,
    });
  }

  const spots = Spot.findByPk(booking.spotId);

  if (user.id === booking.userId || user.id === spots.ownerId) {
    await booking.destroy();

    return res.json({
      message: "Successfully deleted",
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

module.exports = router;
