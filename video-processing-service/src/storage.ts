import { Storage } from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";

const storage = new Storage();

const rawVideoBucketName = "vidvide-raw-videos";
const processedVideoBucketName = "vidvide-processed-videos";

const localRawVideoPath = "./videos/raw";
const localProcessedVideoPath = "./videos/processed";

export function setupDirectories() {
  ensureDirectoryExistance(localRawVideoPath);
  ensureDirectoryExistance(localProcessedVideoPath);
}

export function convertVideo(rawVideoName: string, processedVideoName: string) {
  return new Promise<void>((resolve, reject) => {
    ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
      .outputOptions("-vf", "scale=-1:360")
      .on("end", () => {
        console.log("Video processing finished successfully");
        resolve();
      })
      .on("error", (err) => {
        console.error(`An error occurred: ${err.message}`);
        reject(err);
      })
      .save(`${localProcessedVideoPath}/${processedVideoName}`);
  });
}

export async function downloadRawVideo(filename: string) {
  await storage
    .bucket(rawVideoBucketName)
    .file(filename)
    .download({ destination: `${localRawVideoPath}/${filename}` });

  console.log(
    `gs://${rawVideoBucketName}/${filename} downloaded to ${localRawVideoPath}/${filename}`
  );
}

export async function uploadProcessedVideo(filename: string) {
  const bucket = storage.bucket(processedVideoBucketName);

  await bucket.upload(`${localProcessedVideoPath}/${filename}`, {
    destination: filename,
  });

  console.log(
    `${localProcessedVideoPath}/${filename} uploaded to gs://${processedVideoBucketName}/${filename}`
  );

  await bucket.file(filename).makePublic();
}

export function deleteRawVideo(filename: string) {
  return deleteFile(`${localRawVideoPath}/${filename}`);
}

export function deleteProcessedVideo(filename: string) {
  return deleteFile(`${localProcessedVideoPath}/${filename}`);
}

function deleteFile(filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(filepath)) {
      fs.unlink(filepath, (err) => {
        if (err) {
          console.log(`Failed to delete file at ${filepath}`, err);
          reject(err);
        } else {
          console.log(`File deleted at ${filepath}`);
          resolve();
        }
      });

      reject(`File ${filepath} does not exist.`);
    } else {
      console.log(`File not found at ${filepath}, skipping the delete`);
      resolve();
    }
  });
}

function ensureDirectoryExistance(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Directory created at ${dirPath}`);
  }
}
