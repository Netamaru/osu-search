module.exports = {
  apps: [
    {
      name: "osusearch.netamaru.id",
      script: "node_modules/next/dist/bin/next",
      args: `start -p ${process.env.PORT || 3000}`,
      env: {
        NODE_ENV: "production",
        PORT: process.env.PORT || 3000,
      },
    },
  ],
};
