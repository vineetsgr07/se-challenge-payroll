const express = require('express');
const app = express();
const sequelize = require('./models');
const payrollRoutes = require('./routes/payrollRoutes');
const errorHandler = require('./middlewares/errorHandler');

app.use(express.json());
app.use('/api', payrollRoutes);
app.use(errorHandler);

sequelize.sync().then(() => {
  app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });
});
