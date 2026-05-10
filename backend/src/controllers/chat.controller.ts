import { Request, Response } from "express";
import { ChatService } from "../services/chat.service";
import { AiService } from "../services/ai.service";

interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export class ChatController {
  static async createSession(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { title } = req.body;
      const session = await ChatService.createSession(userId, title);
      res.status(201).json(session);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to create session", error: error.message });
    }
  }

  static async getSessions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const sessions = await ChatService.getSessions(userId);
      res.status(200).json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: "Failed to fetch sessions", error: error.message });
    }
  }

  static async getSessionMessages(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId } = req.params;
      const messages = await ChatService.getSessionMessages(sessionId, userId);
      res.status(200).json(messages);
    } catch (error: any) {
      if (error.message === "Session not found or unauthorized") {
        res.status(404).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Failed to fetch messages", error: error.message });
    }
  }

  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { sessionId, content } = req.body;

      // Ensure session belongs to user
      const history = await ChatService.getSessionMessages(sessionId, userId);

      // Save user message
      const userMessage = await ChatService.addMessage(sessionId, "user", content);

      // Prepare context for AI
      const aiContext = history.map((msg) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));
      aiContext.push({ role: "user", content });

      // Call AI
      const aiResponseContent = await AiService.getChatCompletion(aiContext);

      // Save AI message
      const aiMessage = await ChatService.addMessage(sessionId, "assistant", aiResponseContent);

      res.status(201).json({ userMessage, aiMessage });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to send message", error: error.message });
    }
  }
}
