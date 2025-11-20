const { onRequest } = require("firebase-functions/v2/https");
const next = require("next");

const nextApp = next({
  dev: process.env.NODE_ENV !== "production",
  conf: { distDir: ".next" },
});

const handle = nextApp.getRequestHandler();

exports.nextServer = onRequest(async (req, res) => {
  await nextApp.prepare();
  return handle(req, res);
});
