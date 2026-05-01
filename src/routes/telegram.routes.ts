// src/routes/telegram.routes.ts

import { Router } from 'express';
import { TelegramController } from '../controllers/telegram.controller.js';

const router = Router();
const telegramController = new TelegramController();

/**
 * POST /api/telegram/webhook
 * Telegram webhook endpoint
 */
router.post('/webhook', (req, res) => telegramController.handleWebhook(req, res));

/**
 * POST /api/telegram/send-message
 * Send message to user
 */
router.post('/send-message', (req, res) => telegramController.sendMessage(req, res));

/**
 * GET /api/telegram/webhook-info
 * Get webhook info
 */
router.get('/webhook-info', (req, res) => telegramController.getWebhookInfo(req, res));

export default router;