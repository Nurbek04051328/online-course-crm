import { Bot, Context } from 'grammy';
import { UserRepository } from '../repositories/user.repository.js';
import { CourseRepository } from '../repositories/course.repository.js';
import { EnrollmentRepository } from '../repositories/enrollment.repository.js';
 
export interface BotContext extends Context {
  userId?: string;
  userData?: any;
}
 
export class TelegramBot {
  private bot: Bot<BotContext>;
  private userRepository: UserRepository;
  private courseRepository: CourseRepository;
  private enrollmentRepository: EnrollmentRepository;
 
  constructor() {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set');
    }
 
    this.bot = new Bot<BotContext>(token);
    this.userRepository = new UserRepository();
    this.courseRepository = new CourseRepository();
    this.enrollmentRepository = new EnrollmentRepository();
 
    this.setupMiddleware();
    this.setupCommands();
    this.setupMessageHandlers();
    this.setupCallbackHandlers();
  }
 
  /**
   * Setup middleware
   */
  private setupMiddleware(): void {
    // Log all messages
    this.bot.on('message', async ctx => {
      console.log(`📨 Telegram @${ctx.from?.username}: ${ctx.message.text}`);
    });
 
    // Error handler
    this.bot.catch(async (err, ctx) => {
      console.error('❌ Bot error:', err);
      await ctx.reply('❌ Xatolik yuz berdi. Qayta urinib ko\'ring.');
    });
  }
 
  /**
   * Setup commands
   */
  private setupCommands(): void {
    // /start command
    this.bot.command('start', async ctx => {
      const firstName = ctx.from?.first_name || 'User';
      const username = ctx.from?.username || 'N/A';
 
      const welcomeText = `
👋 <b>Assalomu aleykum, ${firstName}!</b>
 
🎓 <b>Online Course Platform</b> ga xush kelibsiz!
 
Burada siz:
📚 Kurslar o'rganishingiz mumkin
💰 To'lovni amalga oshirish
📊 Taraqqiyotni kuzatish
⭐ Sharxlar qoldirish
 
Qo'l berish uchun /help ni bosing!
      `;
 
      await ctx.reply(welcomeText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📚 Kurslar',
                callback_data: 'courses',
              },
              {
                text: '👤 Profil',
                callback_data: 'profile',
              },
            ],
            [
              {
                text: '🔗 Saytga o\'tish',
                url: `${process.env.FRONTEND_URL || 'https://example.com'}`,
              },
            ],
          ],
        },
      });
    });
 
    // /help command
    this.bot.command('help', async ctx => {
      const helpText = `
📖 <b>Mavjud buyruqlar:</b>
 
/start - Bosh sahifa
/help - Yordam
/courses - Barcha kurslar
/my_courses - Mening kurslarim
/profile - Mening profilim
/progress - Mening taraqqiyotim
/settings - Sozlamalar
 
Qo'shimcha ma'lumot uchun support.uchebniy@example.com ga murojaat qiling.
      `;
 
      await ctx.reply(helpText, { parse_mode: 'HTML' });
    });
 
    // /courses command
    this.bot.command('courses', async ctx => {
      try {
        const courses = await this.courseRepository.getPublished(5, 0);
 
        if (courses.length === 0) {
          await ctx.reply('📭 Hozircha kurslar yo\'q');
          return;
        }
 
        let text = '<b>📚 Barcha Kurslar:</b>\n\n';
 
        const buttons = courses.map(course => [
          {
            text: `${course.title}`,
            callback_data: `course_${course.id}`,
          },
        ]);
 
        text += courses
          .map(
            (course, i) =>
              `${i + 1}. <b>${course.title}</b>\n💵 ${course.price} UZS\n`
          )
          .join('\n');
 
        await ctx.reply(text, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
      } catch (error: any) {
        console.error('❌ Courses error:', error.message);
        await ctx.reply('❌ Kurslarni yuklashda xatolik');
      }
    });
 
    // /my_courses command
    this.bot.command('my_courses', async ctx => {
      try {
        const userId = ctx.from?.id.toString();
        if (!userId) {
          await ctx.reply('❌ Avtentifikatsiya talab qilinadi');
          return;
        }
 
        // Get user from database
        const user = await this.userRepository.findById(userId);
        if (!user) {
          await ctx.reply(
            '❌ Profil topilmadi. Iltimos, saytda ro\'yxatdan o\'ting.'
          );
          return;
        }
 
        // Get enrollments
        // Note: This requires student_id, you might need to adjust
        // const enrollments = await this.enrollmentRepository.findByStudent(
        //   user.id,
        //   10,
        //   0
        // );
 
        // For now, show placeholder
        await ctx.reply('📚 <b>Mening Kurslarim</b>\n\nHozircha kurs yo\'q', {
          parse_mode: 'HTML',
        });
      } catch (error: any) {
        console.error('❌ My courses error:', error.message);
        await ctx.reply('❌ Kurslarni yuklashda xatolik');
      }
    });
 
    // /profile command
    this.bot.command('profile', async ctx => {
      try {
        const userId = ctx.from?.id.toString();
        if (!userId) {
          await ctx.reply('❌ Avtentifikatsiya talab qilinadi');
          return;
        }
 
        const user = await this.userRepository.findById(userId);
        if (!user) {
          await ctx.reply('❌ Profil topilmadi');
          return;
        }
 
        const profileText = `
👤 <b>Mening Profilim</b>
 
📧 <b>Email:</b> ${user.email}
👤 <b>Ism:</b> ${user.first_name} ${user.last_name}
🏷️ <b>Username:</b> @${user.username}
📋 <b>Rol:</b> ${user.user_type}
        `;
 
        await ctx.reply(profileText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🔧 O\'zgartirish',
                  callback_data: 'edit_profile',
                },
              ],
            ],
          },
        });
      } catch (error: any) {
        console.error('❌ Profile error:', error.message);
        await ctx.reply('❌ Profilni yuklashda xatolik');
      }
    });
 
    // /progress command
    this.bot.command('progress', async ctx => {
      const progressText = `
📊 <b>Mening Taraqqiyotim</b>
 
Kurslarning taraqqiyotini ko'rish uchun saytga o'ting:
🔗 ${process.env.FRONTEND_URL || 'https://example.com'}/dashboard
      `;
 
      await ctx.reply(progressText, {
        parse_mode: 'HTML',
      });
    });
 
    // /settings command
    this.bot.command('settings', async ctx => {
      const settingsText = `
⚙️ <b>Sozlamalar</b>
 
Qo'l berish uchun tugmalarni bosing:
      `;
 
      await ctx.reply(settingsText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🔔 Bildirishnomalar',
                callback_data: 'notifications',
              },
            ],
            [
              {
                text: '🌐 Til',
                callback_data: 'language',
              },
            ],
            [
              {
                text: '🚪 Chiqish',
                callback_data: 'logout',
              },
            ],
          ],
        },
      });
    });
  }
 
  /**
   * Setup message handlers
   */
  private setupMessageHandlers(): void {
    // Handle text messages
    this.bot.on('message:text', async ctx => {
      const text = ctx.message.text;
 
      if (text.toLowerCase().includes('help')) {
        await ctx.reply(
          '📖 Yordam uchun /help buyrug\'ini ishlatish. \n\n' +
            'Qo\'shimcha sozlamalar /settings da.'
        );
      } else if (text.toLowerCase().includes('hello')) {
        await ctx.reply(
          `👋 Salom, ${ctx.from?.first_name}! Qanday yordam bera olaman?`
        );
      } else {
        await ctx.reply(
          '❓ Bunga javob bera olmaman. /help buyrug\'ini bosing.',
          {
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '📚 Kurslar',
                    callback_data: 'courses',
                  },
                  {
                    text: '👤 Profil',
                    callback_data: 'profile',
                  },
                ],
              ],
            },
          }
        );
      }
    });
  }
 
  /**
   * Setup callback handlers
   */
  private setupCallbackHandlers(): void {
    // Courses callback
    this.bot.callbackQuery('courses', async ctx => {
      await ctx.answerCallbackQuery('📚 Kurslar yuklanyapti...');
      await ctx.deleteMessage();
 
      try {
        const courses = await this.courseRepository.getPublished(5, 0);
 
        if (courses.length === 0) {
          await ctx.reply('📭 Hozircha kurslar yo\'q');
          return;
        }
 
        let text = '<b>📚 Barcha Kurslar:</b>\n\n';
 
        const buttons = courses.map(course => [
          {
            text: `${course.title}`,
            callback_data: `course_${course.id}`,
          },
        ]);
 
        text += courses
          .map(
            (course, i) =>
              `${i + 1}. <b>${course.title}</b>\n💵 ${course.price} UZS\n`
          )
          .join('\n');
 
        await ctx.reply(text, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: buttons,
          },
        });
      } catch (error: any) {
        console.error('❌ Courses callback error:', error.message);
        await ctx.reply('❌ Xatolik yuz berdi');
      }
    });
 
    // Profile callback
    this.bot.callbackQuery('profile', async ctx => {
      await ctx.answerCallbackQuery('👤 Profil yuklanyapti...');
      await ctx.deleteMessage();
 
      try {
        const userId = ctx.from?.id.toString();
        if (!userId) {
          await ctx.reply('❌ Avtentifikatsiya talab qilinadi');
          return;
        }
 
        const user = await this.userRepository.findById(userId);
        if (!user) {
          await ctx.reply('❌ Profil topilmadi');
          return;
        }
 
        const profileText = `
👤 <b>Mening Profilim</b>
 
📧 <b>Email:</b> ${user.email}
👤 <b>Ism:</b> ${user.first_name} ${user.last_name}
🏷️ <b>Username:</b> @${user.username}
📋 <b>Rol:</b> ${user.user_type}
        `;
 
        await ctx.reply(profileText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '⬅️ Orqaga',
                  callback_data: 'start',
                },
              ],
            ],
          },
        });
      } catch (error: any) {
        console.error('❌ Profile callback error:', error.message);
        await ctx.reply('❌ Xatolik yuz berdi');
      }
    });
 
    // Edit profile callback
    this.bot.callbackQuery('edit_profile', async ctx => {
      await ctx.answerCallbackQuery('🔧 Saytga o\'ting');
      await ctx.reply(`🔗 <a href="${process.env.FRONTEND_URL || 'https://example.com'}/profile">Profilni tahrirlash</a>`, {
        parse_mode: 'HTML',
      });
    });
 
    // Notifications callback
    this.bot.callbackQuery('notifications', async ctx => {
      await ctx.answerCallbackQuery('🔔 Bildirishnomalar');
      await ctx.reply(
        '🔔 <b>Bildirishnomalar</b>\n\n' +
          'Hozircha barcha bildirishnomalar yoqilgan. ' +
          'Saytda o\'zgartiringiz.'
      );
    });
 
    // Language callback
    this.bot.callbackQuery('language', async ctx => {
      await ctx.answerCallbackQuery('🌐 Til');
      await ctx.reply('🌐 <b>Til</b>\n\nHozircha faqat O\'zbek tili mavjud.', {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🇺🇿 O\'zbek',
                callback_data: 'lang_uz',
              },
              {
                text: '🇷🇺 Русский',
                callback_data: 'lang_ru',
              },
            ],
          ],
        },
      });
    });
 
    // Logout callback
    this.bot.callbackQuery('logout', async ctx => {
      await ctx.answerCallbackQuery('👋 Chiqilmoqda...');
      await ctx.reply(
        '👋 Siz tizimdan chiqdiingiz.\n\n' +
          'Qayta kirish uchun: /start'
      );
    });
 
    // Back to start
    this.bot.callbackQuery('start', async ctx => {
      await ctx.answerCallbackQuery('🏠 Bosh sahifa');
      await ctx.deleteMessage();
 
      const firstName = ctx.from?.first_name || 'User';
      const welcomeText = `
👋 <b>Assalomu aleykum, ${firstName}!</b>
 
🎓 <b>Online Course Platform</b>
 
Qo'l berish uchun tugmalarni bosing:
      `;
 
      await ctx.reply(welcomeText, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '📚 Kurslar',
                callback_data: 'courses',
              },
              {
                text: '👤 Profil',
                callback_data: 'profile',
              },
            ],
            [
              {
                text: '⚙️ Sozlamalar',
                callback_data: 'settings',
              },
            ],
          ],
        },
      });
    });
 
    // Course details
    this.bot.callbackQuery(/^course_/, async ctx => {
      const courseId = ctx.match[0].replace('course_', '');
      await ctx.answerCallbackQuery('📚 Kurs yuklanyapti...');
 
      try {
        const course = await this.courseRepository.findById(courseId);
        if (!course) {
          await ctx.reply('❌ Kurs topilmadi');
          return;
        }
 
        const courseText = `
📚 <b>${course.title}</b>
 
📝 <b>Tavsif:</b>
${course.description || 'Tavsif yo\'q'}
 
💰 <b>Narxi:</b> ${course.price} UZS
⭐ <b>Reyting:</b> ${course.rating || 'Hali baholangan yo\'q'}
 
👨‍🏫 <b>O\'qituvchi:</b> ${course.teacher_id}
        `;
 
        await ctx.editMessageText(courseText, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '💳 Yozilish',
                  url: `${process.env.FRONTEND_URL || 'https://example.com'}/course/${courseId}`,
                },
              ],
              [
                {
                  text: '⬅️ Orqaga',
                  callback_data: 'courses',
                },
              ],
            ],
          },
        });
      } catch (error: any) {
        console.error('❌ Course details error:', error.message);
        await ctx.reply('❌ Xatolik yuz berdi');
      }
    });
  }
 
  /**
   * Send notification
   */
  async sendNotification(chatId: number, message: string): Promise<void> {
    try {
      await this.bot.api.sendMessage(chatId, message, {
        parse_mode: 'HTML',
      });
    } catch (error: any) {
      console.error('❌ Send notification error:', error.message);
    }
  }
 
  /**
   * Start bot
   */
  async start(): Promise<void> {
    try {
      console.log('🤖 Telegram bot ishga tushilmoqda...');
      
      // Set commands
      await this.bot.api.setMyCommands([
        { command: 'start', description: 'Bosh sahifa' },
        { command: 'help', description: 'Yordam' },
        { command: 'courses', description: 'Barcha kurslar' },
        { command: 'my_courses', description: 'Mening kurslarim' },
        { command: 'profile', description: 'Mening profilim' },
        { command: 'progress', description: 'Taraqqiyot' },
        { command: 'settings', description: 'Sozlamalar' },
      ]);
 
      // Start polling
      await this.bot.start({
        onStart: api => console.log('✅ Telegram bot started!'),
        allowed_updates: ['message', 'callback_query'],
      });
    } catch (error: any) {
      console.error('❌ Bot start error:', error.message);
      throw error;
    }
  }
 
  /**
   * Stop bot
   */
  async stop(): Promise<void> {
    try {
      await this.bot.stop();
      console.log('🛑 Telegram bot stopped');
    } catch (error: any) {
      console.error('❌ Bot stop error:', error.message);
    }
  }
 
  /**
   * Get bot instance
   */
  getBot(): Bot<BotContext> {
    return this.bot;
  }
}
 
export const telegramBotInstance = new TelegramBot();
export default TelegramBot;