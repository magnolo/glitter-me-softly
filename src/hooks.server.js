export function handle({ event, resolve }) {
  const ua = event.request.headers.get('user-agent') || '';

  const searchBots = [
    'Googlebot',
    'Bingbot',
    'Slurp',        // Yahoo
    'DuckDuckBot',
    'Baiduspider',
    'YandexBot'
  ];

  if (searchBots.some(bot => ua.includes(bot))) {
    return new Response('Forbidden', { status: 403 });
  }

  return resolve(event);
}