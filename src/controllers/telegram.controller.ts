import { Request, Response } from 'express';
import { TelegramService } from '../services/telegram.service.js';

export class TelegramController {
  private telegramService: TelegramService;

  constructor() {
    this.telegramService = new TelegramService();
  }

  /**
   * POST /api/telegram/webhook
   * Handle Telegram webhook
   */
  async handleWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { message, callback_query } = req.body;

      if (message) {
        const { chat, text, from } = message;

        console.log(`📨 Telegram message from ${from.first_name}: ${text}`);

        // Handle different commands
        if (text === '/start') {
          await this.telegramService.sendMessage(
            chat.id,
            `👋 Welcome to Online Course Platform!\n\nUse /help for commands.`
          );
        } else if (text === '/help') {
          await this.telegramService.sendMessage(
            chat.id,
            `📚 Available commands:\n/start - Welcome\n/help - Show help\n/courses - View courses\n/profile - Your profile`
          );
        }
      }

      if (callback_query) {
        const { id, data } = callback_query;

        console.log(`🔘 Callback query: ${data}`);

        await this.telegramService.answerCallbackQuery(id, 'Processing...');
      }

      res.status(200).json({ ok: true });
    } catch (error: any) {
      console.error('❌ Telegram webhook error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * POST /api/telegram/send-message
   * Send message to user
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { chatId, text } = req.body;

      if (!chatId || !text) {
        res.status(400).json({ error: 'Missing chatId or text' });
        return;
      }

      await this.telegramService.sendMessage(chatId, text);

      res.status(200).json({ success: true, message: 'Message sent' });
    } catch (error: any) {
      console.error('❌ Send message error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * GET /api/telegram/webhook-info
   * Get webhook status
   */
  async getWebhookInfo(req: Request, res: Response): Promise<void> {
    try {
      const info = await this.telegramService.getWebhookInfo();

      res.status(200).json({ success: true, data: info.result });
    } catch (error: any) {
      console.error('❌ Get webhook info error:', error.message);
      res.status(400).json({ error: error.message });
    }
  }
}

export const telegramControllerInstance = new TelegramController();
export default TelegramController;