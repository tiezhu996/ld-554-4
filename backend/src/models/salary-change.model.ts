import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from 'sequelize';
import { sequelize } from '../config/database.js';
import { Employee } from './employee.model.js';

export class SalaryChange extends Model<InferAttributes<SalaryChange>, InferCreationAttributes<SalaryChange>> {
  declare id: CreationOptional<number>;
  declare employeeId: number;
  declare oldSalary: number;
  declare newSalary: number;
  declare effectiveMonth: string;
  declare reason: string;
  declare createdAt: CreationOptional<string>;
}

SalaryChange.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    employeeId: { type: DataTypes.INTEGER, allowNull: false, references: { model: Employee, key: 'id' } },
    oldSalary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    newSalary: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    effectiveMonth: { type: DataTypes.STRING(7), allowNull: false },
    reason: { type: DataTypes.TEXT, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false }
  },
  { sequelize, tableName: 'salary_changes', updatedAt: false }
);
