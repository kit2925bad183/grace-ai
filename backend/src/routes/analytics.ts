import { Router } from 'express';
import { authenticate, authorize } from '../middleware/authMiddleware';
import { UserRole } from '../models/enums';
import { getCitizenOverview } from '../controllers/grievanceController';
import {
  authorityOverview,
  slaMonitoring,
  analyticsOverview,
  analyticsTrends,
  analyticsDepartments,
  analyticsCategories,
  analyticsSla,
  analyticsHotspots,
  analyticsForecast,
  analyticsRootCauses,
  analyticsPolicyImpact,
} from '../controllers/analyticsController';

const router = Router();
const authorityRoles = [UserRole.AUTHORITY, UserRole.ADMIN];

router.get(
  '/citizen-overview',
  authenticate,
  authorize(UserRole.CITIZEN),
  getCitizenOverview
);

router.get(
  '/authority-overview',
  authenticate,
  authorize(...authorityRoles),
  authorityOverview
);

router.get(
  '/sla-monitoring',
  authenticate,
  authorize(...authorityRoles),
  slaMonitoring
);

router.get('/overview', authenticate, authorize(...authorityRoles), analyticsOverview);
router.get('/trends', authenticate, authorize(...authorityRoles), analyticsTrends);
router.get('/departments', authenticate, authorize(...authorityRoles), analyticsDepartments);
router.get('/categories', authenticate, authorize(...authorityRoles), analyticsCategories);
router.get('/sla', authenticate, authorize(...authorityRoles), analyticsSla);
router.get('/hotspots', authenticate, authorize(...authorityRoles), analyticsHotspots);
router.get('/forecast', authenticate, authorize(...authorityRoles), analyticsForecast);
router.get('/root-causes', authenticate, authorize(...authorityRoles), analyticsRootCauses);
router.get('/policy-impact', authenticate, authorize(...authorityRoles), analyticsPolicyImpact);

export default router;
