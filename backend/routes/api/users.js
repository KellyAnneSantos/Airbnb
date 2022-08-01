const express = require("express");

const { setTokenCookie, requireAuth } = require("../../utils/auth");
const { Image, User, Review, Spot, sequelize } = require("../../db/models");

const { check } = require("express-validator");
const { handleValidationErrors } = require("../../utils/validation");

const validateSignup = [
  check("firstName")
    .exists({ checkFalsy: true })
    .withMessage("First Name is required"),
  check("lastName")
    .exists({ checkFalsy: true })
    .withMessage("Last Name is required"),
  check("email")
    .exists({ checkFalsy: true })
    .isEmail()
    .withMessage("Invalid email."),
  check("username")
    .exists({ checkFalsy: true })
    .withMessage("Username is required"),
  check("username")
    .isLength({ min: 4 })
    .withMessage("Please provide a username with at least 4 characters."),
  check("username").not().isEmail().withMessage("Username cannot be an email."),
  check("password")
    .exists({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage("Password must be 6 characters or more."),
  handleValidationErrors,
];

const router = express.Router();

router.post("/signup", validateSignup, async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  const checkEmail = await User.findOne({ where: { email } });

  if (checkEmail) {
    let error = new Error("User already exists");
    error.status = 403;
    error.errors = ["User with that email already exists"];
    throw error;
  }

  const user = await User.signup({
    firstName,
    lastName,
    email,
    username,
    password,
  });

  const token = await setTokenCookie(res, user);

  return res.json({
    ...user.toSafeObject(),
    token,
  });
});

router.get("/users/current/spots", requireAuth, async (req, res) => {
  const { user } = req;

  const Spots = await Spot.findAll({
    where: {
      ownerId: user.id,
    },
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

router.get("/users/current/reviews", requireAuth, async (req, res) => {
  const { user } = req;

  const Reviews = await Review.findAll({
    where: {
      userId: user.id,
    },
    include: [
      {
        model: User,
        as: "User",
        attributes: ["id", "firstName", "lastName"],
      },
      {
        model: Spot,
        as: "Spot",
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
          "price",
        ],
      },
      {
        model: Image,
        attributes: ["id", "imageableId", "url"],
      },
    ],
    attributes: [
      "id",
      "userId",
      "spotId",
      "review",
      "stars",
      "createdAt",
      "updatedAt",
    ],
  });

  return res.json({
    Reviews,
  });
});

module.exports = router;
