const API = '/api/books';
const $ = (id) => document.getElementById(id);

let editingId = null;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => (
    {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]
));

// 2026-10-09 -> 09.10.2026
const fmt = (iso) => (iso ? iso.split('-').reverse().join('.') : '');

/* ---------- Таблица ---------- */

async function loadBooks() {
    const map = {
        id: 'f-id', title: 'f-title', publisher: 'f-publisher', student: 'f-student',
        from: 'f-from', to: 'f-to', returned: 'f-returned', order: 'f-order'
    };
    const params = new URLSearchParams();
    for (const [name, elId] of Object.entries(map)) {
        const value = $(elId).value.trim();
        if (value) params.set(name, value);
    }

    const res = await fetch(`${API}?${params}`);
    if (!res.ok) {
        alert('Не удалось загрузить список книг');
        return;
    }
    renderTable(await res.json());
}

function renderTable(books) {
    // Поле издателя называется кириллицей: book.издатель
    $('tbody').innerHTML = books.map((book) => `
        <tr>
            <td>${book.id}</td>
            <td>${esc(book.title)}</td>
            <td>${esc(book.издатель)}</td>
            <td>${fmt(book.issueDate)}</td>
            <td>${esc(book.studentName)}</td>
            <td>${fmt(book.returnDate)}</td>
            <td class="actions">
                <button class="small" data-action="edit" data-id="${book.id}">Изменить</button>
                <button class="small danger" data-action="delete" data-id="${book.id}">Удалить</button>
            </td>
        </tr>`).join('');

    // Счётчик книг в таблице (JavaScript): считаем строки таблицы
    $('counter').textContent = $('tbody').rows.length;
}

$('tbody').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.action === 'edit') startEdit(btn.dataset.id);
    if (btn.dataset.action === 'delete') removeBook(btn.dataset.id);
});

/* ---------- Добавление / редактирование / удаление ---------- */

async function startEdit(id) {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) {
        alert('Книга не найдена');
        return;
    }
    const book = await res.json();
    editingId = book.id;
    $('b-title').value = book.title ?? '';
    $('b-publisher').value = book.издатель ?? '';
    $('b-issue').value = book.issueDate ?? '';
    $('b-student').value = book.studentName ?? '';
    $('b-return').value = book.returnDate ?? '';
    $('form-title').textContent = `Редактирование книги #${book.id}`;
    $('cancel-btn').hidden = false;
    window.scrollTo({top: 0, behavior: 'smooth'});
}

function resetForm() {
    editingId = null;
    $('book-form').reset();
    $('form-title').textContent = 'Добавить книгу';
    $('cancel-btn').hidden = true;
}

$('cancel-btn').addEventListener('click', resetForm);

$('book-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const body = {
        title: $('b-title').value.trim(),
        издатель: $('b-publisher').value.trim() || null,
        issueDate: $('b-issue').value || null,
        studentName: $('b-student').value.trim() || null,
        returnDate: $('b-return').value || null
    };

    const res = await fetch(editingId ? `${API}/${editingId}` : API, {
        method: editingId ? 'PUT' : 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body)
    });

    if (!res.ok) {
        alert('Не удалось сохранить книгу. Проверьте поля «Название» и «Дата выдачи».');
        return;
    }
    resetForm();
    refresh();
});

async function removeBook(id) {
    if (!confirm(`Удалить книгу #${id}?`)) return;
    const res = await fetch(`${API}/${id}`, {method: 'DELETE'});
    if (!res.ok) {
        alert('Не удалось удалить книгу');
        return;
    }
    refresh();
}

/* ---------- Поиск / фильтр ---------- */

$('filter-form').addEventListener('submit', (e) => {
    e.preventDefault();
    loadBooks();
});

$('reset-btn').addEventListener('click', () => {
    $('filter-form').reset();
    loadBooks();
});

/* ---------- Гистограмма (30 дней) ---------- */

async function loadHistogram() {
    const res = await fetch(`${API}/histogram?days=30`);
    if (!res.ok) return;
    drawHistogram(await res.json());
}

function drawHistogram(data) {
    const canvas = $('histogram');
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const m = {left: 40, right: 12, top: 22, bottom: 42};
    const plotW = W - m.left - m.right;
    const plotH = H - m.top - m.bottom;

    ctx.clearRect(0, 0, W, H);

    const max = Math.max(1, ...data.map((d) => d.count));
    const step = plotW / data.length;
    const barW = step * 0.7;
    ctx.font = '11px Segoe UI, Arial, sans-serif';

    // сетка и подписи оси Y (целые числа)
    const ticks = Math.min(max, 5);
    for (let i = 0; i <= ticks; i++) {
        const value = Math.round((max * i) / ticks);
        const y = m.top + plotH - (plotH * value) / max;
        ctx.strokeStyle = '#e5e7eb';
        ctx.beginPath();
        ctx.moveTo(m.left, y);
        ctx.lineTo(W - m.right, y);
        ctx.stroke();
        ctx.fillStyle = '#374151';
        ctx.textAlign = 'right';
        ctx.fillText(String(value), m.left - 6, y + 4);
    }

    // оси
    ctx.strokeStyle = '#6b7280';
    ctx.beginPath();
    ctx.moveTo(m.left, m.top);
    ctx.lineTo(m.left, m.top + plotH);
    ctx.lineTo(W - m.right, m.top + plotH);
    ctx.stroke();

    // столбцы
    data.forEach((d, i) => {
        const h = (plotH * d.count) / max;
        const x = m.left + i * step + (step - barW) / 2;
        const y = m.top + plotH - h;

        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(x, y, barW, h);

        if (d.count > 0) {
            ctx.fillStyle = '#111827';
            ctx.textAlign = 'center';
            ctx.fillText(String(d.count), x + barW / 2, y - 4);
        }
        if (i % 2 === 0 || i === data.length - 1) {
            ctx.fillStyle = '#374151';
            ctx.textAlign = 'center';
            ctx.fillText(`${d.date.slice(8, 10)}.${d.date.slice(5, 7)}`, x + barW / 2, m.top + plotH + 16);
        }
    });
}

/* ---------- Старт ---------- */

function refresh() {
    loadBooks();
    loadHistogram();
}

refresh();
