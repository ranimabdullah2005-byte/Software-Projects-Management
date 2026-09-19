// تحديد العناصر
const modal = document.getElementById('task-modal');
const openModalBtn = document.getElementById('open-modal-btn');
const closeModalBtn = document.getElementById('close-modal-btn');
const taskForm = document.getElementById('add-task-form');
const todoList = document.getElementById('todo-list');
const pinkModal = document.getElementById('taskModal');
const editModal = document.getElementById('edit-task-modal');
const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
const editTaskForm = document.getElementById('edit-task-form');
let draggedCard = null;
let currentEditCard = null;

function openTaskModal() {
  if (modal) modal.style.display = 'flex';
}

function closeTaskModal() {
  if (modal) modal.style.display = 'none';
}

if (openModalBtn) {
  openModalBtn.addEventListener('click', openTaskModal);
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', closeTaskModal);
}

if (modal) {
  modal.addEventListener('click', (event) => {
    if (event.target === modal) closeTaskModal();
  });
}

function removeTaskCard(card) {
  if (!card) return;
  card.remove();
  saveBoardState();
}

function openEditTaskModal(card) {
  if (!card || !editModal) return;

  currentEditCard = card;
  const title = card.dataset.title || card.querySelector('.task-title')?.textContent?.replace(/ ✨$/, '') || '';
  const desc = card.dataset.description || card.querySelector('.task-desc')?.textContent || '';
  const assignee = card.dataset.assignee || card.querySelector('.task-assignee')?.textContent?.replace('👑 المسؤولة: ', '') || '';

  document.getElementById('edit-task-title').value = title;
  document.getElementById('edit-task-desc').value = desc;
  document.getElementById('edit-task-assignee').value = assignee;
  editModal.style.display = 'flex';
}

function closeEditTaskModal() {
  if (editModal) editModal.style.display = 'none';
  currentEditCard = null;
}

if (closeEditModalBtn) {
  closeEditModalBtn.addEventListener('click', closeEditTaskModal);
}

if (editModal) {
  editModal.addEventListener('click', (event) => {
    if (event.target === editModal) closeEditTaskModal();
  });
}

if (editTaskForm) {
  editTaskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!currentEditCard) return;

    const newTitle = document.getElementById('edit-task-title').value.trim();
    const newDesc = document.getElementById('edit-task-desc').value.trim();
    const newAssignee = document.getElementById('edit-task-assignee').value.trim();

    if (!newTitle || !newAssignee) {
      alert('يرجى إدخال عنوان المهمة واسم المسؤولة 🌸');
      return;
    }

    currentEditCard.dataset.title = newTitle;
    currentEditCard.dataset.description = newDesc;
    currentEditCard.dataset.assignee = newAssignee;

    const titleEl = currentEditCard.querySelector('.task-title');
    const descEl = currentEditCard.querySelector('.task-desc');
    const assigneeEl = currentEditCard.querySelector('.task-assignee');

    if (titleEl) titleEl.textContent = `${newTitle} ✨`;
    if (descEl) descEl.textContent = newDesc || 'لا يوجد وصف';
    if (assigneeEl) assigneeEl.textContent = `👑 المسؤولة: ${newAssignee}`;

    saveBoardState();
    closeEditTaskModal();
  });
}

function attachCardDragHandlers(card) {
  card.style.touchAction = 'none';

  const deleteBtn = card.querySelector('.delete-btn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => removeTaskCard(card));
  }

  card.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.delete-btn')) return;

    draggedCard = card;
    card.classList.add('dragging');

    const ghost = card.cloneNode(true);
    ghost.classList.add('drag-ghost');
    ghost.style.width = `${card.offsetWidth}px`;
    document.body.appendChild(ghost);

    const moveGhost = (moveEvent) => {
      ghost.style.left = `${moveEvent.clientX + 10}px`;
      ghost.style.top = `${moveEvent.clientY + 10}px`;

      const lists = [...document.querySelectorAll('.task-list')];
      const hoveredList = lists.find((list) => {
        const rect = list.getBoundingClientRect();
        return moveEvent.clientX >= rect.left &&
          moveEvent.clientX <= rect.right &&
          moveEvent.clientY >= rect.top &&
          moveEvent.clientY <= rect.bottom;
      });

      document.querySelectorAll('.task-list').forEach((item) => item.classList.remove('drag-over'));

      if (hoveredList) {
        hoveredList.classList.add('drag-over');

        const cards = [...hoveredList.querySelectorAll('.task-card:not(.dragging)')];
        let targetCard = null;

        for (const item of cards) {
          const rect = item.getBoundingClientRect();
          if (moveEvent.clientY < rect.top + rect.height / 2) {
            targetCard = item;
            break;
          }
        }

        if (targetCard) {
          hoveredList.insertBefore(card, targetCard);
        } else {
          hoveredList.appendChild(card);
        }
      }
    };

    const stopDragging = () => {
      document.removeEventListener('pointermove', moveGhost);
      document.removeEventListener('pointerup', stopDragging);
      ghost.remove();
      card.classList.remove('dragging');
      document.querySelectorAll('.task-list').forEach((item) => item.classList.remove('drag-over'));
      saveBoardState();
      draggedCard = null;
    };

    document.addEventListener('pointermove', moveGhost);
    document.addEventListener('pointerup', stopDragging);
  });
}

function createTaskCard(title, description, assignee = 'غير محددة') {
  const card = document.createElement('div');
  card.className = 'task-card';
  card.dataset.title = title;
  card.dataset.description = description;
  card.dataset.assignee = assignee;

  const cardTitle = document.createElement('h3');
  cardTitle.className = 'task-title';
  cardTitle.textContent = `${title} ✨`;

  const cardDesc = document.createElement('p');
  cardDesc.className = 'task-desc';
  cardDesc.textContent = description || 'لا يوجد وصف';

  const meta = document.createElement('div');
  meta.className = 'task-meta';

  const assigneeText = document.createElement('span');
  assigneeText.className = 'task-assignee';
  assigneeText.textContent = `👑 المسؤولة: ${assignee}`;

  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'edit-btn';
  editBtn.type = 'button';
  editBtn.title = 'تعديل المهمة';
  editBtn.textContent = '✏️';
  editBtn.addEventListener('click', () => openEditTaskModal(card));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.type = 'button';
  deleteBtn.title = 'حذف المهمة';
  deleteBtn.textContent = '🗑️';
  deleteBtn.addEventListener('click', () => removeTaskCard(card));

  actions.appendChild(editBtn);
  actions.appendChild(deleteBtn);

  meta.appendChild(assigneeText);
  meta.appendChild(actions);

  card.appendChild(cardTitle);
  card.appendChild(cardDesc);
  card.appendChild(meta);

  attachCardDragHandlers(card);
  return card;
}

function initExistingCards() {
  document.querySelectorAll('.task-card').forEach((card) => {
    attachCardDragHandlers(card);
  });
}

function saveBoardState() {
  const boardData = {};

  document.querySelectorAll('.task-list').forEach((list) => {
    const key = list.id;
    boardData[key] = Array.from(list.querySelectorAll('.task-card')).map((card) => ({
      title: card.dataset.title || card.querySelector('.task-title')?.textContent?.replace(/ ✨$/, '') || '',
      description: card.dataset.description || card.querySelector('.task-desc')?.textContent || '',
      assignee: card.dataset.assignee || card.querySelector('.task-assignee')?.textContent?.replace('👑 المسؤولة: ', '') || 'غير محددة'
    }));
  });

  localStorage.setItem('pinkKanbanBoard', JSON.stringify(boardData));
}

function moveTaskCard(card, targetList, targetCard = null) {
  if (!card || !targetList) return false;

  if (targetCard && targetCard.parentElement === targetList) {
    targetList.insertBefore(card, targetCard);
  } else {
    targetList.appendChild(card);
  }

  saveBoardState();
  return true;
}

function getDragAfterElement(list, y) {
  const cards = [...list.querySelectorAll('.task-card:not(.dragging)')];

  return cards.reduce((closest, currentCard) => {
    const box = currentCard.getBoundingClientRect();
    const offset = y - (box.top + box.height / 2);

    if (offset < 0 && offset > closest.offset) {
      return { offset, element: currentCard };
    }

    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function setupDropZones() {
  const lists = document.querySelectorAll('.task-list');

  lists.forEach((list) => {
    list.addEventListener('dragover', (event) => {
      event.preventDefault();
      list.classList.add('drag-over');
    });

    list.addEventListener('dragleave', () => {
      list.classList.remove('drag-over');
    });

    list.addEventListener('drop', (event) => {
      event.preventDefault();
      list.classList.remove('drag-over');

      if (!draggedCard) return;

      const afterElement = getDragAfterElement(list, event.clientY);
      if (afterElement == null) {
        list.appendChild(draggedCard);
      } else {
        list.insertBefore(draggedCard, afterElement);
      }

      saveBoardState();
      draggedCard = null;
    });
  });
}

if (taskForm) {
  taskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const titleInput = document.getElementById('task-title-input');
    const descInput = document.getElementById('task-desc-input');
    const assigneeInput = document.getElementById('task-assignee-input');

    const title = titleInput.value.trim();
    const description = descInput.value.trim();
    const assignee = assigneeInput.value.trim();

    if (!title || !assignee) {
      alert('يرجى إدخال عنوان المهمة واسم المسؤولة 🌸');
      return;
    }

    if (todoList) {
      todoList.appendChild(createTaskCard(title, description, assignee));
      saveBoardState();
    }

    taskForm.reset();
    closeTaskModal();
  });
}

function openModal() {
  if (pinkModal) pinkModal.style.display = 'block';
}

function closeModal() {
  if (pinkModal) pinkModal.style.display = 'none';
}

window.openModal = openModal;
window.closeModal = closeModal;
window.moveTaskCard = moveTaskCard;

function addNewTask() {
  const titleInput = document.getElementById('taskTitle');
  const descInput = document.getElementById('taskDesc');

  if (!titleInput || !descInput) return;

  const title = titleInput.value.trim();
  const description = descInput.value.trim();

  if (!title) {
    alert('يا حلوة مكتبي اسم المهمة أولاً! 🌸');
    return;
  }

  const targetList = document.getElementById('todo-list') || document.getElementById('todo-column');
  if (targetList) {
    targetList.appendChild(createTaskCard(title, description, 'مسؤولة غير محددة'));
    saveBoardState();
  }

  closeModal();
  titleInput.value = '';
  descInput.value = '';
}

if (pinkModal) {
  pinkModal.addEventListener('click', (event) => {
    if (event.target === pinkModal) closeModal();
  });
}

setupDropZones();
initExistingCards();

const savedData = JSON.parse(localStorage.getItem('pinkKanbanBoard') || 'null');

if (savedData) {
  document.querySelectorAll('.task-list').forEach((list) => {
    list.innerHTML = '';
  });

  Object.entries(savedData).forEach(([listId, tasks]) => {
    const list = document.getElementById(listId);
    if (!list) return;

    tasks.forEach((task) => {
      const card = createTaskCard(task.title, task.description, task.assignee || 'غير محددة');
      list.appendChild(card);
    });
  });
} else {
  saveBoardState();
}

window.addEventListener('beforeunload', saveBoardState);