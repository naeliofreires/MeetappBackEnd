import multer from 'multer';
import crypto from 'crypto';
import { extname, resolve } from 'path';

export default multer.diskStorage({
  destination: resolve(__dirname, '..', '..', 'tmp', 'uploads'),
  filename(req, file, callBack) {
    crypto.randomBytes(16, (err, res) => {
      if (err) {
        return callBack(err);
      }

      return callBack(null, res.toString('hex') + extname(file.originalname));
    });
  },
});
