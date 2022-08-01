const express = require("express");

const router = express.Router();

const { Image, Review } = require("../../db/models");
const { requireAuth } = require("../../utils/auth");
const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateReview = [
  check("review")
    .exists({ checkFalsy: true })
    .withMessage("Review text is required"),
  check("stars")
    .isInt({ min: 1, max: 5 })
    .withMessage("Stars must be an integer from 1 to 5"),
  handleValidationErrors,
];

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

router.put("/:reviewId", requireAuth, validateReview, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const { user } = req;

  const reviews = await Review.findByPk(groupId);

  if (!reviews) {
    res.status(404);
    return res.json({
      message: "Review couldn't be found",
      statusCode: 404,
    });
  }

  if (user.id === reviews.userId) {
    await reviews.update({
      review,
      stars,
    });

    return res.json(reviews);
  } else {
    res.status(403);
    return res.json({
      message: "Forbidden",
      statusCode: 403,
    });
  }
});
