import axios from 'axios';

export class TelegramService {
  private botToken: string;
  private apiUrl: string;

  constructor() {
    this.botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Send message to user
   */
  async sendMessage(chatId: string, text: string): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
      });
      return response.data;
    } catch (error) {
      console.error('❌ Telegram send message error:', error);
      throw error;
    }
  }

  /**
   * Send inline keyboard
   */
  async sendKeyboard(
    chatId: string,
    text: string,
    buttons: Array<{ text: string; url: string }>
  ): Promise<any> {
    try {
      const inlineKeyboard = buttons.map(btn => [
        {
          text: btn.text,
          url: btn.url,
        },
      ]);

      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatId,
        text,
        reply_markup: {
          inline_keyboard: inlineKeyboard,
        },
      });
      return response.data;
    } catch (error) {
      console.error('❌ Telegram send keyboard error:', error);
      throw error;
    }
  }

  /**
   * Set webhook
   */
  async setWebhook(url: string): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/setWebhook`, {
        url,
        allowed_updates: ['message', 'callback_query'],
      });
      return response.data;
    } catch (error) {
      console.error('❌ Telegram set webhook error:', error);
      throw error;
    }
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo(): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/getWebhookInfo`);
      return response.data;
    } catch (error) {
      console.error('❌ Telegram get webhook error:', error);
      throw error;
    }
  }

  /**
   * Answer callback query
   */
  async answerCallbackQuery(callbackQueryId: string, text: string): Promise<any> {
    try {
      const response = await axios.post(`${this.apiUrl}/answerCallbackQuery`, {
        callback_query_id: callbackQueryId,
        text,
      });
      return response.data;
    } catch (error) {
      console.error('❌ Telegram answer callback error:', error);
      throw error;
    }
  }

  /**
   * Send notification for enrollment
   */
  async notifyEnrollment(chatId: string, studentName: string, courseName: string): Promise<void> {
    const text = `
🎉 <b>Enrollment Successful!</b>

Student: <b>${studentName}</b>
Course: <b>${courseName}</b>

You can now access all course materials!
    `;
    await this.sendMessage(chatId, text);
  }

  /**
   * Send notification for payment
   */
  async notifyPayment(chatId: string, courseName: string, amount: number): Promise<void> {
    const text = `
✅ <b>Payment Received!</b>

Course: <b>${courseName}</b>
Amount: <b>${amount} UZS</b>

Thank you for your purchase!
    `;
    await this.sendMessage(chatId, text);
  }

  /**
   * Send course progress notification
   */
  async notifyProgress(chatId: string, courseName: string, percentage: number): Promise<void> {
    const text = `
📊 <b>Course Progress</b>

Course: <b>${courseName}</b>
Completion: <b>${percentage}%</b>

Keep learning! 💪
    `;
    await this.sendMessage(chatId, text);
  }
}

export const telegramServiceInstance = new TelegramService();
export default TelegramService;