import express from "express";
import ffmpeg from "fluent-ffmpeg";
import {
  convertVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setupDirectories,
  uploadProcessedVideo,
} from "./storage";

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
  let data;

  try {
    const message = Buffer.from(req.body.message.data, "base64").toString(
      "utf8"
    );

    data = JSON.parse(message);

    if (!data.name) {
      throw new Error("Invalid message payload recieved.");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send("Bad Request: missing filename.");
  }

  const inputFileName = data.name;
  const outputFileName = `processed-${inputFileName}`;

  await downloadRawVideo(inputFileName);

  try {
    await convertVideo(inputFileName, outputFileName);
  } catch (err) {
    console.log(err);
    await Promise.all([
      deleteRawVideo(inputFileName),
      deleteProcessedVideo(outputFileName),
    ]);

    return res
      .status(500)
      .send("Internal Server Error: video processing failed.");
  }

  await uploadProcessedVideo(outputFileName);

  await Promise.all([
    deleteRawVideo(inputFileName),
    deleteProcessedVideo(outputFileName),
  ]);

  return res.send(200).send(`Video processing finished successfully`);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(
    `Video processing service is listening at http://localhost:${port}`
  );

  ffmpeg.getAvailableFormats((err, formats) => {
    if (err) {
      console.error("FFmpeg error:", err.message);
    } else {
      console.log("FFmpeg is available and working");
    }
  });
});
