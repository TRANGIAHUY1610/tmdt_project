module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/src/__tests__"],
  collectCoverageFrom: [
    "src/modules/**/*.js",
    "src/middlewares/**/*.js",
    "src/routes/**/*.js",
    "!src/**/*.d.ts",
  ],
};
