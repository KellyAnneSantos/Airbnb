const express = require("express");

const router = express.Router();

const { Image, Spot, User, sequelize } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateSpot = [
  check("address")
    .exists({ checkFalsy: true })
    .withMessage("Street address is required"),
  check("city").exists({ checkFalsy: true }).withMessage("City is required"),
  check("state").exists({ checkFalsy: true }).withMessage("State is required"),
  check("country")
    .exists({ checkFalsy: true })
    .withMessage("Country is required"),
  check("lat")
    .isFloat({ min: -90.0, max: 90.0 })
    .withMessage("Latitude is not valid"),
  check("lng")
    .isFloat({ min: -180.0, max: 180.0 })
    .withMessage("Longitude is not valid"),
  check("name")
    .isLength({ min: 1, max: 50 })
    .withMessage("Name must be 50 characters or less"),
  check("description")
    .exists({ checkFalsy: true })
    .withMessage("Description is required"),
  check("price")
    .exists({ checkFalsy: true })
    .withMessage("Price per day is required"),
  handleValidationErrors,
];

router.get("/:spotId", async (req, res) => {
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  const spots = await Spot.findByPk(spotId, {
    include: [
      {
        model: Image,
        attributes: ["id", "imageableId", "url"],
      },
      {
        model: User,
        as: "Owner",
        attributes: ["id", "firstName", "lastName"],
      },
    ],
    attributes: [
      "id",
      "ownerId",
      "address",
      "city",
      "state",
      "country",
      "lat",
      "lng",
      "name",
      "description",
      "price",
      "createdAt",
      "updatedAt",
      [sequelize.col("Images.url"), "previewImage"],
    ],
  });

  res.json(spots);
});

router.get("/", async (req, res) => {
  const Spots = await Spot.findAll({
    include: [
      {
        model: Image,
        attributes: [],
      },
    ],
    attributes: [
      "id",
      "ownerId",
      "address",
      "city",
      "state",
      "country",
      "lat",
      "lng",
      "name",
      "description",
      "price",
      "createdAt",
      "updatedAt",
      [sequelize.col("Images.url"), "previewImage"],
    ],
  });
  return res.json({
    Spots,
  });
});

router.post("/", requireAuth, validateSpot, async (req, res) => {
  const { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const { user } = req;

  const newSpot = await Spot.create({
    ownerId: user.id,
    address,
    city,
    state,
    country,
    lat,
    lng,
    name,
    description,
    price,
  });

  res.status(201);
  return res.json(newSpot);
});

module.exports = router;
