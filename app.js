// Simple OOP frontend annotator using ES6 classes and localStorage

class Item {
  constructor(id, title, description, dueDate, priority, createdAt = null) {
    this.id = id || Item.generateId();
    this.title = title || '';
    this.description = description || '';
    this.dueDate = dueDate || null;
    this.priority = priority || 'medium';
    this.createdAt = createdAt || new Date().toISOString();
    this.completed = false;
  }

  toggleComplete() {
    this.completed = !this.completed;
  }

  static generateId() {
    return 'id_' + Math.random().toString(36).slice(2, 9);
  }
}

class Bill extends Item {
  constructor(id, title, description, dueDate, priority, amount = 0, createdAt = null) {
    super(id, title, description, dueDate, priority, createdAt);
    this.amount = Number(amount) || 0;
    this.paid = false;
  }

  markPaid() {
    this.paid = true;
    this.completed = true;
  }

  markUnpaid() {
    this.paid = false;
    this.completed = false;
  }
}

class Task extends Item {
  constructor(id, title, description, dueDate, priority, createdAt = null) {
    super(id, title, description, dueDate, priority, createdAt);
  }
}

class Annotator {
  constructor(storageKey = 'annotador_poo_data') {
    this.storageKey = storageKey;
    this.items = [];
    this.load();
  }

  add(item) {
    this.items.push(item);
    this.save();
  }

  update(updated) {
    this.items = this.items.map(i => i.id === updated.id ? updated : i);
    this.save();
  }

  remove(id) {
    this.items = this.items.filter(i => i.id !== id);
    this.save();
  }

  find(id) {
    return this.items.find(i => i.id === id);
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  load() {
    const raw = localStorage.getItem(this.storageKey);
    if (raw) {
      try {
        const arr = JSON.parse(raw);
        // revive objects preserving classes
        this.items = arr.map(o => {
          if (o.hasOwnProperty('amount')) {
            const b = new Bill(o.id, o.title, o.description, o.dueDate, o.priority, o.amount, o.createdAt);
            b.paid = !!o.paid;
            b.completed = !!o.completed;
            return b;
          } else {
            const t = new Task(o.id, o.title, o.description, o.dueDate, o.priority, o.createdAt);
            t.completed = !!o.completed;
            return t;
          }
        });
      } catch(e){
        console.error('Falha ao ler dados locais', e);
        this.items = [];
      }
    } else {
      this.items = [];
    }
  }

  exportJSON() {
    return JSON.stringify(this.items, null, 2);
  }

  importJSON(jsonStr) {
    try{
      const arr = JSON.parse(jsonStr);
      this.items = arr.map(o => {
        if (o.hasOwnProperty('amount')) {
          const b = new Bill(o.id, o.title, o.description, o.dueDate, o.priority, o.amount, o.createdAt);
          b.paid = !!o.paid;
          b.completed = !!o.completed;
          return b;
        } else {
          const t = new Task(o.id, o.title, o.description, o.dueDate, o.priority, o.createdAt);
          t.completed = !!o.completed;
          return t;
        }
      });
      this.save();
      return true;
    } catch(e){
      console.error(e);
      return false;
    }
  }
}

/* --------- UI Controller --------- */
const annotator = new Annotator();

const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const entryForm = $('#entryForm');
const typeSelect = $('#typeSelect');
const titleInput = $('#title');
const descriptionInput = $('#description');
const amountInput = $('#amount');
const dueDateInput = $('#dueDate');
const prioritySelect = $('#priority');
const itemsList = $('#itemsList');

const filterAll = $('#filterAll');
const filterBills = $('#filterBills');
const filterTasks = $('#filterTasks');
const exportBtn = $('#exportBtn');
const importBtn = $('#importBtn');
const fileInput = $('#fileInput');
const clearFormBtn = $('#clearForm');

let currentFilter = 'all';

function render() {
  itemsList.innerHTML = '';
  let items = annotator.items.slice().sort((a,b) => new Date(a.dueDate || a.createdAt) - new Date(b.dueDate || b.createdAt));
  if (currentFilter === 'bills') items = items.filter(i => i.hasOwnProperty('amount'));
  if (currentFilter === 'tasks') items = items.filter(i => !i.hasOwnProperty('amount'));

  if (items.length === 0) {
    itemsList.innerHTML = '<p class="muted">Nenhum item. Adicione uma conta ou tarefa.</p>';
    return;
  }

  items.forEach(it => {
    const div = document.createElement('div');
    div.className = 'item';
    div.style.borderLeftColor = it.priority === 'high' ? '#ef4444' : it.priority === 'medium' ? '#f59e0b' : '#10b981';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const h3 = document.createElement('h3');
    h3.textContent = it.title + (it.completed ? ' ✓' : '');
    meta.appendChild(h3);

    const p = document.createElement('p');
    const parts = [];
    if (it.description) parts.push(it.description);
    if (it.dueDate) parts.push('Prazo: ' + new Date(it.dueDate).toLocaleDateString());
    if (it.hasOwnProperty('amount')) parts.push('Valor: R$ ' + Number(it.amount).toFixed(2));
    parts.push('Prioridade: ' + it.priority);
    p.textContent = parts.join(' • ');
    meta.appendChild(p);

    const actions = document.createElement('div');
    actions.className = 'actions';

    const completeBtn = document.createElement('button');
    completeBtn.className = 'btn small';
    completeBtn.textContent = it.completed ? 'Desmarcar' : 'Concluir';
    completeBtn.addEventListener('click', () => {
      it.toggleComplete();
      if (it.hasOwnProperty('amount') && it.completed) it.paid = true;
      if (it.hasOwnProperty('amount') && !it.completed) it.paid = false;
      annotator.update(it);
      render();
    });

    const editBtn = document.createElement('button');
    editBtn.className = 'btn small';
    editBtn.textContent = 'Editar';
    editBtn.addEventListener('click', () => {
      typeSelect.value = it.hasOwnProperty('amount') ? 'bill' : 'task';
      titleInput.value = it.title;
      descriptionInput.value = it.description || '';
      dueDateInput.value = it.dueDate ? it.dueDate.split('T')[0] : '';
      prioritySelect.value = it.priority || 'medium';
      amountInput.value = it.hasOwnProperty('amount') ? it.amount : '';
      saveBtn.dataset.editId = it.id;
      window.scrollTo({top:0, behavior:'smooth'});
    });

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn delete small';
    deleteBtn.textContent = 'Remover';
    deleteBtn.addEventListener('click', () => {
      if (confirm('Remover este item?')) {
        annotator.remove(it.id);
        render();
      }
    });

    actions.appendChild(completeBtn);
    actions.appendChild(editBtn);
    if (it.hasOwnProperty('amount')) {
      const paidBtn = document.createElement('button');
      paidBtn.className = 'btn small';
      paidBtn.textContent = it.paid ? 'Pago' : 'Marcar pago';
      paidBtn.addEventListener('click', () => {
        if (it.paid) {
          it.markUnpaid();
        } else {
          it.markPaid();
        }
        annotator.update(it);
        render();
      });
      actions.appendChild(paidBtn);
    }
    actions.appendChild(deleteBtn);

    div.appendChild(meta);
    div.appendChild(actions);
    itemsList.appendChild(div);
  });
}

// Handle form
const saveBtn = $('#saveBtn');
entryForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const type = typeSelect.value;
  const title = titleInput.value.trim();
  if (!title) return alert('Título é obrigatório');

  const description = descriptionInput.value.trim();
  const dueDate = dueDateInput.value || null;
  const priority = prioritySelect.value || 'medium';
  const amount = amountInput.value ? parseFloat(amountInput.value) : 0;

  if (saveBtn.dataset.editId) {
    const id = saveBtn.dataset.editId;
    const existing = annotator.find(id);
    if (!existing) {
      alert('Item para editar não encontrado');
      delete saveBtn.dataset.editId;
      return;
    }
    existing.title = title;
    existing.description = description;
    existing.dueDate = dueDate;
    existing.priority = priority;
    if (type === 'bill') {
      if (!existing.hasOwnProperty('amount')) {
        // convert Task -> Bill
        const b = new Bill(existing.id, title, description, dueDate, priority, amount, existing.createdAt);
        annotator.items = annotator.items.map(i => i.id === existing.id ? b : i);
      } else {
        existing.amount = amount;
      }
    } else {
      if (existing.hasOwnProperty('amount')) {
        // convert Bill -> Task
        const t = new Task(existing.id, title, description, dueDate, priority, existing.createdAt);
        t.completed = existing.completed;
        annotator.items = annotator.items.map(i => i.id === existing.id ? t : i);
      }
    }
    annotator.save();
    delete saveBtn.dataset.editId;
    entryForm.reset();
    render();
    return;
  }

  if (type === 'bill') {
    const bill = new Bill(null, title, description, dueDate, priority, amount);
    annotator.add(bill);
  } else {
    const task = new Task(null, title, description, dueDate, priority);
    annotator.add(task);
  }

  entryForm.reset();
  render();
});

clearFormBtn.addEventListener('click', () => {
  entryForm.reset();
  delete saveBtn.dataset.editId;
});

// filters
filterAll.addEventListener('click', () => { currentFilter = 'all'; render(); });
filterBills.addEventListener('click', () => { currentFilter = 'bills'; render(); });
filterTasks.addEventListener('click', () => { currentFilter = 'tasks'; render(); });

// export / import
exportBtn.addEventListener('click', () => {
  const data = annotator.exportJSON();
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'annotador_export.json';
  a.click();
  URL.revokeObjectURL(url);
});

importBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const ok = annotator.importJSON(reader.result);
    if (ok) {
      alert('Importado com sucesso');
      render();
    } else alert('Erro ao importar');
  };
  reader.readAsText(file);
});

// initial render
render();
