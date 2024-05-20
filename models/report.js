const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const Employee = require('./employee');

const Report = sequelize.define('Report', {
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hoursWorked: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  reportId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

Report.belongsTo(Employee, { foreignKey: 'employeeId' });

module.exports = Report;
