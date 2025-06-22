import amqp from 'amqplib';

let channel;
export async function connect() {
  const conn = await amqp.connect(process.env.AMQP_URL);
  channel    = await conn.createChannel();

    // 3. declareer de exchanges die je gaat gebruiken
    await channel.assertExchange('target', 'direct', { durable: true });
    await channel.assertExchange('photo',  'direct', { durable: true });
  
    console.log('[bus] exchanges target & photo asserted');
}
export function publish(ex, key, msg) {
  console.log(`[bus] → ${ex}.${key}`, msg);
  channel.publish(ex, key, Buffer.from(JSON.stringify(msg)),
                  { contentType:'application/json' });
}
export function consume(queue, handler) {
  channel.assertQueue(queue);
  channel.consume(queue, m => { handler(JSON.parse(m.content)); channel.ack(m); });
}
