module.exports = {
  apps: [
    {
      name: "osusearch.netamaru.id",
      script: "bun",
      args: `run start -p ${process.env.PORT || 3000}`,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
