import { express } from '@adarsh-mishra/node-utils/expressHelpers';

import { authHandlers } from '.';

const router = express.Router();

router.post('/authenticate', authHandlers.authenticate);
router.post('/signout', authHandlers.signout);
router.post('/update-fcm-token', authHandlers.updateFcmToken);
router.post('/refresh-token', authHandlers.refreshToken);
router.post('/set-user-online-status', authHandlers.setUserOnlineStatus);
router.get('/get-my-details', authHandlers.getMyDetails);
router.get('/get-current-login-info', authHandlers.getCurrentLoginInfo);
router.get('/get-user-login-history', authHandlers.getUserLoginHistory);

export { router as authRouter };
