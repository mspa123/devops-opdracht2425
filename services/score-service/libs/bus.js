// libs/bus.js

import amqp from 'amqplib';

let channel;

export async function connect() {
  const conn = await amqp.connect(process.env.AMQP_URL);
  channel    = await conn.createChannel();

  // declareer de exchanges
  await channel.assertExchange('target',   'direct', { durable: true });
  await channel.assertExchange('photo',    'direct', { durable: true });
  await channel.assertExchange('deadline', 'direct', { durable: true });

  // optioneel: vangen van kanaal-fouten
  channel.on('error', err => console.error('[bus] Channel error:', err));

  console.log('[bus] exchanges target, photo & deadline asserted');
}

export function publish(ex, key, msg) {
  try {
    const buffer = Buffer.from(JSON.stringify(msg));
    channel.publish(ex, key, buffer, { persistent: true });
    console.log(`[bus] → ${ex}.${key}`, msg);
  } catch (err) {
    console.error(`[bus] fout bij publiceren op ${ex}.${key}:`, err);
  }
}

export async function consume(queue, exchange, routingKey, handler) {
  // 1) Zorg dat de queue bestaat
  await channel.assertQueue(queue, { durable: true });
  // 2) Bind hem aan de juiste exchange+routingKey
  await channel.bindQueue(queue, exchange, routingKey);
  console.log(`[bus] queue "${queue}" bound to ${exchange}.${routingKey}`);

  // 3) Start de consumer
  channel.consume(
    queue,
    msg => {
      if (!msg) return;

      const raw = msg.content.toString();
      let payload;

      // 4) Vang JSON‐parse fouten op
      try {
        payload = JSON.parse(raw);
      } catch (err) {
        console.warn(`[bus] Ongeldige JSON op ${exchange}.${routingKey}:`, raw);
        // Ack ongeldige berichten, anders blijven ze elk herstart opnieuw komen
        channel.ack(msg);
        return;
      }

      // 5) Handler veilig aanroepen
      try {
        handler(payload);
      } catch (err) {
        console.error(`[bus] Fout in handler voor ${exchange}.${routingKey}:`, err);
      }

      // 6) Ack geslaagde berichten
      channel.ack(msg);
    },
    { noAck: false }
  );
}
