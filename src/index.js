/*
curl \
  -X GET \
  -i \
  -H 'content-type: application/json' \
  localhost:3001
*/

import express from "express";
import rateLimit from "./rate-limit.js";

const app = express();
const PORT = 3001;

function getRandomArbitrary(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

app.use("/", rateLimit({
  time: 10, 
  limit: 3,
  getIdHandler: (req) => "Teste"//getRandomArbitrary(1, 2)
}));

app.get("/", async (req, res) => {
  console.log(req.rateLimitData);
  res.status(200).send("OK");
});

app.listen(PORT, () => console.log(`Listen on ${PORT}`));