import { Router, Response } from 'express';
import { upload } from '../middleware/upload';
import { uploadMedia } from '../services/mediaService';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post(
  '/upload',
  authenticateToken,
  upload.single('file'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded.' });
        return;
      }

      const folder = (req.query.folder as string) || 'products';
      const result = await uploadMedia(req.file, folder);

      res.json({
        success: true,
        url: result.url,
        public_id: result.public_id,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

export default router;
