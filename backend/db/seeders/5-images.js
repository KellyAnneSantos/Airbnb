"use strict";

const { Image } = require("../models");

const images = [
  {
    imageableId: 1,
    imageableType: "spot",
    url: "test1",
  },
  {
    imageableId: 2,
    imageableType: "spot",
    url: "test2",
  },
  {
    imageableId: 3,
    imageableType: "spot",
    url: "test3",
  },
  {
    imageableId: 4,
    imageableType: "spot",
    url: "test4",
  },
  {
    imageableId: 5,
    imageableType: "spot",
    url: "test5",
  },
  {
    imageableId: 6,
    imageableType: "spot",
    url: "test6",
  },
  {
    imageableId: 7,
    imageableType: "spot",
    url: "test7",
  },
  {
    imageableId: 8,
    imageableType: "spot",
    url: "test8",
  },
  {
    imageableId: 9,
    imageableType: "spot",
    url: "test9",
  },
  {
    imageableId: 1,
    imageableType: "review",
    url: "test10",
  },
  {
    imageableId: 2,
    imageableType: "review",
    url: "test11",
  },
  {
    imageableId: 3,
    imageableType: "review",
    url: "test12",
  },
  {
    imageableId: 4,
    imageableType: "review",
    url: "test13",
  },
  {
    imageableId: 5,
    imageableType: "review",
    url: "test14",
  },
  {
    imageableId: 6,
    imageableType: "review",
    url: "test15",
  },
  {
    imageableId: 7,
    imageableType: "review",
    url: "test16",
  },
  {
    imageableId: 8,
    imageableType: "review",
    url: "test17",
  },
  {
    imageableId: 9,
    imageableType: "review",
    url: "test18",
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    await Image.bulkCreate(images, {
      validate: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Images", null, {});
  },
};
