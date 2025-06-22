// services/register-service/controllers/register.controller.js
import User from '../models/user.model.js';
import amqp from 'amqplib';

let channel;

// 1) RabbitMQ connectie (bij service‐start éénmalig)
async function connectQueue() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    const exchangeName = 'photo-hunt-exchange';
    await channel.assertExchange(exchangeName, 'topic', { durable: true });
    console.log('✅ RabbitMQ verbonden (Register‐Service)');
  } catch (error) {
    console.error('❌ RabbitMQ verbinding mislukt (Register‐Service):', error);
  }
}
connectQueue();

export const register = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'E-mailadres is al in gebruik' });
    }

    const newUser = new User({ email, password, name, role });
    const savedUser = await newUser.save();

    // 2) Publiceer RabbitMQ‐event “user.registered”
    const eventPayload = {
      userId: savedUser._id.toString(),
      email: savedUser.email,
      name: savedUser.name,
      role: savedUser.role,
      createdAt: savedUser.createdAt.toISOString()
    };
    const exchangeName = 'photo-hunt-exchange';
    if (channel) {
      channel.publish(
        exchangeName,
        'user.registered',
        Buffer.from(JSON.stringify(eventPayload)),
        { persistent: true }
      );
      console.log('🐰 Event “user.registered” gepubliceerd:', eventPayload);
    } else {
      console.warn('⚠️ Kan RabbitMQ‐event niet publiceren: Channel ontbreekt');
    }

    return res.status(201).json({
      message: 'Registratie geslaagd. Je ontvangt een e-mail met inloginformatie.',
      user: {
        id: savedUser._id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role,
        createdAt: savedUser.createdAt
      }
    });
  } catch (error) {
    console.error('🚫 Fout bij registratie (Register‐Service):', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'E-mailadres is al in gebruik' });
    }
    return res.status(500).json({ message: 'Registratie mislukt. Probeer opnieuw.' });
  }
};
