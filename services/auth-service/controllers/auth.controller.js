// services/auth-service/controllers/auth.controller.js
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

// Optioneel: connectie met RabbitMQ consumer, als je events zoals “user.registered” wilt opvangen.
// In de basis is dit niet nodig voor login/profiel.

const JWT_SECRET = process.env.JWT_SECRET || 'jouw_super_geheime_sleutel_hier';

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Ongeldige e-mail of wachtwoord' });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Ongeldige e-mail of wachtwoord' });
    }
    const payload = { id: user._id.toString(), role: user.role };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('🚫 Login Error:', error);
    return res.status(500).json({ message: 'Authenticatie mislukt. Probeer later opnieuw.' });
  }
};

export const getProfile = async (req, res) => {
  try {
    // req.user is gevuld door Passport‐JWT (zonder password, want strategy doet select('-password'))
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: 'Gebruiker niet gevonden' });
    }
    return res.status(200).json(user);
  } catch (error) {
    console.error('🚫 Fout bij ophalen profiel:', error);
    return res.status(500).json({ message: 'Fout bij ophalen profiel' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Gebruiker niet gevonden' });
    }
    return res.status(200).json({ message: 'Profiel bijgewerkt', user: updatedUser });
  } catch (error) {
    console.error('🚫 Fout bij bijwerken profiel:', error);
    return res.status(500).json({ message: 'Fout bij bijwerken profiel' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return res.status(200).json({ users });
  } catch (error) {
    console.error('🚫 Fout bij ophalen gebruikers:', error);
    return res.status(500).json({ message: 'Fout bij ophalen gebruikers' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Ongeldig gebruikers‐ID' });
    }
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: 'Gebruiker niet gevonden' });
    }
    return res.status(200).json({ message: 'Gebruiker succesvol verwijderd' });
  } catch (error) {
    console.error('🚫 Fout bij verwijderen gebruiker:', error);
    return res.status(500).json({ message: 'Fout bij verwijderen gebruiker' });
  }
};
