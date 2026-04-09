import express, { type Request, type Response } from "express";
import cors from "cors";
import puppeteer, { ElementHandle } from "puppeteer";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000;

async function playYouTube(query: string): Promise<void> {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
  });

  const page = await browser.newPage();

  await page.goto(
    `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  );

  await page.waitForSelector("ytd-video-renderer");

  const firstVideo = await page.$("ytd-video-renderer a#video-title");

  if (firstVideo) {
    await firstVideo.click();
  }
}

app.post("/command", async (req: Request, res: Response) => {
  const { text }: { text: string } = req.body;

  if (text.toLowerCase().includes("play")) {
    const query = text.replace(/play/i, "").trim();

    await playYouTube(query);

    return res.json({ message: `Playing ${query}` });
  }

  res.json({ message: "Command not recognized" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
