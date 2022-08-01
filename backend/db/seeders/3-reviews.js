"use strict";

const { Review } = require("../models");

const reviews = [
  {
    userId: 2,
    spotId: 1,
    review: "testtesttesttesttesttesttesttesttesttesttesttesttesttest",
    stars: 5,
  },
  {
    userId: 3,
    spotId: 2,
    review: "testtesttesttesttesttesttesttesttesttesttesttesttesttest",
    stars: 5,
  },
  {
    userId: 4,
    spotId: 3,
    review: "testtesttesttesttesttesttesttesttesttesttesttesttesttest",
    stars: 5,
  },
  {
    userId: 5,
    spotId: 4,
    review: "testtesttesttesttesttesttesttesttesttesttesttesttesttest",
    stars: 5,
  },
  {
    userId: 1,
    spotId: 5,
    review: "testtesttesttesttesttesttesttesttesttesttesttesttesttest",
    stars: 5,
  },
  {
    userId: 2,
    spotId: 6,
    review: "testtesttesttesttesttesttesttesttesttesttesttesttesttest",
    stars: 5,
  },
  {
    userId: 3,
    spotId: 7,
    review: "testtesttesttesttesttesttesttesttesttesttesttesttesttest",
    stars: 5,
  },
  {
    userId: 4,
    spotId: 8,
    review: "testtesttesttesttesttesttesttesttesttesttesttesttesttest",
    stars: 5,
  },
  {
    userId: 5,
    spotId: 9,
    review: "testtesttesttesttesttesttesttesttesttesttesttesttesttest",
    stars: 5,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Review.bulkCreate(reviews, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Reviews", null, {});
  },
};
