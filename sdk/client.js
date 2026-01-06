const http = require("http");
const XRAY = process.env.XRAY_ENDPOINT || "http://localhost:3000/ingest";

function sendEvent(type, payload) {
  try {
    const data = JSON.stringify({ type, payload });

    const req = http.request(
      XRAY,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(data),
        },
        timeout: 200,
      },
      () => {}
    );

    req.on("error", () => {});
    req.on("timeout", () => req.destroy());

    req.write(data);
    req.end();
  } catch (_) {
    // swallow all errors
  }
}

module.exports = { sendEvent };
