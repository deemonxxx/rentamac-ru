// Cloudflare Pages Function: POST /api/create-payment
// Отправляет заявку в Telegram-бот

export async function onRequestPost(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body = await request.json();
    const { plan, name, email, telegram, comment } = body;

    // Валидация
    const PLANS = {
      daily:   { label: 'Суточный — 350 ₽/сут',  amount: '350 ₽' },
      weekly:  { label: 'Недельный — 2 100 ₽/нед', amount: '2 100 ₽' },
      monthly: { label: 'Месячный — 7 350 ₽/мес',  amount: '7 350 ₽' },
    };

    if (!plan || !PLANS[plan]) {
      return new Response(JSON.stringify({ error: 'Неверный тариф' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Имя и email обязательны' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Формируем сообщение для Telegram
    const lines = [
      `🆕 *Новая заявка на аренду*`,
      ``,
      `📋 *Тариф:* ${PLANS[plan].label}`,
      `💰 *Сумма:* ${PLANS[plan].amount}`,
      `👤 *Имя:* ${escapeMd(name)}`,
      `📧 *Email:* ${escapeMd(email)}`,
    ];

    if (telegram) lines.push(`💬 *Telegram:* ${escapeMd(telegram)}`);
    if (comment)  lines.push(`📝 *Комментарий:* ${escapeMd(comment)}`);

    lines.push(``, `⏰ ${new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' })} МСК`);

    const text = lines.join('\n');

    // Отправляем в Telegram (только владельцу)
    const botToken = env.TELEGRAM_BOT_TOKEN;
    const chatId = env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set');
      return new Response(JSON.stringify({ error: 'Сервис временно недоступен' }), {
        status: 503,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Защита: отправляем только в зафиксированный чат владельца
    const OWNER_CHAT_ID = '273203546';
    if (chatId !== OWNER_CHAT_ID) {
      console.error('CHAT_ID mismatch:', chatId);
      return new Response(JSON.stringify({ error: 'Ошибка конфигурации' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const tgResp = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    if (!tgResp.ok) {
      const err = await tgResp.text();
      console.error('Telegram error:', err);
      return new Response(JSON.stringify({ error: 'Ошибка отправки' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({
      ok: true,
      message: 'Заявка отправлена! Мы свяжемся с вами в течение 15 минут.',
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: 'Ошибка сервера' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// Экранирование спецсимволов Markdown
function escapeMd(text) {
  return text.replace(/([_*\[\]()~`>#+\-=|{}.!\\])/g, '\\$1');
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
