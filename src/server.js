const app = require('./app');
const config = require('./config/env');
const { sequelize } = require('./models');

const PORT = config.port || 5000;

sequelize.authenticate()
  .then(() => sequelize.sync())
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
