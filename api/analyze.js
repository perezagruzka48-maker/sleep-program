export default async function handler(req, res) {
  // Разрешаем запросы только с вашего домена
  res.setHeader('Access-Control-Allow-Origin', 'https://perezagruzka48-maker.github.io');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Браузер сначала делает OPTIONS запрос — отвечаем ок
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Метод не разрешён' });
  }

  try {
    const { prompt, maxTokens } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Промпт не передан' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens || 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Ошибка API' });
    }

    const text = data.content?.[0]?.text || '';
    return res.status(200).json({ text });

  } catch (error) {
    return res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
}
