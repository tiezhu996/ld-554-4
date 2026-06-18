<template>
  <div v-if="employee">
    <div class="detail-header">
      <EmployeeAvatar :name="employee.name" :employee-no="employee.employeeNo" size="large" />
      <div class="header-info">
        <h2>{{ employee.name }}</h2>
        <p>{{ employee.department }} · {{ employee.position }}</p>
      </div>
      <el-button v-permission="['OWNER','MANAGER']" type="primary" @click="salaryFormVisible = true">
        调整薪资
      </el-button>
    </div>

    <el-descriptions :column="2" border class="detail-desc">
      <el-descriptions-item label="工号">{{ employee.employeeNo }}</el-descriptions-item>
      <el-descriptions-item label="部门">{{ employee.department }}</el-descriptions-item>
      <el-descriptions-item label="职位">{{ employee.position }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag>{{ EmployeeStatusLabel[employee.status as keyof typeof EmployeeStatusLabel] }}</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="手机号">{{ employee.phone }}</el-descriptions-item>
      <el-descriptions-item label="邮箱">{{ employee.email }}</el-descriptions-item>
      <el-descriptions-item label="入职日期">{{ employee.joinDate }}</el-descriptions-item>
      <el-descriptions-item label="当前薪资">
        <span class="salary-amount">{{ money(employee.salary) }}</span>
      </el-descriptions-item>
    </el-descriptions>

    <div class="salary-timeline-section">
      <h3>薪资变更记录</h3>
      <el-timeline v-if="employee.SalaryChanges && employee.SalaryChanges.length > 0">
        <el-timeline-item
          v-for="item in employee.SalaryChanges"
          :key="item.id"
          :timestamp="formatDate(item.createdAt)"
          :type="item.newSalary > item.oldSalary ? 'success' : item.newSalary < item.oldSalary ? 'warning' : 'primary'"
        >
          <el-card shadow="hover">
            <div class="timeline-header">
              <span class="effective-month">生效月份: {{ item.effectiveMonth }}</span>
              <el-tag :type="getChangeType(item)">
                {{ getChangeLabel(item) }}
              </el-tag>
            </div>
            <div class="salary-change-detail">
              <span class="old-salary">{{ money(item.oldSalary) }}</span>
              <el-icon class="arrow-icon"><ArrowRight /></el-icon>
              <span class="new-salary">{{ money(item.newSalary) }}</span>
              <span class="raise-amount" :class="{ positive: item.newSalary > item.oldSalary, negative: item.newSalary < item.oldSalary }">
                {{ item.newSalary > item.oldSalary ? '+' : '' }}{{ money(item.newSalary - item.oldSalary) }}
                ({{ item.newSalary > item.oldSalary ? '+' : '' }}{{ ((item.newSalary - item.oldSalary) / item.oldSalary * 100).toFixed(2) }}%)
              </span>
            </div>
            <div class="reason">
              <strong>调整原因：</strong>{{ item.reason }}
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
      <EmptyState v-else description="暂无薪资变更记录" />
    </div>

    <el-dialog
      v-model="salaryFormVisible"
      title="调整薪资"
      width="500px"
      :close-on-click-modal="false"
    >
      <SalaryChangeForm
        v-if="salaryFormVisible"
        :employee-id="employee.id"
        :old-salary="employee.salary"
        @submit="handleSalaryChanged"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { ArrowRight } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import EmployeeAvatar from '@/components/common/EmployeeAvatar.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import SalaryChangeForm from './SalaryChangeForm.vue';
import { EmployeeStatusLabel } from '@/constants/enums';
import { money } from '@/utils/format';
import { fetchEmployee } from '@/api/employee';
import type { Employee, SalaryChange } from '@/types/employee';

const props = defineProps<{ employee: Employee | null }>();

const salaryFormVisible = ref(false);

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getChangeType(item: SalaryChange) {
  if (item.newSalary > item.oldSalary) return 'success';
  if (item.newSalary < item.oldSalary) return 'warning';
  return 'info';
}

function getChangeLabel(item: SalaryChange) {
  if (item.newSalary > item.oldSalary) return '加薪';
  if (item.newSalary < item.oldSalary) return '降薪';
  return '调整';
}

async function handleSalaryChanged() {
  salaryFormVisible.value = false;
  if (props.employee) {
    const res = await fetchEmployee(props.employee.id);
    Object.assign(props.employee, res.data);
  }
  ElMessage.success('薪资调整已生效');
}
</script>

<style scoped>
.detail-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color);
}

.header-info {
  flex: 1;
}

.header-info h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 600;
}

.header-info p {
  margin: 0;
  color: var(--el-text-color-secondary);
}

.detail-desc {
  margin-bottom: 32px;
}

.salary-amount {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-color-primary);
}

.salary-timeline-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.effective-month {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.salary-change-detail {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 16px;
}

.old-salary {
  color: var(--el-text-color-secondary);
  text-decoration: line-through;
}

.arrow-icon {
  color: var(--el-text-color-placeholder);
}

.new-salary {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.raise-amount {
  margin-left: auto;
  font-weight: 500;
}

.raise-amount.positive {
  color: var(--el-color-success);
}

.raise-amount.negative {
  color: var(--el-color-warning);
}

.reason {
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
}
</style>
