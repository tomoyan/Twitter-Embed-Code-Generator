import express from "express";
import { createServer as createViteServer } from "vite";
import fetch from "node-fetch";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route to proxy Twitter oEmbed requests to avoid CORS issues
  app.get("/api/embed", async (req, res) => {
    const tweetUrl = req.query.url as string;
    if (!tweetUrl) {
      return res.status(400).json({ error: "URL is required" });
    }

    try {
      const twitterOembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}`;
      const response = await fetch(twitterOembedUrl);
      
      if (!response.ok) {
        return res.status(response.status).json({ error: "Failed to fetch embed code from Twitter" });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Error fetching embed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
