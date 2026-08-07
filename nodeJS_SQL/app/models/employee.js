const { DataTypes } = require("sequelize");

const sequelize = require("../config/db");

const Employee = sequelize.define("employee", {

    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    salary: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },

    image: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    address: {
        type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = Employee;