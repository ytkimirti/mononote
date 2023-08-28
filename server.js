const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const PORT = process.env.PORT || 3000;
const FOLDER = process.env.FOLDER || "./db";

if (!fs.existsSync(FOLDER)) fs.mkdirSync(FOLDER);

const headers = {
  "Access-Control-Allow-Origin": "*",
};

const server = http.createServer((req, res) => {
  if (req.method === "POST") {
    handlePutRequest(req, res);
  } else if (req.method === "GET") {
    handleGetRequest(req, res);
  } else {
    res.writeHead(405, { "Content-Type": "text/plain", ...headers });
    res.end("Method Not Allowed");
  }
});

function hash(data) {
  const hash = crypto.createHash("sha1");
  hash.update(data);
  return hash.digest("hex");
}

function handlePutRequest(req, res) {
  let requestBody = "";

  req.on("data", (chunk) => {
    requestBody += chunk;
  });

  req.on("end", () => {
    const fileHash = hash(requestBody);
    const pathName = path.join(FOLDER, `${fileHash}.txt`);

    console.log(`PUT ${pathName}`);
    fs.writeFile(pathName, requestBody, (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain", ...headers });
        res.end("Internal Server Error");
      } else {
        res.writeHead(201, { "Content-Type": "text/plain", ...headers });
        res.end("File Created");
      }
    });
  });
}

function handleGetRequest(req, res) {
  const hash = req.url.slice(1);
  // Check if it is base64
  if (!hash.match(/^[0-9a-f]+$/)) {
    res.writeHead(400, { "Content-Type": "text/plain", ...headers });
    res.end("Invalid Request");
    return;
  }

  const pathName = path.join(FOLDER, `${hash}.txt`);
  console.log(`GET ${pathName}`);

  fs.readFile(pathName, "utf8", (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain", ...headers });
      res.end("File Not Found");
    } else {
      res.writeHead(200, { "Content-Type": "text/plain", ...headers });
      res.end(data);
    }
  });
}

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
