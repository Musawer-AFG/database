import test from 'node:test';
import assert from 'node:assert/strict';
import { warehouseEmployeeName, isWarehouseEmployeeRole, eligibleWarehouseManagers, selectedWarehouseManagerId, warehouseManagerLabel, warehouseWithAssignedManager } from '../src/services/warehouseManagers.js';

const employees = [
  { id: 1, firstName: 'احمد', lastName: 'احمدی', position: 'مسوول گدام', status: 'فعال' },
  { id: 2, firstName: 'علی', lastName: 'کریمی', position: 'حسابدار', status: 'فعال' },
  { id: 3, firstName: 'بلال', lastName: 'نوری', position: 'مسئول گدام', status: 'غیرفعال' },
  { id: 4, firstName: 'عمر', lastName: 'صالحی', position: 'سرپرست گدام' },
  { id: 5, firstName: 'نور', lastName: 'افضلی', position: 'فروشنده' },
];
const access = { users: [{employeeId:'5', roleId:'keeper', active:true},{employeeId:'2',roleId:'accountant',active:true}] };

test('recognizes Afghan Dari warehouse keeper title variants', () => {
  for(const title of ['مسوول گدام','مسئول گدام','مسؤول گدام','مدیر گدام','سرپرست گدام']) assert.equal(isWarehouseEmployeeRole(title),true,title);
  assert.equal(isWarehouseEmployeeRole('حسابدار'),false);
});
test('only employees registered as keeper, including access-linked keeper, appear', () => {
  assert.deepEqual(eligibleWarehouseManagers(employees,access).map(e=>e.id).sort(),[1,4,5]);
  assert.deepEqual(eligibleWarehouseManagers(employees).map(e=>e.id).sort(),[1,4]);
});
test('stores ID and display name for assignment and reflects name edits', () => {
  const draft=warehouseWithAssignedManager({name:'گدام ۱',managerEmployeeId:'1'},employees,access);
  assert.equal(draft.manager,'احمد احمدی');
  assert.equal(draft.managerEmployeeId,'1');
  assert.equal(warehouseManagerLabel(draft,[{...employees[0],lastName:'جدید'}]),'احمد جدید');
});
test('rejects a nonkeeper and preserves past legacy names on existing warehouse edits', () => {
  assert.throws(()=>warehouseWithAssignedManager({managerEmployeeId:'2'},employees,access),/مسوول فعال/);
  const previous={name:'گدام قبلی',manager:'مسوول قدیمی'};
  assert.equal(selectedWarehouseManagerId(previous,eligibleWarehouseManagers(employees,access)),'__legacy__');
  const once = warehouseWithAssignedManager({...previous,name:'گدام قدیمی'},employees,access,previous);
  assert.equal(once.manager,'مسوول قدیمی');
  assert.equal(selectedWarehouseManagerId(once,eligibleWarehouseManagers(employees,access)),'__legacy__');
  assert.equal(warehouseWithAssignedManager(once,employees,access,once).manager,'مسوول قدیمی');
  assert.equal(warehouseWithAssignedManager({name:'گدام قبلی',managerEmployeeId:''},employees,access,previous).manager,'');
});
