const http = require("http");
const fs = require("fs");
const crypto = require("crypto");

const server = http.createServer((req, res) => {
  if (req.method === "PUT") {
    handlePutRequest(req, res);
  } else if (req.method === "GET") {
    handleGetRequest(req, res);
  } else {
    res.writeHead(405, { "Content-Type": "text/plain" });
    res.end("Method Not Allowed");
  }
});

function handlePutRequest(req, res) {
  let requestBody = "";

  req.on("data", (chunk) => {
    requestBody += chunk;
  });

  req.on("end", () => {
    const hash = crypto.createHash("sha1");
    hash.update(requestBody);

    const fileHash = hash.digest("hex");
    const fileName = `${fileHash}.txt`;

    fs.writeFile(fileName, requestBody, (err) => {
      if (err) {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Internal Server Error");
      } else {
        res.writeHead(201, { "Content-Type": "text/plain" });
        res.end("File Created: " + fileName);
      }
    });
  });
}

function handleGetRequest(req, res) {
  let requestBody = "";

  req.on("data", (chunk) => {
    requestBody += chunk;
  });

  req.on("end", () => {
    const fileName = `${requestBody}.txt`;

    fs.readFile(fileName, "utf8", (err, data) => {
      if (err) {
        res.writeHead(404, { "Content-Type": "text/plain" });
        res.end("File Not Found");
      } else {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(data);
      }
    });
  });
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
