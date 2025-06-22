import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Mock ESM modules vóór import van de te testen module
jest.unstable_mockModule('axios', () => ({
  default: { get: jest.fn() }
}));
jest.unstable_mockModule('../../../libs/bus.js', () => ({
  publish: jest.fn()
}));
jest.unstable_mockModule('../utils/imageAnalysis.js', () => ({
  imageAnalysis: jest.fn()
}));

const scoreController = await import('../controllers/score.controller.js');
const Submission = (await import('../models/submission.model.js')).default;

// Helper om een mock response object te maken
function createRes() {
  return {
    json: jest.fn(),
    status: jest.fn().mockReturnThis()
  };
}

describe('Score Controller Tests', () => {
  let mockUser;
  let mockTarget;

  beforeEach(() => {
    mockUser = {
      _id: new mongoose.Types.ObjectId(),
      email: 'test@example.com',
      role: 'participant'
    };
    mockTarget = {
      _id: new mongoose.Types.ObjectId(),
      active: true,
      deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
      imageUrlFull: 'https://example.com/target-image.jpg'
    };
    jest.clearAllMocks();
  });

  describe('getMyScore', () => {
    it('geeft de score terug als submission bestaat', async () => {
      const targetId = new mongoose.Types.ObjectId();
      const playerId = mockUser._id;
      const submission = new Submission({
        targetId,
        playerId,
        imageUrl: '/uploads/test-image.jpg',
        score: 85
      });
      await submission.save();

      const req = {
        params: { targetId: targetId.toString() },
        user: mockUser
      };
      const res = createRes();

      await scoreController.getMyScore(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          targetId: targetId,
          playerId: playerId,
          imageUrl: '/uploads/test-image.jpg',
          score: 85
        })
      );
    });

    it('geeft 404 als er geen submission is', async () => {
      const targetId = new mongoose.Types.ObjectId();
      const req = {
        params: { targetId: targetId.toString() },
        user: mockUser
      };
      const res = createRes();
      await scoreController.getMyScore(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Geen score gevonden' });
    });
  });

  describe('submitPhoto', () => {
    it('slaat een foto op als alles klopt', async () => {
      const targetId = new mongoose.Types.ObjectId();
      const playerId = mockUser._id;
      // Mock axios response voor target
      const axios = (await import('axios')).default;
      axios.get.mockResolvedValue({ data: mockTarget });
      // Mock imageAnalysis
      const { imageAnalysis } = await import('../utils/imageAnalysis.js');
      imageAnalysis.mockResolvedValue(90);
      // Mock file upload
      const mockFile = { filename: 'test-photo.jpg' };
      const req = {
        params: { targetId: targetId.toString() },
        user: mockUser,
        file: mockFile
      };
      const res = createRes();
      await scoreController.submitPhoto(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          targetId: targetId,
          playerId: playerId,
          imageUrl: '/uploads/test-photo.jpg',
          score: 90
        })
      );
      const savedSubmission = await Submission.findOne({ targetId, playerId });
      expect(savedSubmission).toBeTruthy();
      expect(savedSubmission.score).toBe(90);
    });

    it('geeft 400 als er geen bestand is', async () => {
      const targetId = new mongoose.Types.ObjectId();
      const req = {
        params: { targetId: targetId.toString() },
        user: mockUser,
        file: null
      };
      const res = createRes();
      await scoreController.submitPhoto(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Geen afbeelding geüpload' });
    });

    it('geeft 400 als target niet actief is', async () => {
      const targetId = new mongoose.Types.ObjectId();
      const axios = (await import('axios')).default;
      axios.get.mockResolvedValue({ data: { ...mockTarget, active: false } });
      const mockFile = { filename: 'test-photo.jpg' };
      const req = {
        params: { targetId: targetId.toString() },
        user: mockUser,
        file: mockFile
      };
      const res = createRes();
      await scoreController.submitPhoto(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Target is niet actief' });
    });

    it('geeft 403 als deadline verstreken is', async () => {
      const targetId = new mongoose.Types.ObjectId();
      const axios = (await import('axios')).default;
      axios.get.mockResolvedValue({ data: { ...mockTarget, deadline: new Date(Date.now() - 24 * 60 * 60 * 1000) } });
      const mockFile = { filename: 'test-photo.jpg' };
      const req = {
        params: { targetId: targetId.toString() },
        user: mockUser,
        file: mockFile
      };
      const res = createRes();
      await scoreController.submitPhoto(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deadline is bereikt' });
    });

    it('geeft 404 als target niet gevonden wordt', async () => {
      const targetId = new mongoose.Types.ObjectId();
      const axios = (await import('axios')).default;
      axios.get.mockRejectedValue(new Error('Target not found'));
      const mockFile = { filename: 'test-photo.jpg' };
      const req = {
        params: { targetId: targetId.toString() },
        user: mockUser,
        file: mockFile
      };
      const res = createRes();
      await scoreController.submitPhoto(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Target niet gevonden' });
    });
  });
}); 