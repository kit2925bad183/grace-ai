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

  publicGovernanceStats,

} from '../controllers/analyticsController';



const router = Router();

const manageRoles = [UserRole.DEPARTMENT, UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN];



router.get('/public-stats', publicGovernanceStats);



router.get(

  '/user-overview',

  authenticate,

  authorize(UserRole.CITIZEN),

  getCitizenOverview

);



/** @deprecated use /user-overview */

router.get(

  '/citizen-overview',

  authenticate,

  authorize(UserRole.CITIZEN),

  getCitizenOverview

);



router.get(

  '/department-overview',

  authenticate,

  authorize(UserRole.DEPARTMENT),

  authorityOverview

);



/** @deprecated use /department-overview or /head-overview */

router.get(

  '/authority-overview',

  authenticate,

  authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN),

  authorityOverview

);



router.get(

  '/head-overview',

  authenticate,

  authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN),

  authorityOverview

);



router.get(

  '/department',

  authenticate,

  authorize(UserRole.DEPARTMENT),

  analyticsOverview

);



router.get('/sla-monitoring', authenticate, authorize(...manageRoles), slaMonitoring);

router.get('/overview', authenticate, authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN), analyticsOverview);

router.get('/trends', authenticate, authorize(...manageRoles), analyticsTrends);

router.get('/departments', authenticate, authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN), analyticsDepartments);

router.get('/categories', authenticate, authorize(...manageRoles), analyticsCategories);

router.get('/sla', authenticate, authorize(...manageRoles), analyticsSla);

router.get('/hotspots', authenticate, authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN), analyticsHotspots);

router.get('/forecast', authenticate, authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN), analyticsForecast);

router.get('/root-causes', authenticate, authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN), analyticsRootCauses);

router.get('/policy-impact', authenticate, authorize(UserRole.HEAD_OF_DEPARTMENTS, UserRole.ADMIN), analyticsPolicyImpact);



export default router;

