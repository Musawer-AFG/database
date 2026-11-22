// Derive warehouse managers from registered employees, not a free-text warehouse field.
// A keeper can be recorded either as an employee's job title or via the linked user role.
const normalize = text => String(text || '')
  .replace(/[\u064B-\u065F\u0670]/g, '')
  .replace(/[يى]/g, 'ی')
  .replace(/[ك]/g, 'ک')
  .replace(/[ؤئ]/g, '')
  .replace(/و{2,}/g, 'و')
  .replace(/[\s\u200c\u200d\-_]+/g, '')
  .toLowerCase();

export function warehouseEmployeeName(employee) {
  return [employee?.firstName, employee?.lastName].map(part => String(part || '').trim()).filter(Boolean).join(' ')
    || String(employee?.name || '').trim();
}

export function isWarehouseEmployeeRole(position) {
  const value = normalize(position);
  return ['مسولگدام', 'مدیرگدام', 'سرپرستگدام'].some(keyword => value.includes(keyword));
}

export function eligibleWarehouseManagers(employees = [], access = null) {
  const keeperEmployees = new Set((access?.users || [])
    .filter(user => user.active !== false && user.roleId === 'keeper' && user.employeeId != null)
    .map(user => String(user.employeeId)));
  return (employees || [])
    .filter(employee => employee && employee.id != null && employee.status !== 'غیرفعال'
      && (isWarehouseEmployeeRole(employee.position) || keeperEmployees.has(String(employee.id))))
    .filter(employee => warehouseEmployeeName(employee))
    .sort((a, b) => warehouseEmployeeName(a).localeCompare(warehouseEmployeeName(b), 'fa-AF'));
}

// Old warehouses may contain a plain-text manager. Keep it readable until reassigned.
export function selectedWarehouseManagerId(warehouse, eligible = []) {
  if (warehouse?.managerEmployeeId !== undefined && warehouse?.managerEmployeeId !== null
      && String(warehouse.managerEmployeeId).trim()) {
    return String(warehouse.managerEmployeeId);
  }
  const legacyName = String(warehouse?.manager || '').trim();
  if (!legacyName) return '';
  const matching = eligible.filter(person => warehouseEmployeeName(person) === legacyName);
  return matching.length === 1 ? String(matching[0].id) : '__legacy__';
}

export function warehouseManagerLabel(warehouse, employees = []) {
  const employee = (employees || []).find(person => String(person.id) === String(warehouse?.managerEmployeeId));
  return employee ? warehouseEmployeeName(employee) : String(warehouse?.manager || '').trim();
}

export function warehouseWithAssignedManager(warehouse, employees = [], access = null, previous = null) {
  const eligible = eligibleWarehouseManagers(employees, access);
  const chosenId = selectedWarehouseManagerId(warehouse, eligible);
  if (chosenId === '__legacy__') {
    if (previous && !previous.managerEmployeeId && previous.manager === warehouse.manager) {
      return { ...warehouse, managerEmployeeId: '', manager: previous.manager };
    }
    throw Error('مسوول گدام را از فهرست کارمندان ثبت‌شده انتخاب کنید.');
  }
  if (!chosenId) return { ...warehouse, managerEmployeeId: '', manager: '' };
  const employee = eligible.find(person => String(person.id) === chosenId);
  if (!employee) {
    // A past manager may have since left employment; keep the old assignment
    // during unrelated edits, but do not allow a new selection of that person.
    if (previous && String(previous.managerEmployeeId) === chosenId) {
      return { ...warehouse, managerEmployeeId: chosenId, manager: warehouseManagerLabel(previous, employees) };
    }
    throw Error('کارمند انتخاب‌شده دیگر مسوول فعال گدام نیست. کارمند دیگری را انتخاب کنید.');
  }
  return { ...warehouse, managerEmployeeId: chosenId, manager: warehouseEmployeeName(employee) };
}
