const http = require("http");
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const PORT = process.env.PORT || 3000;
const FOLDER = process.env.FOLDER || "./db";
if (!fs.existsSync(FOLDER)) fs.mkdirSync(FOLDER);

function hash(data) {
  const hash = crypto.createHash("sha1");
  hash.update(data);
  return hash.digest("hex").slice(0, 10);
}

const server = http.createServer((req, res) => {
  const end = (code, body) => {
    res.writeHead(code, { "Access-Control-Allow-Origin": "*" });
    res.end(body);
  };

  if (req.method === "POST") {
    let requestBody = "";

    req.on("data", (chunk) => {
      requestBody += chunk;
    });

    req.on("end", () => {
      const pathName = path.join(FOLDER, `${hash(requestBody)}.txt`);

      console.log(`POST ${pathName}`);
      fs.writeFile(pathName, requestBody, (err) => {
        if (err) return end(500);
        end(200);
      });
    });
  } else if (req.method === "GET") {
    const hash = req.url.slice(1);
    // Prevents directory traversal
    if (!hash.match(/^[0-9a-f]+$/)) return end(404);

    const pathName = path.join(FOLDER, `${hash}.txt`);
    console.log(`GET ${pathName}`);

    fs.readFile(pathName, "utf8", (err, data) => {
      if (err) return end(404);
      end(200, data);
    });
  } else end(405);
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
