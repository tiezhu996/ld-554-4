import type { NextFunction, Request, Response } from 'express';
import * as salaryChangeService from '../services/salary-change.service.js';
import { success, created } from '../utils/response.js';

export async function index(req: Request, res: Response, next: NextFunction) {
  try {
    success(res, await salaryChangeService.listSalaryChanges(Number(req.params.employeeId)));
  } catch (error) {
    next(error);
  }
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    created(res, await salaryChangeService.createSalaryChange(Number(req.params.employeeId), req.body));
  } catch (error) {
    next(error);
  }
}
