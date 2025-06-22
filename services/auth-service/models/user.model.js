import mongoose from 'mongoose';
import * as argon2 from 'argon2';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['participant', 'targetOwner', 'admin'],
      default: 'participant',
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Hash het wachtwoord voor het opslaan met Argon2
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    console.log('\n🔒 REGISTRATIE WACHTWOORD HASHEN');
    console.log('📝 Origineel wachtwoord:', this.password);

    // Argon2 configuratie
    const hashingConfig = {
      type: argon2.argon2id,      // Aanbevolen variant
      memoryCost: 2 ** 16,        // 64MB geheugen gebruik
      timeCost: 3,                // Aantal iteraties
      parallelism: 1,             // Aantal parallelle threads
      hashLength: 32              // Output hash lengte
    };

    const hashedPassword = await argon2.hash(this.password, hashingConfig);
    console.log('🔐 Finale hash:', hashedPassword);

    // Extra verificatie stap
    const verifyHash = await argon2.verify(hashedPassword, this.password);
    console.log('✅ Directe verificatie test:', verifyHash);

    this.password = hashedPassword;
    next();
  } catch (error) {
    console.error('❌ Error tijdens hashen:', error);
    next(error);
  }
});

// Methode om wachtwoord te vergelijken met Argon2
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log('\n🔍 WACHTWOORD VERIFICATIE');
    console.log('📝 Ingevoerd wachtwoord:', candidatePassword);
    console.log('🔐 Database hash:', this.password);

    const isMatch = await argon2.verify(this.password, candidatePassword);
    console.log('✅ Match resultaat:', isMatch);

    return isMatch;
  } catch (error) {
    console.error('🚫 Vergelijkingsfout:', error);
    throw new Error('Wachtwoord vergelijking mislukt');
  }
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
