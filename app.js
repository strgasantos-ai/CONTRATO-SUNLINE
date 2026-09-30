(() => {
  const form = document.querySelector('#contract-form');
  const items = document.querySelector('#items');
  const payments = document.querySelector('#payments');
  const storageKey = 'sunline-contrato-v3';
  const fields = [...form.querySelectorAll('[data-field]')];
  const today = new Date();
  const dateToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  let loading = true;

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  }
  function addItem(item = {}) {
    const row = document.createElement('tr');
    row.innerHTML = `<td><input class="qty" data-item="qty" inputmode="numeric" aria-label="Quantidade" value="${escapeHtml(item.qty ?? '')}" placeholder=""></td><td><input data-item="description" aria-label="Descrição da mercadoria" value="${escapeHtml(item.description || '')}" placeholder=""></td><td class="remove-cell"><button class="remove-button" type="button" aria-label="Remover linha" title="Remover linha">×</button></td>`;
    row.querySelector('.remove-button').addEventListener('click', () => { row.remove(); save(); });
    row.addEventListener('input', save);
    items.append(row);
  }
  function addPayment(payment = {}) {
    const row = document.createElement('div');
    row.className = 'receipt-entry';
    row.innerHTML = `<input class="receipt-date" data-payment="date" type="date" aria-label="Data do recebimento" value="${escapeHtml(payment.date || '')}"><input data-payment="method" aria-label="Forma de pagamento" value="${escapeHtml(payment.method || payment.description || '')}" placeholder="Forma de pagamento"><input class="amount" data-payment="amount" aria-label="Valor recebido" value="${escapeHtml(payment.amount || '')}" placeholder="R$ 0,00"><button class="remove-button" type="button" aria-label="Remover recebimento" title="Remover recebimento">×</button>`;
    row.querySelector('.remove-button').addEventListener('click', () => { row.remove(); save(); });
    row.addEventListener('input', save);
    payments.append(row);
  }
  function readForm() {
    return {
      fields: Object.fromEntries(fields.map(field => [field.dataset.field, field.value])),
      items: [...items.querySelectorAll('tr')].map(row => ({ qty: row.querySelector('[data-item="qty"]').value, description: row.querySelector('[data-item="description"]').value })),
      payments: [...payments.querySelectorAll('.receipt-entry')].map(row => ({ date: row.querySelector('[data-payment="date"]').value, method: row.querySelector('[data-payment="method"]').value, amount: row.querySelector('[data-payment="amount"]').value }))
    };
  }
  function save() {
    if (loading) return;
    try { localStorage.setItem(storageKey, JSON.stringify(readForm())); } catch { /* storage can be disabled by the browser */ }
  }
  let draft;
  try { draft = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { draft = null; }
  for (const field of fields) {
    const savedValue = draft?.fields?.[field.dataset.field];
    if (savedValue !== undefined) field.value = savedValue;
    else if (field.dataset.field === 'date') field.value = dateToday;
    else if (field.dataset.field === 'number') field.value = `SL-${today.getFullYear()}-001`;
  }
  for (const item of draft?.items || []) addItem(item);
  if (!draft?.items?.length) for (let i = 0; i < 5; i++) addItem();
  for (const payment of draft?.payments || []) addPayment(payment);
  if (!draft?.payments?.length) for (let i = 0; i < 2; i++) addPayment();
  loading = false;
  form.addEventListener('input', save);
  document.querySelector('#add-item').addEventListener('click', () => { addItem(); save(); items.lastElementChild?.querySelector('input')?.focus(); });
  document.querySelector('#add-payment').addEventListener('click', () => { addPayment(); save(); payments.lastElementChild?.querySelector('input')?.focus(); });
  document.querySelector('#print').addEventListener('click', () => window.print());
})();
