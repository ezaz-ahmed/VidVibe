import express from "express";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("It's working...");
});

app.listen(port, () => {
  console.log(
    `Video processing service is listening at http://localhost:${port}`
  );
});
