const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(
      `🚀 SkillVista Backend running on port ${config.port} [${config.nodeEnv}]`
    );
  });
};

startServer();
