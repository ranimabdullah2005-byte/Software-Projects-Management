// تحديد العناصر
const modal = document.getElementById('task-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const taskForm = document.getElementById('add-task-form');
const todoList = document.getElementById('todo-list');

// فتح وإغلاق النافذة
openModalBtn.onclick = () => modal.style.display = 'flex';
closeModalBtn.onclick = () => modal.style.display = 'none';

// إضافة مهمة جديدة عند تقديم النموذج
taskForm.onsubmit = function (e) {
  e.preventDefault();

  const title = document.getElementById('task-title-input').value;
  const desc = document.getElementById('task-desc-input').value;
  const assignee = document.getElementById('task-assignee-input').value;

  // إنشاء بطاقة جديدة
  const card = document.createElement('div');
  card.className = 'task-card';
  card.innerHTML = `
    <h3 class="task-title">${title} ✨</h3>
    <p class="task-desc">${desc}</p>
    <div class="task-meta">
      <span class="task-assignee">👑 المسؤولة: ${assignee}</span>
      <button class="delete-btn" onclick="this.parentElement.parentElement.remove()">حذف 🗑️</button>
    </div>
  `;

  todoList.appendChild(card);
  taskForm.reset();
  modal.style.display = 'none';
};