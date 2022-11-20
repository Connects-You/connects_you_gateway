import { express } from '@adarsh-mishra/node-utils/expressHelpers';

import { authHandlers } from '.';

const router = express.Router();

router.post('/authenticate', authHandlers.authenticate);
router.post('/signout', authHandlers.signout);
router.put('/fcm-token', authHandlers.updateFcmToken);
router.post('/refresh-token', authHandlers.refreshToken);
router.get('/current-login-info', authHandlers.getCurrentLoginInfo);
router.get('/my-login-history', authHandlers.getMyLoginHistory);

export { router as authRouter };
