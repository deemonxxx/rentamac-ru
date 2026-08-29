// Cloudflare Pages Function: POST /api/create-payment
// Принимает JSON с данными формы, создаёт платёж через ЮKassa API

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS headers
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
      daily:   { amount: '350.00',  description: 'Mac mini M4 — суточная аренда' },
      weekly:  { amount: '2100.00', description: 'Mac mini M4 — недельная аренда' },
      monthly: { amount: '7350.00', description: 'Mac mini M4 — месячная аренда' },
    };

    if (!plan || !PLANS[plan]) {
      return new Response(JSON.stringify({ error: 'Неверный тариф' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (!email) {
      return new Response(JSON.stringify({ error: 'Email обязателен' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // TODO: Когда ЮKassa будет подключена — раскомментировать ниже
    // const shopId = env.YOOKASSA_SHOP_ID;
    // const secretKey = env.YOOKASSA_SECRET_KEY;
    //
    // const idempotenceKey = crypto.randomUUID();
    // const yukassaResponse = await fetch('https://api.yookassa.ru/v3/payments', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Idempotence-Key': idempotenceKey,
    //     'Authorization': 'Basic ' + btoa(`${shopId}:${secretKey}`),
    //   },
    //   body: JSON.stringify({
    //     amount: { value: PLANS[plan].amount, currency: 'RUB' },
    //     confirmation: {
    //       type: 'redirect',
    //       return_url: `https://rentamac.ru/pay/success`,
    //     },
    //     capture: true,
    //     description: PLANS[plan].description,
    //     metadata: { plan, name, email, telegram, comment },
    //     receipt: {
    //       customer: { email },
    //       items: [{
    //         description: PLANS[plan].description,
    //         quantity: '1.00',
    //         amount: { value: PLANS[plan].amount, currency: 'RUB' },
    //         vat_code: 1, // НДС 22%
    //       }],
    //     },
    //   }),
    // });
    //
    // if (!yukassaResponse.ok) {
    //   const err = await yukassaResponse.text();
    //   return new Response(JSON.stringify({ error: 'Ошибка ЮKassa', details: err }), {
    //     status: 502,
    //     headers: { 'Content-Type': 'application/json', ...corsHeaders },
    //   });
    // }
    //
    // const payment = await yukassaResponse.json();
    // return new Response(JSON.stringify({
    //   confirmation_token: payment.confirmation.confirmation_token,
    //   payment_id: payment.id,
    // }), {
    //   status: 200,
    //   headers: { 'Content-Type': 'application/json', ...corsHeaders },
    // });

    // Заглушка — пока ЮKassa не подключена
    return new Response(JSON.stringify({
      status: 'pending',
      message: 'Заявка получена. Мы свяжемся с вами для оплаты.',
      plan,
      email,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Ошибка сервера' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// Обработка CORS preflight
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
