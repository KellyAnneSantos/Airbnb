"use strict";

const { Booking } = require("../models");

const bookings = [
  {
    spotId: 1,
    userId: 2,
    startDate: "2023-01-01",
    endDate: "2023-01-02",
  },
  {
    spotId: 2,
    userId: 3,
    startDate: "2023-01-03",
    endDate: "2023-01-04",
  },
  {
    spotId: 3,
    userId: 4,
    startDate: "2023-01-05",
    endDate: "2023-01-06",
  },
  {
    spotId: 4,
    userId: 5,
    startDate: "2023-01-07",
    endDate: "2023-01-08",
  },
  {
    spotId: 5,
    userId: 1,
    startDate: "2023-01-09",
    endDate: "2023-01-10",
  },
  {
    spotId: 6,
    userId: 2,
    startDate: "2023-01-11",
    endDate: "2023-01-12",
  },
  {
    spotId: 7,
    userId: 3,
    startDate: "2023-01-13",
    endDate: "2023-01-14",
  },
  {
    spotId: 8,
    userId: 4,
    startDate: "2023-01-15",
    endDate: "2023-01-16",
  },
  {
    spotId: 9,
    userId: 5,
    startDate: "2023-01-17",
    endDate: "2023-01-18",
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Booking.bulkCreate(bookings, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Bookings", null, {});
  },
};
