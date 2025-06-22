import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('MongoDB verbinding succesvol');
        return connection;
    } catch (error) {
        console.error('MongoDB verbinding mislukt:', error);
        process.exit(1);
    }
}; 