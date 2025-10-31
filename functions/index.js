
const { onRequest } = require("firebase-functions/v2/https");
const next = require("next");

const nextjsServer = next({
  dev: false,
  conf: require("./.next/required-server-files.json"),
});

const handle = nextjsServer.getRequestHandler();

exports.nextServer = onRequest(async (req, res) => {
  await nextjsServer.prepare();
  return handle(req, res);
});
