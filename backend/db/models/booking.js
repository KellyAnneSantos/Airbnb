"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Booking.belongsTo(models.User, { foreignKey: "userId" });
      Booking.belongsTo(models.Spot, { as: "Spot", foreignKey: "spotId" });
    }
  }
  Booking.init(
    {
      spotId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        onDelete: "CASCADE",
      },
      userId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        onDelete: "CASCADE",
      },
      startDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      endDate: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "Booking",
    }
  );
  return Booking;
};
