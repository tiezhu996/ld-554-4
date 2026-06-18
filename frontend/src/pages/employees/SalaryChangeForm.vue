<template>
  <el-form :model="form" label-width="88px" :rules="rules" ref="formRef">
    <el-form-item label="当前薪资">
      <el-input :value="money(oldSalary)" disabled />
    </el-form-item>
    <el-form-item label="调整后薪资" prop="newSalary">
      <el-input-number v-model="form.newSalary" :min="0" :precision="2" />
    </el-form-item>
    <el-form-item label="生效月份" prop="effectiveMonth">
      <el-date-picker
        v-model="form.effectiveMonth"
        type="month"
        value-format="YYYY-MM"
        placeholder="选择生效月份"
      />
    </el-form-item>
    <el-form-item label="调整原因" prop="reason">
      <el-input
        v-model="form.reason"
        type="textarea"
        :rows="3"
        placeholder="请输入调整原因"
      />
    </el-form-item>
    <el-form-item v-if="raiseAmount !== null">
      <el-alert
        :title="`调薪幅度: ${raiseAmount > 0 ? '+' : ''}${money(raiseAmount)} (${raisePercent})`"
        :type="raiseAmount > 0 ? 'success' : raiseAmount < 0 ? 'warning' : 'info'"
        show-icon
      />
    </el-form-item>
    <el-button type="primary" @click="handleSubmit">保存调薪</el-button>
  </el-form>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { money } from '@/utils/format';
import { createSalaryChange } from '@/api/employee';
import type { FormInstance, FormRules } from 'element-plus';

const props = defineProps<{
  employeeId: number;
  oldSalary: number;
}>();

const emit = defineEmits<{ submit: [] }>();

const formRef = ref<FormInstance>();
const form = reactive({
  newSalary: props.oldSalary,
  effectiveMonth: new Date().toISOString().slice(0, 7),
  reason: ''
});

const rules: FormRules = {
  newSalary: [{ required: true, message: '请输入调整后薪资', trigger: 'blur' }],
  effectiveMonth: [{ required: true, message: '请选择生效月份', trigger: 'change' }],
  reason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }]
};

const raiseAmount = computed(() => {
  if (!form.newSalary || !props.oldSalary) return null;
  return Number((form.newSalary - props.oldSalary).toFixed(2));
});

const raisePercent = computed(() => {
  if (raiseAmount.value === null || !props.oldSalary) return '0%';
  const percent = ((raiseAmount.value / props.oldSalary) * 100).toFixed(2);
  return `${raiseAmount.value > 0 ? '+' : ''}${percent}%`;
});

async function handleSubmit() {
  if (!formRef.value) return;
  const valid = await formRef.value.validate().catch(() => false);
  if (!valid) return;

  await createSalaryChange(props.employeeId, form);
  ElMessage.success('调薪记录已保存，薪资已自动更新');
  emit('submit');
}
</script>
