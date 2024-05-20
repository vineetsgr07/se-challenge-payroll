const { Op } = require('sequelize');
const Employee = require('../models/employee');
const Report = require('../models/report');
const parseCSV = require('../utils/parseCSV');
const path = require('path');
const fs = require('fs');

const uploadFile = async (req, res, next) => {
  try {
    const filePath = path.join(__dirname, '..', req.file.path);
    const data = await parseCSV(filePath);
    const reportId = parseInt(req.file.originalname.split('-')[2]);

    const existingReport = await Report.findOne({ where: { reportId } });
    if (existingReport) {
      fs.unlinkSync(filePath);
      const error = new Error('Report with this ID already exists');
      error.status = 400;
      error.line = 'uploadFile - existingReport check';
      throw error;
    }

    const records = data.map(row => ({
      date: row['date'],
      hoursWorked: parseFloat(row['hours worked']),
      employeeId: row['employee id'],
      jobGroup: row['job group'],
      reportId: reportId
    }));

    for (const record of records) {
      const { date, hoursWorked, employeeId, jobGroup } = record;

      if (!date || !hoursWorked || !employeeId || !jobGroup) {
        fs.unlinkSync(filePath); 
        const error = new Error('Invalid data in CSV file');
        error.status = 400;
        error.line = 'uploadFile - data validation';
        throw error;
      }

      await Employee.findOrCreate({ where: { employeeId }, defaults: { jobGroup } });
      await Report.create({ date, hoursWorked, employeeId, reportId });
    }

    fs.unlinkSync(filePath); 
    res.status(201).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error(`Error at line: ${error.line || 'unknown'} - ${error.message}`);
    next(error);
  }
};

const getPayrollReport = async (req, res, next) => {
  try {
    const reports = await Report.findAll({
      include: Employee,
      order: [['employeeId', 'ASC'], ['date', 'ASC']]
    });

    const payrollReport = {};
    reports.forEach((report) => {
      const payPeriod = getPayPeriod(report.date);
      const employeeId = report.employeeId;
      const jobGroup = report.Employee.jobGroup;
      const hourlyRate = jobGroup === 'A' ? 20 : 30;
      const amountPaid = report.hoursWorked * hourlyRate;

      if (!payrollReport[employeeId]) {
        payrollReport[employeeId] = {};
      }

      if (!payrollReport[employeeId][payPeriod]) {
        payrollReport[employeeId][payPeriod] = 0;
      }

      payrollReport[employeeId][payPeriod] += amountPaid;
    });

    const employeeReports = Object.entries(payrollReport).flatMap(([employeeId, periods]) => {
      return Object.entries(periods).map(([period, amountPaid]) => {
        const [startDate, endDate] = period.split(' to ');
        return {
          employeeId,
          payPeriod: { startDate, endDate },
          amountPaid: `$${amountPaid.toFixed(2)}`
        };
      });
    });

    res.json({ payrollReport: { employeeReports } });
  } catch (error) {
    next(error);
  }
};

const getPayPeriod = (date) => {
  const [year, month, day] = date.split('-');
  const dayNum = parseInt(day, 10);

  if (dayNum <= 15) {
    return `${year}-${month}-01 to ${year}-${month}-15`;
  } else {
    return `${year}-${month}-16 to ${year}-${month}-${new Date(year, month, 0).getDate()}`;
  }
};

module.exports = { uploadFile, getPayrollReport };
