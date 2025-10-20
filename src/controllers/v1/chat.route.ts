import { Router } from "express";
import { ChatAssistantService } from "../../services/chatAssistant.service";

const chatRouter = Router();

chatRouter.post("/", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== "string")
      return res.status(400).json({ error: "Missing query parameter" });

    const response = await ChatAssistantService.processQuery(query);
    res.json(response);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default chatRouter;
