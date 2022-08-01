const express = require("express");

const router = express.Router();

const { Image, Review } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");

router.post("/:reviewId/images", requireAuth, async (req, res) => {
  const { user } = req;
  let { reviewId } = req.params;
  let { url } = req.body;

  reviewId = parseInt(reviewId);

  const review = await Review.findByPk(reviewId);

  if (!review) {
    res.status(404);
    return res.json({
      message: "Review couldn't be found",
      statusCode: 404,
    });
  }

  const images = await Image.findAll({
    where: {
      userId: user.id,
      reviewId,
    },
  });

  if (images.length >= 10) {
    res.status(403);
    return res.json({
      message: "Maximum number of images for this resource was reached",
      statusCode: 403,
    });
  } else {
    const newImage = await Image.create({
      imageableId: reviewId,
      imageableType: "review",
      url,
    });

    let id = newImage.id;
    let imageableId = newImage.imageableId;

    return res.json({
      id,
      imageableId,
      url,
    });
  }
});
