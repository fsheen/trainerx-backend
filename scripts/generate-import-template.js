#!/usr/bin/env node
/**
 * 生成学员批量导入 Excel 模板
 * 使用：node scripts/generate-import-template.js
 */

const XLSX = require('xlsx');

// 表头定义
const headers = [
  '姓名',
  '手机号',
  '性别',
  '身高',
  '体重',
  '健身目标',
  '课程名称',
  '课时数',
  '价格',
  '购买日期',
  '有效期至',
  '备注'
];

// 示例数据
const exampleData = [
  ['张三', '13812341234', '男', '175', '70', '减脂', '私教课', '20', '5000', '2026-04-01', '2026-12-31', '老学员'],
  ['李四', '13956785678', '女', '165', '55', '塑形', '塑形课', '15', '3500', '2026-04-05', '', ''],
  ['王五', '13690129012', '男', '180', '85', '增肌', '增肌训练', '30', '8000', '2026-04-08', '', '新学员']
];

// 创建工作簿
const wb = XLSX.utils.book_new();

// 创建工作表
const wsData = [headers, ...exampleData];
const ws = XLSX.utils.aoa_to_sheet(wsData);

// 设置列宽
ws['!cols'] = [
  { wch: 10 },  // 姓名
  { wch: 15 },  // 手机号
  { wch: 8 },   // 性别
  { wch: 8 },   // 身高
  { wch: 8 },   // 体重
  { wch: 10 },  // 健身目标
  { wch: 15 },  // 课程名称
  { wch: 10 },  // 课时数
  { wch: 10 },  // 价格
  { wch: 12 },  // 购买日期
  { wch: 12 },  // 有效期至
  { wch: 20 }   // 备注
];

// 添加表头说明
const instruction = [
  ['【填写说明】'],
  ['必填字段：姓名、手机号'],
  ['课时包字段：如果要批量导入课时，需填写"课程名称"和"课时数"'],
  ['日期格式：YYYY-MM-DD（如 2026-04-01）'],
  ['手机号：11 位大陆手机号，用于匹配已有学员，避免重复'],
  ['价格单位：元（如 5000 表示 5000 元）'],
  ['有效期至：不填表示长期有效'],
];

const instructionSheet = XLSX.utils.aoa_to_sheet(instruction);
instructionSheet['!cols'] = [{ wch: 60 }];

// 添加工作表到工作簿
XLSX.utils.book_append_sheet(wb, instructionSheet, '填写说明');
XLSX.utils.book_append_sheet(wb, ws, '学员模板');

// 保存文件
const fileName = 'TrainerX 学员批量导入模板.xlsx';
XLSX.writeFile(wb, fileName);

console.log(`✅ 模板文件已生成：${fileName}`);
console.log('\n📋 字段说明：');
console.log('  必填：姓名、手机号');
console.log('  选填（学员信息）：性别、身高、体重、健身目标、备注');
console.log('  选填（课时包）：课程名称、课时数、价格、购买日期、有效期至');
console.log('\n⚠️  注意：如果要批量导入课时，"课程名称"和"课时数"必填');
