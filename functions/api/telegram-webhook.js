// Cloudflare Pages Function: POST /api/telegram-webhook
// Обрабатывает входящие сообщения в боте
// Блокирует всех кроме владельца

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const update = await request.json();
    const message = update.message;
    if (!message) return new Response('ok');

    const chatId = message.chat.id.toString();
    const OWNER_CHAT_ID = '273203546';
    const botToken = env.TELEGRAM_BOT_TOKEN;

    // Если не владелец — блокируем
    if (chatId !== OWNER_CHAT_ID) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: '⛔ Этот бот приватный. Используйте форму на rentamac.ru для связи.',
        }),
      });
      return new Response('ok');
    }

    // Владелец — можно добавить команды позже
    return new Response('ok');

  } catch (err) {
    return new Response('ok');
  }
}
