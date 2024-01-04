import { Request, Response, Router } from 'express';

const router = Router();

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Health check passed',
    timestamp: new Date().toISOString(),
  });
});

export default router;
