import { Router } from 'express';
import * as controller from '../controllers/salary-change.controller.js';
import { UserRole } from '../constants/enums.js';
import { auditMiddleware } from '../middlewares/audit.middleware.js';
import { requireRoles } from '../middlewares/rbac.middleware.js';
import { requireFields } from '../middlewares/validator.middleware.js';

export const salaryChangeRoutes = Router({ mergeParams: true });

salaryChangeRoutes.get('/', controller.index);
salaryChangeRoutes.post('/', requireRoles([UserRole.OWNER, UserRole.MANAGER]), requireFields(['newSalary', 'effectiveMonth', 'reason']), auditMiddleware('CREATE_SALARY_CHANGE', 'salary_changes'), controller.create);
