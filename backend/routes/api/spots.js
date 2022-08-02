const express = require("express");

const router = express.Router();

const {
  Booking,
  Image,
  Review,
  Spot,
  User,
  sequelize,
} = require("../../db/models");
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

const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

const validateBooking = [
  check("endDate")
    .custom((value, { req }) => value >= req.body.startDate)
    .withMessage("endDate cannot be on or before startDate"),
  handleValidationErrors,
];

const validateQuery = [
  check("page")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Page must be greater than or equal to 0"),
  check("size")
    .optional({ nullable: true })
    .isInt({ min: 0 })
    .withMessage("Size must be greater than or equal to 0"),
  check("maxLat")
    .optional({ nullable: true })
    .isFloat({ max: 90.0 })
    .withMessage("Maximum latitude is invalid"),
  check("minLat")
    .optional({ nullable: true })
    .isFloat({ min: -90.0 })
    .withMessage("Minimum latitude is invalid"),
  check("minLng")
    .optional({ nullable: true })
    .isFloat({ min: -180.0 })
    .withMessage("Minimum longitude is invalid"),
  check("maxLng")
    .optional({ nullable: true })
    .isFloat({ max: 180.0 })
    .withMessage("Maximum longitude is invalid"),
  check("minPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0.0 })
    .withMessage("Minimum price must be greater than or equal to 0"),
  check("maxPrice")
    .optional({ nullable: true })
    .isFloat({ min: 0.0 })
    .withMessage("Minimum price must be greater than or equal to 0"),
  handleValidationErrors,
];

const mapSpots = async (spots) => {
  spots.forEach((spot) => {
    spot.dataValues.previewImage = spot.dataValues.Images.map((image) => {
      return image.url;
    });
    delete spot.dataValues.Images;
  });
  return spots;
};

router.get("/:spotId/reviews", async (req, res) => {
  const { spotId } = req.params;

  const spot = await Spot.findByPk(spotId);

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

router.get("/:spotId/bookings", requireAuth, async (req, res) => {
  const { spotId } = req.params;
  const { user } = req;

  const spot = await Spot.findByPk(spotId);

  if (!spot) {
    res.status(404);
    return res.json({
      message: "Spot couldn't be found",
      statusCode: 404,
    });
  }

  if (spot.ownerId !== user.id) {
    let Bookings = await Booking.findAll({
      where: {
        spotId: spot.id,
      },
      attributes: ["spotId", "startDate", "endDate"],
    });

    return res.json({
      Bookings,
    });
  } else {
    let Bookings = await Booking.findAll({
      where: {
        spotId: spot.id,
      },
      attributes: [
        "id",
        "userId",
        "spotId",
        "startDate",
        "endDate",
        "createdAt",
        "updatedAt",
      ],
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    return res.json({
      Bookings,
    });
  }
});

router.post(
  "/:spotId/reviews",
  requireAuth,
  validateReview,
  async (req, res) => {
    const { user } = req;
    let { spotId } = req.params;
    let { review, stars } = req.body;

    spotId = parseInt(spotId);

    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      res.status(404);
      return res.json({
        message: "Spot couldn't be found",
        statusCode: 404,
      });
    }

    const reviews = await Review.findOne({
      where: {
        userId: user.id,
        spotId,
      },
    });

    if (!reviews) {
      const newReview = await Review.create({
        userId: user.id,
        spotId,
        review,
        stars,
      });

      let id = newReview.id;
      let userId = newReview.userId;
      let createdAt = newReview.createdAt;
      let updatedAt = newReview.updatedAt;

      return res.json({
        id,
        userId,
        spotId,
        review,
        stars,
        createdAt,
        updatedAt,
      });
    } else {
      res.status(403);
      return res.json({
        message: "User already has a review for this spot",
        statusCode: 403,
      });
    }
  }
);

router.post(
  "/:spotId/bookings",
  requireAuth,
  validateBooking,
  async (req, res) => {
    const { user } = req;
    let { spotId } = req.params;
    let { startDate, endDate } = req.body;

    spotId = parseInt(spotId);

    const spot = await Spot.findByPk(spotId);

    if (!spot) {
      res.status(404);
      return res.json({
        message: "Spot couldn't be found",
        statusCode: 404,
      });
    }

    const booking = await Booking.findOne({
      where: {
        startDate,
      },
    });

    if (booking) {
      res.status(403);
      return res.json({
        message: "Start date conflicts with an existing booking",
        statusCode: 403,
      });
    }

    const bookings = await Booking.findOne({
      where: {
        endDate,
      },
    });

    if (bookings) {
      res.status(403);
      return res.json({
        message: "End date conflicts with an existing booking",
        statusCode: 403,
      });
    }

    const newBooking = await Booking.create({
      spotId,
      userId: user.id,
      startDate,
      endDate,
    });

    let id = newBooking.id;
    let userId = newBooking.userId;
    let createdAt = newBooking.createdAt;
    let updatedAt = newBooking.updatedAt;

    return res.json({
      id,
      spotId,
      userId,
      startDate,
      endDate,
      createdAt,
      updatedAt,
    });
  }
);

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

router.get("/", validateQuery, async (req, res) => {
  let { page, size, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } =
    req.query;

  let where = {};
  let pagination = {};

  if (!page) {
    page = 0;
  }

  if (!size) {
    size = 20;
  }

  if (Number.isNaN(page) || page < 0 || page > 10) {
    page = 0;
  } else {
    page = page;
  }

  if (Number.isNaN(size) || size < 0 || size > 20) {
    size = 20;
  } else {
    size = size;
  }

  if (page > 0) {
    pagination.limit = size;
    pagination.offset = size * (page - 1);
  } else {
    pagination.limit = size;
  }

  if (minLat) {
    where.lat = {
      [Op.gte]: minLat,
    };
  }

  if (maxLat) {
    where.lat = {
      [Op.lte]: maxLat,
    };
  }

  if (minLng) {
    where.lng = {
      [Op.gte]: minLng,
    };
  }

  if (maxLng) {
    where.lng = {
      [Op.lte]: maxLng,
    };
  }

  if (minPrice) {
    where.price = {
      [Op.gte]: minPrice,
    };
  }

  if (maxPrice) {
    where.price = {
      [Op.lte]: maxPrice,
    };
  }

  const spots = await Spot.findAll({
    where: { ...where },
    ...pagination,
    include: [
      {
        model: Image,
        attributes: ["url"],
      },
    ],
  });

  const spotPreviews = await mapSpots(spots);

  return res.json({
    Spots: spotPreviews,
    page,
    size,
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
