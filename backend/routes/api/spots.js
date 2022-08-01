const express = require("express");

const router = express.Router();

const { Image, Spot, User, sequelize } = require("../../db/models");

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

module.exports = router;
