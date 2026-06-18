import { Employee, SalaryChange } from '../models/index.js';

export async function listSalaryChanges(employeeId: number) {
  return SalaryChange.findAll({
    where: { employeeId },
    order: [['effectiveMonth', 'DESC'], ['createdAt', 'DESC']]
  });
}

export async function createSalaryChange(employeeId: number, payload: Record<string, unknown>) {
  const employee = await Employee.findByPk(employeeId);
  if (!employee) throw Object.assign(new Error('员工不存在'), { status: 404 });

  const oldSalary = Number(employee.salary);
  const newSalary = Number(payload.newSalary);
  const effectiveMonth = String(payload.effectiveMonth);
  const reason = String(payload.reason);

  if (!effectiveMonth || !reason) {
    throw Object.assign(new Error('生效月份和调整原因不能为空'), { status: 400 });
  }

  if (newSalary <= 0) {
    throw Object.assign(new Error('薪资必须大于0'), { status: 400 });
  }

  const salaryChange = await SalaryChange.create({
    employeeId,
    oldSalary,
    newSalary,
    effectiveMonth,
    reason
  } as never);

  await employee.update({ salary: newSalary });

  return salaryChange;
}
