const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Employee = sequelize.define('Employee', {
  employeeId: {
    type: DataTypes.STRING,
    primaryKey: true
  },
  jobGroup: {
    type: DataTypes.ENUM('A', 'B'),
    allowNull: false
  }
});

module.exports = Employee;
