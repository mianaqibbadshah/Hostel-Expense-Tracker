const money = n => Number(n||0).toLocaleString('en-PK',{minimumFractionDigits:0,maximumFractionDigits:2});
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'MAB-Admin-2026';
let users = JSON.parse(localStorage.getItem('hotelExpenseUsers') || 'null');
if(!users){
  const oldData = JSON.parse(localStorage.getItem('hotelExpenseData') || 'null');
  const oldBudget = Number(localStorage.getItem('hotelExpenseBudget') || 0);
  users = { admin: { password: ADMIN_PASS, role: 'admin', createdAt: new Date().toISOString(), lastLogin: '', data: oldData || {food:[],rent:[],other:[]}, budget: oldBudget || 0 } };
  localStorage.setItem('hotelExpenseUsers', JSON.stringify(users));
}
let currentUser = localStorage.getItem('hotelExpenseCurrentUser') || '';
let data = {food:[], rent:[], other:[]};
let budget = 0;
let editState = { type: null, index: null };
function persistUsers(){ localStorage.setItem('hotelExpenseUsers', JSON.stringify(users)); }
function getUserRecord(){ return users[currentUser] || null; }
function loadCurrentUserData(){ const u=getUserRecord(); data=u?.data || {food:[],rent:[],other:[]}; budget=Number(u?.budget || 0); }
const save=()=>{ const u=getUserRecord(); if(u){u.data=data; u.budget=budget; persistUsers();} render(); renderAdminPanel(); };
function saveSessionUser(name){ currentUser=name; localStorage.setItem('hotelExpenseCurrentUser', name); loadCurrentUserData(); }
function loginUser(name, pass){
  const u=users[name];
  if(!u || u.password !== pass) return false;
  u.lastLogin = new Date().toLocaleString('en-PK');
  persistUsers(); saveSessionUser(name);
  document.body.classList.add('logged-in');
  document.body.classList.toggle('is-admin', u.role==='admin');
  render(); renderAdminPanel(); return true;
}
function logoutUser(){ localStorage.removeItem('hotelExpenseCurrentUser'); currentUser=''; document.body.classList.remove('logged-in','is-admin'); showPage('dashboard'); }
function initAuth(){
  const form=document.getElementById('loginForm');
  if(form){ form.onsubmit=e=>{ e.preventDefault(); const ok=loginUser(loginUserInput(), document.getElementById('loginPass').value); loginMsg.textContent= ok ? '' : 'Invalid login details'; }; }
  if(currentUser && users[currentUser]) loginUser(currentUser, users[currentUser].password);
  else document.body.classList.remove('logged-in','is-admin');
}
function loginUserInput(){ return (document.getElementById('loginUser')?.value || '').trim(); }
function saveBudget(){
  const input=document.getElementById('budgetAmount');
  budget=Number(input.value)||0;
  const u=getUserRecord(); if(u){u.budget=budget; persistUsers();}
  render(); renderAdminPanel();
  const msg=document.getElementById('budgetSavedMsg');
  if(msg){msg.textContent='Budget saved successfully'; setTimeout(()=>msg.textContent='',1800);}
}
function setQuickBudget(amount){
  const input=document.getElementById('budgetAmount');
  if(input){input.value=amount;}
  saveBudget();
}
window.addEventListener('load',()=>setTimeout(()=>document.getElementById('loader').classList.add('hide'),550));
function showPage(page){if(page==='admin' && (!getUserRecord() || getUserRecord().role!=='admin')) page='dashboard'; document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.page===page));document.querySelectorAll('.page').forEach(p=>p.classList.toggle('show',p.id===page));window.scrollTo({top:0,behavior:'smooth'});}
document.querySelectorAll('.tab').forEach(btn=>btn.onclick=()=>showPage(btn.dataset.page));
foodForm.onsubmit=e=>{
 e.preventDefault();
 const record={date:foodDate.value,desc:foodDesc.value,breakfast:+breakfast.value||0,lunch:+lunch.value||0,dinner:+dinner.value||0,price:+foodPrice.value||0};
 if(editState.type==='food' && editState.index!==null){
   data.food[editState.index]=record;
   editState={type:null,index:null};
   const btn=document.getElementById('foodSubmitBtn'); if(btn) btn.textContent='Add Food';
   const cancel=document.getElementById('foodCancelEdit'); if(cancel) cancel.style.display='none';
 } else {
   data.food.push(record);
 }
 foodForm.reset();save();
};

rentForm.onsubmit=e=>{
 e.preventDefault();
 const record={month:rentMonth.value,desc:rentDesc.value,price:+rentPrice.value||0};
 if(editState.type==='rent' && editState.index!==null){
   data.rent[editState.index]=record;
   editState={type:null,index:null};
   const btn=document.getElementById('rentSubmitBtn'); if(btn) btn.textContent='Add Rent';
   const cancel=document.getElementById('rentCancelEdit'); if(cancel) cancel.style.display='none';
 } else {
   data.rent.push(record);
 }
 rentForm.reset();save();
};
otherForm.onsubmit=e=>{
 e.preventDefault();
 const record={date:otherDate.value,desc:otherDesc.value,price:+otherPrice.value||0};
 if(editState.type==='other' && editState.index!==null){
   data.other[editState.index]=record;
   editState={type:null,index:null};
   const btn=document.getElementById('otherSubmitBtn'); if(btn) btn.textContent='Add Other';
   const cancel=document.getElementById('otherCancelEdit'); if(cancel) cancel.style.display='none';
 } else {
   data.other.push(record);
 }
 otherForm.reset();save();
};
function del(type,i){if(confirm('Delete this record?')){data[type].splice(i,1); if(editState.type===type && editState.index===i) cancelEdit(type); save();}}
function editFood(i){
 const r=data.food[i]; if(!r) return;
 foodDate.value=r.date||''; foodDesc.value=r.desc||''; breakfast.value=r.breakfast||''; lunch.value=r.lunch||''; dinner.value=r.dinner||''; foodPrice.value=r.price||'';
 editState={type:'food',index:i};
 const btn=document.getElementById('foodSubmitBtn'); if(btn) btn.textContent='Update Food';
 const cancel=document.getElementById('foodCancelEdit'); if(cancel) cancel.style.display='inline-flex';
 showPage('food'); foodForm.scrollIntoView({behavior:'smooth',block:'center'});
}
function cancelFoodEdit(){
 editState={type:null,index:null}; foodForm.reset();
 const btn=document.getElementById('foodSubmitBtn'); if(btn) btn.textContent='Add Food';
 const cancel=document.getElementById('foodCancelEdit'); if(cancel) cancel.style.display='none';
}

function editRent(i){
 const r=data.rent[i]; if(!r) return;
 rentMonth.value=r.month||''; rentDesc.value=r.desc||''; rentPrice.value=r.price||'';
 editState={type:'rent',index:i};
 const btn=document.getElementById('rentSubmitBtn'); if(btn) btn.textContent='Update Rent';
 const cancel=document.getElementById('rentCancelEdit'); if(cancel) cancel.style.display='inline-flex';
 showPage('rent'); rentForm.scrollIntoView({behavior:'smooth',block:'center'});
}
function cancelRentEdit(){
 editState={type:null,index:null}; rentForm.reset();
 const btn=document.getElementById('rentSubmitBtn'); if(btn) btn.textContent='Add Rent';
 const cancel=document.getElementById('rentCancelEdit'); if(cancel) cancel.style.display='none';
}
function editOther(i){
 const r=data.other[i]; if(!r) return;
 otherDate.value=r.date||''; otherDesc.value=r.desc||''; otherPrice.value=r.price||'';
 editState={type:'other',index:i};
 const btn=document.getElementById('otherSubmitBtn'); if(btn) btn.textContent='Update Other';
 const cancel=document.getElementById('otherCancelEdit'); if(cancel) cancel.style.display='inline-flex';
 showPage('other'); otherForm.scrollIntoView({behavior:'smooth',block:'center'});
}
function cancelOtherEdit(){
 editState={type:null,index:null}; otherForm.reset();
 const btn=document.getElementById('otherSubmitBtn'); if(btn) btn.textContent='Add Other';
 const cancel=document.getElementById('otherCancelEdit'); if(cancel) cancel.style.display='none';
}
function cancelEdit(type){
 if(type==='food') cancelFoodEdit();
 if(type==='rent') cancelRentEdit();
 if(type==='other') cancelOtherEdit();
}
function foodTotal(){return data.food.reduce((s,r)=>s+(+r.price||0),0)}
function rentTotal(){return data.rent.reduce((s,r)=>s+r.price,0)}
function otherTotal(){return data.other.reduce((s,r)=>s+r.price,0)}
function table(headers, rows, total, className=''){return `<div class="table-wrap"><table class="${className}"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('') || `<tr><td colspan="${headers.length}">No record added yet.</td></tr>`}<tr class="total-row"><td colspan="${headers.length-1}">Total</td><td>${money(total)}</td></tr></tbody></table></div>`}
function render(){
 const grand=foodTotal()+rentTotal()+otherTotal();
 foodTotalCard.textContent=money(foodTotal()); rentTotalCard.textContent=money(rentTotal()); otherTotalCard.textContent=money(otherTotal()); grandTotalCard.textContent=money(grand); heroGrandTotal.textContent=money(grand);
 const foodRows=data.food.map((r,i)=>`<tr><td>${i+1}</td><td>${r.date}</td><td>${escapeHTML(r.desc)}</td><td>${money(r.breakfast)}</td><td>${money(r.lunch)}</td><td>${money(r.dinner)}</td><td>${money(r.price)}</td><td>${money(r.price)}</td><td><div class="action-group"><button class="action edit" onclick="editFood(${i})">Edit</button><button class="action" onclick="del('food',${i})">Delete</button></div></td></tr>`);
 foodTable.innerHTML=table(['Ser No.','Date','Description','Breakfast','Lunch','Dinner','Price','Saved Total','Action'],foodRows,foodTotal(),'food-table');
 const rentRows=data.rent.map((r,i)=>`<tr><td>${i+1}</td><td>${r.month}</td><td>${escapeHTML(r.desc)}</td><td>${money(r.price)}</td><td><div class="action-group"><button class="action edit" onclick="editRent(${i})">Edit</button><button class="action" onclick="del('rent',${i})">Delete</button></div></td></tr>`);
 rentTable.innerHTML=table(['Ser No.','Month','Description','Price','Action'],rentRows,rentTotal());
 const otherRows=data.other.map((r,i)=>`<tr><td>${i+1}</td><td>${r.date||''}</td><td>${escapeHTML(r.desc)}</td><td>${money(r.price)}</td><td><div class="action-group"><button class="action edit" onclick="editOther(${i})">Edit</button><button class="action" onclick="del('other',${i})">Delete</button></div></td></tr>`);
 otherTable.innerHTML=table(['Ser No.','Date','Description','Price','Action'],otherRows,otherTotal());
 summaryTables.innerHTML=`<h3 class="summary-title">Food Expensive</h3>${foodTable.innerHTML}<h3 class="summary-title">Monthly Room Rent</h3>${rentTable.innerHTML}<h3 class="summary-title">Other Expensive</h3>${otherTable.innerHTML}`;
 renderAI(grand);
}
function escapeHTML(str=''){return String(str).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
function clearAll(){if(confirm('This will remove saved data for current user. Continue?')){data={food:[],rent:[],other:[]};save();}}
function download(name, content, type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);}

function padText(value, len, align='left'){
 const text=String(value ?? '').replace(/\s+/g,' ').trim();
 if(text.length>=len) return text.slice(0,len-1)+'…';
 return align==='right' ? text.padStart(len,' ') : text.padEnd(len,' ');
}
function receiptRows(type){
 const rows = type==='food' ? data.food : type==='rent' ? data.rent : data.other;
 if(!rows.length) return `<tr><td colspan="4" class="empty">No record added yet.</td></tr>`;
 return rows.map((r,i)=>{
   const when = type==='rent' ? (r.month||'-') : (r.date||'-');
   const desc = escapeHTML(r.desc||'-');
   return `<tr><td>${i+1}</td><td>${when}</td><td>${desc}</td><td class="amount">${money(+r.price||0)}</td></tr>`;
 }).join('');
}
function receiptSection(title,total,rows){return `<section class="receipt-section"><h3>${title}</h3><table><thead><tr><th>SR#</th><th>DATE/MONTH</th><th>DESCRIPTION</th><th>AMOUNT (PKR)</th></tr></thead><tbody>${rows}</tbody><tfoot><tr><td colspan="3">${title.toUpperCase()} TOTAL</td><td class="amount">${money(total)}</td></tr></tfoot></table></section>`}
function buildReceiptHTML(){
 const grand=foodTotal()+rentTotal()+otherTotal();
 const remaining=(budget||0)-grand;
 const used=budget?Math.round((grand/budget)*100):0;
 const status=!budget?'NO BUDGET SET':remaining<0?'OVER BUDGET':used>=70?'WARNING':'WITHIN BUDGET';
 const date=new Date().toLocaleString('en-PK',{dateStyle:'medium',timeStyle:'short'});
 return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Hotel Expense Receipt</title><style>
  *{box-sizing:border-box}body{margin:0;background:#f3f3f3;color:#111}.receipt{width:900px;margin:0 auto;background:#fff;min-height:100vh;border:1px solid #ddd}.receipt-header{background:linear-gradient(135deg,#d71920,#9d1117);color:white;padding:28px 34px;display:flex;align-items:center;gap:18px;border-bottom:8px solid #ffbc0d}.receipt-logo{width:76px;height:76px;border-radius:50%;background:repeating-linear-gradient(90deg,#d71920 0 12px,#fff 12px 23px);border:5px solid #ffbc0d;display:grid;place-items:center;box-shadow:0 8px 22px #0004;flex:0 0 auto}.receipt-logo span{background:#151515;color:#ffbc0d;width:48px;height:48px;border-radius:50%;display:grid;place-items:center;font:bold 17px Arial,sans-serif}.receipt-header h1{margin:0;font:bold 28px Arial,sans-serif;letter-spacing:.2px}.receipt-header p{margin:6px 0 0;color:#fff4bb;font:bold 14px Arial,sans-serif}.receipt-body{font-family:"Courier New",Courier,monospace;padding:28px 34px;background:#fff}.receipt-title{text-align:center;font-weight:bold;font-size:18px;letter-spacing:1px;margin:0 0 16px}.line{border-top:2px dashed #111;margin:12px 0}.meta{font-size:14px;line-height:1.75}.meta-row{display:flex;justify-content:space-between;gap:18px}.summary{font-size:15px;line-height:1.8}.summary .total-line{font-size:18px;font-weight:bold}.receipt-section{margin-top:20px}.receipt-section h3{font-size:16px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.8px}.receipt-section table{width:100%;border-collapse:collapse;font-size:13px}.receipt-section th,.receipt-section td{padding:7px 6px;border-bottom:1px dashed #777;text-align:left;vertical-align:top}.receipt-section th{font-weight:bold;border-top:2px solid #111;border-bottom:2px solid #111}.receipt-section tfoot td{font-weight:bold;border-top:2px solid #111;border-bottom:2px solid #111}.amount{text-align:right!important;white-space:nowrap}.empty{text-align:center!important;color:#555;font-weight:bold;padding:14px!important}.budget-box{margin-top:20px;border-top:2px solid #111;border-bottom:2px solid #111;padding:10px 0;font-size:15px;line-height:1.9}.grand-box{margin-top:18px;border:3px double #111;padding:14px;text-align:center;font-weight:bold;font-size:20px}.footer-note{text-align:center;font-size:12px;line-height:1.6;margin-top:18px}.print-actions{display:none}@media print{body{background:#fff}.receipt{width:100%;border:0}.receipt-header{print-color-adjust:exact;-webkit-print-color-adjust:exact}.receipt-body{padding:22px}.receipt-section table{font-size:11px}.receipt-header h1{font-size:23px}}
 </style></head><body><div class="receipt"><header class="receipt-header"><div class="receipt-logo"><span>MAB</span></div><div><h1>Mian Aqib Badshah Hotel Expensive</h1><p>Hotel Expensive, Room Rent and other Expensive.</p></div></header><main class="receipt-body"><div class="receipt-title">EXPENSE RECEIPT / REPORT</div><div class="line"></div><div class="meta"><div class="meta-row"><span>REPORT DATE : ${date}</span><span>REPORT NO : MAB-${Date.now().toString().slice(-6)}</span></div><div class="meta-row"><span>GENERATED BY: Mian Aqib Badshah</span><span>STATUS: ${status}</span></div></div><div class="line"></div>${receiptSection('Food Expensive',foodTotal(),receiptRows('food'))}${receiptSection('Monthly Room Rent',rentTotal(),receiptRows('rent'))}${receiptSection('Other Expensive',otherTotal(),receiptRows('other'))}<div class="budget-box"><div class="meta-row"><span>TOTAL BUDGET</span><strong>PKR ${money(budget||0)}</strong></div><div class="meta-row"><span>TOTAL SPENT</span><strong>PKR ${money(grand)}</strong></div><div class="meta-row"><span>REMAINING</span><strong>PKR ${money(remaining)}</strong></div><div class="meta-row"><span>BUDGET USED</span><strong>${budget?used:0}%</strong></div><div class="meta-row"><span>STATUS</span><strong>${status}</strong></div></div><div class="grand-box">GRAND TOTAL: PKR ${money(grand)}</div><div class="line"></div><p class="footer-note">This receipt is generated by Mian Aqib Badshah Hotel Expensive website.<br>Food totals are calculated from the Price field only.</p></main></div></body></html>`;
}
function printReceipt(){const w=window.open('','_blank');w.document.open();w.document.write(buildReceiptHTML());w.document.close();setTimeout(()=>{w.focus();w.print();},500);}
function savePDF(){printReceipt();}
function reportText(){return `Mian Aqib Badshah Hotel Expensive\nHotel Expensive, Room Rent and other Expensive.\n\nFood Total (Price only): ${money(foodTotal())}\nRoom Rent Total: ${money(rentTotal())}\nOther Total: ${money(otherTotal())}\nGrand Total: ${money(foodTotal()+rentTotal()+otherTotal())}\n\nData Backup JSON:\n${JSON.stringify(data,null,2)}`;}
function exportText(){download('hotel-expensive-report.txt',reportText(),'text/plain')}
function exportWord(){download('hotel-expensive-receipt.doc',buildReceiptHTML(),'application/msword')}
function exportJSON(){download('hotel-expensive-data-backup.json',JSON.stringify(data,null,2),'application/json')}
function importJSON(e){const file=e.target.files[0]; if(!file)return; const reader=new FileReader(); reader.onload=()=>{try{const parsed=JSON.parse(reader.result);data={food:parsed.food||[],rent:parsed.rent||[],other:parsed.other||[]};save();alert('Data restored successfully for current user.')}catch{alert('Invalid backup file.')}}; reader.readAsText(file);}
async function exportImage(type='png'){
 const width=1050, height=1600;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(new DOMParser().parseFromString(buildReceiptHTML(),'text/html').documentElement)}</foreignObject></svg>`;
 const img=new Image(); const url='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
 img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0);const a=document.createElement('a');a.download=`hotel-expensive-receipt.${type}`;a.href=canvas.toDataURL(type==='jpg'?'image/jpeg':'image/png',0.95);a.click();};
 img.onerror=()=>alert('Image export is not supported by this browser. Please use Print / Save PDF.');
 img.src=url;
}
function exportPNG(){exportImage('png')}
function exportJPG(){exportImage('jpg')}

function userTotals(u){
 const d=u.data || {food:[],rent:[],other:[]};
 const food=(d.food||[]).reduce((s,r)=>s+(+r.price||0),0);
 const rent=(d.rent||[]).reduce((s,r)=>s+(+r.price||0),0);
 const other=(d.other||[]).reduce((s,r)=>s+(+r.price||0),0);
 const total=food+rent+other;
 const count=(d.food||[]).length+(d.rent||[]).length+(d.other||[]).length;
 const used=u.budget ? Math.round((total/Number(u.budget))*100) : 0;
 return {food,rent,other,total,count,used};
}
function renderAdminPanel(){
 const box=document.getElementById('adminProgressTable'); if(!box) return;
 if(!getUserRecord() || getUserRecord().role !== 'admin'){ box.innerHTML=''; return; }
 const rows=Object.keys(users).map(name=>{
  const u=users[name]; const t=userTotals(u);
  return `<tr><td><input type="radio" name="selectedUser" value="${escapeHTML(name)}"></td><td>${escapeHTML(name)}</td><td>${u.role}</td><td>${t.count}</td><td>${money(t.food)}</td><td>${money(t.rent)}</td><td>${money(t.other)}</td><td>${money(t.total)}</td><td>${money(u.budget||0)}</td><td>${t.used}%</td><td>${u.lastLogin||'-'}</td></tr>`;
 }).join('');
 box.innerHTML = table(['Select','Admin/User Name','Role','Records','Food','Rent','Other','Total','Budget','Used','Last Login'], rows, Object.values(users).reduce((s,u)=>s+userTotals(u).total,0));
}
function setupAdminForm(){
 const f=document.getElementById('createUserForm'); if(!f) return;
 f.onsubmit=e=>{e.preventDefault(); const name=(newUsername.value||'').trim(); const pass=(newPassword.value||'').trim();
  if(!name || !pass){createUserMsg.textContent='Please enter details.'; return;}
  if(users[name]){createUserMsg.textContent='This name already exists.'; return;}
  users[name]={password:pass, role:'user', createdAt:new Date().toISOString(), lastLogin:'', data:{food:[],rent:[],other:[]}, budget:0};
  persistUsers(); f.reset(); createUserMsg.textContent='User created successfully.'; renderAdminPanel();
 };
}
function selectedAdminUser(){ const el=document.querySelector('input[name="selectedUser"]:checked'); return el ? el.value : ''; }
function resetSelectedUser(){ const name=selectedAdminUser(); if(!name){alert('Please select a user first.'); return;} if(name==='admin'){alert('Admin data cannot be reset from this button.'); return;} if(confirm('Reset selected user data?')){ users[name].data={food:[],rent:[],other:[]}; users[name].budget=0; persistUsers(); renderAdminPanel(); } }
function downloadAdminUsers(){
 const lines=['Mian Aqib Badshah Hotel Expense - Users List','Generated: '+new Date().toLocaleString('en-PK'),''];
 Object.keys(users).forEach(name=>{const u=users[name]; const t=userTotals(u); lines.push(`${name} | ${u.role} | Records: ${t.count} | Total: PKR ${money(t.total)} | Budget: PKR ${money(u.budget||0)} | Last Login: ${u.lastLogin||'-'}`);});
 download('admin-users-progress.txt', lines.join('\n'), 'text/plain');
}

initAuth();
setupAdminForm();
render();
renderAdminPanel();

function renderAI(grand){
 const b=budget||0, remaining=b-grand, used=b>0?(grand/b)*100:0;
 const ids=['aiTotalSpent','aiBudget','aiRemaining','aiUsedPercent','budgetAmount','budgetFill','budgetStatus','aiAdvice'];
 if(!ids.every(id=>document.getElementById(id))) return;
 aiTotalSpent.textContent=money(grand); aiBudget.textContent=money(b); aiRemaining.textContent=money(remaining); aiUsedPercent.textContent=b?Math.round(used)+'%':'0%';
 if(document.getElementById('currentBudgetText')) currentBudgetText.textContent='PKR '+money(b);
 budgetAmount.value=b || '';
 budgetFill.style.width=Math.min(used,100)+'%';
 budgetStatus.className='pill';
 if(!b){budgetStatus.textContent='No Budget'; aiAdvice.textContent='Please enter a monthly budget to compare your expenses automatically.';}
 else if(used<70){budgetStatus.textContent='Safe'; budgetStatus.classList.add('safe'); aiAdvice.textContent=`Good control: you still have PKR ${money(Math.max(remaining,0))} remaining from your budget.`;}
 else if(used<=100){budgetStatus.textContent='Warning'; budgetStatus.classList.add('warning'); aiAdvice.textContent=`Careful: you have used ${Math.round(used)}% of your budget. Try to reduce food or other extra expenses.`;}
 else {budgetStatus.textContent='Over Budget'; budgetStatus.classList.add('danger-status'); aiAdvice.textContent=`Alert: your expenses are PKR ${money(Math.abs(remaining))} above budget. Please review unnecessary spending.`;}
 drawBarChart('categoryChart',['Food','Room Rent','Other'],[foodTotal(),rentTotal(),otherTotal()],'Category Expense');
 drawBarChart('budgetChart',['Budget','Spent','Remaining'],[b,grand,Math.max(remaining,0)],'Budget Comparison');
}
function drawBarChart(id, labels, values, title){
 const canvas=document.getElementById(id); if(!canvas) return; const ctx=canvas.getContext('2d');
 const w=canvas.width=canvas.clientWidth*2, h=canvas.height=230*2; ctx.clearRect(0,0,w,h); ctx.scale(2,2);
 const cw=canvas.clientWidth, ch=230, pad=35, base=ch-35; const max=Math.max(...values,1); const barW=(cw-pad*2)/labels.length*.55;
 ctx.font='700 13px Poppins, Arial'; ctx.fillStyle='#151515'; ctx.fillText(title,18,24);
 ctx.strokeStyle='#ead39b'; ctx.beginPath(); ctx.moveTo(pad,base); ctx.lineTo(cw-15,base); ctx.stroke();
 values.forEach((v,i)=>{const x=pad+i*((cw-pad*2)/labels.length)+(cw-pad*2)/labels.length*.22; const bh=(v/max)*(ch-85); const y=base-bh; const grad=ctx.createLinearGradient(0,y,0,base); grad.addColorStop(0,'#d71920'); grad.addColorStop(1,'#ffbc0d'); ctx.fillStyle=grad; roundRect(ctx,x,y,barW,bh,9); ctx.fill(); ctx.fillStyle='#151515'; ctx.font='800 11px Poppins, Arial'; ctx.textAlign='center'; ctx.fillText(money(v),x+barW/2,Math.max(y-7,42)); ctx.font='700 11px Poppins, Arial'; ctx.fillText(labels[i],x+barW/2,base+18); ctx.textAlign='left';});
}
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
window.addEventListener('resize',()=>renderAI(foodTotal()+rentTotal()+otherTotal()));
