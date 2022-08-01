const express = require("express");

const router = express.Router();

const { Image, Review, Spot, User, sequelize } = require("../../db/models");
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

router.get("/:spotId/reviews", async (req, res) => {
  const { spotId } = req.params;

  const spot = await Spot.findByPk(eventId);

  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  let Reviews = await Review.findAll({
    attributes: [
      "id",
      "userId",
      "spotId",
      "review",
      "stars",
      "createdAt",
      "updatedAt",
    ],
    include: [
      {
        model: User,
        as: "User",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Image,
        attributes: ["id", "imageableId", "url"],
      },
    ],
  });

  return res.json({
    Reviews,
  });
});

router.post("/:spotId/images", requireAuth, async (req, res) => {
  const { user } = req;
  let { spotId } = req.params;
  let { url } = req.body;

  spotId = parseInt(spotId);

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  if (spot.ownerId === user.Id) {
    const newImage = await Image.create({
      imageableId: spotId,
      imageableType: "spot",
      url,
    });

    let id = newImage.id;
    imageableId = newImage.imageableId;
    url = newImage.url;

    return res.json({
      id,
      imageableId,
      url,
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

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

router.put("/:spotId", requireAuth, validateSpot, async (req, res) => {
  const { user } = req;
  let { address, city, state, country, lat, lng, name, description, price } =
    req.body;
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  if (spot.ownerId === user.id) {
    const updatedSpot = await spot.update({
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

    let id = updatedSpot.id;
    let ownerId = updatedSpot.ownerId;
    let createdAt = updatedSpot.createdAt;
    let updatedAt = updatedSpot.updatedAt;

    return res.json({
      id,
      ownerId,
      address,
      city,
      state,
      country,
      lat,
      lng,
      name,
      description,
      price,
      createdAt,
      updatedAt,
    });
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});

router.delete("/:spotId", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { user } = req;

  const spot = await Event.findByPk(spotId);

  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id === spot.ownerId) {
    await spot.destroy();

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
