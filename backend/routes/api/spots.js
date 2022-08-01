const express = require("express");

const router = express.Router();

const { Image, Spot, sequelize } = require("../../db/models");

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
      [sequelize.col("Image.url"), "previewImage"],
    ],
  });
  return res.json({
    Spots,
  });
});

module.exports = router;
