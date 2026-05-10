import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const result = await AuthService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === "Email already in use") {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Registration failed", error: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "Invalid credentials") {
        res.status(401).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "Login failed", error: error.message });
    }
  }
}
