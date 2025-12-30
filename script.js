/* ===== DOM ELEMENTS ===== */
const addTaskBtn = document.querySelector("#add-task-btn");
const taskForm = document.querySelector("#task-form");
const formTitle = document.querySelector("#form-title");
const taskTitleInput = document.querySelector("#task-title");
const taskDescInput = document.querySelector("#task-desc");
const taskDateInput = document.querySelector("#task-date");
const saveTaskBtn = document.querySelector("#save-task");
const cancelTaskBtn = document.querySelector("#cancel-task");

const searchInput = document.querySelector("#search-input");
const statusFilter = document.querySelector("#status-filter");

const taskList = document.querySelector("#task-list");

const viewModal = document.querySelector("#view-modal");
const viewDesc = document.querySelector("#view-desc");
const closeViewBtn = document.querySelector("#close-view");

/* ===== STATE ===== */
let editTaskId = null;
let dragTaskId = null;

/* ===== HELPERS ===== */
function getAllTasks() {
  const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  return Array.isArray(tasks) ? tasks : [];
}

function resetForm() {
  taskTitleInput.value = "";
  taskDescInput.value = "";
  taskDateInput.value = "";
  editTaskId = null;
  formTitle.textContent = "Add New Task";
  saveTaskBtn.textContent = "Save Task";
}

/* ===== RENDER ===== */
function handleParse(tasks) {
  taskList.innerHTML = "";
  if (!tasks.length) return;

  tasks.forEach(task => {
    taskList.innerHTML += `
      <div class="task-item flex justify-between p-4 bg-slate-900/70 rounded-xl"
           data-id="${task.id}" draggable="true">

        <div class="flex gap-3">
          <input type="checkbox" class="task-check"
            ${task.completed ? "checked" : ""} />

          <div>
            <h3 class="${task.completed ? "line-through text-slate-400" : ""}">
              ${task.title}
            </h3>
            <p class="text-sm text-slate-400">${task.desc || ""}</p>
            <span class="text-xs text-indigo-400">${task.date || ""}</span>
          </div>
        </div>

        <div class="flex gap-2">
          <button class="task-edit">✏️</button>
          <button class="task-delete">🗑️</button>
          <button class="task-view">👁️</button>
        </div>
      </div>
    `;
  });
}

/* ===== INIT ===== */
handleParse(getAllTasks());

/* ===== ADD / EDIT ===== */
addTaskBtn.addEventListener("click", () => {
  taskForm.classList.toggle("hidden");
});

cancelTaskBtn.addEventListener("click", () => {
  taskForm.classList.add("hidden");
  resetForm();
});

saveTaskBtn.addEventListener("click", e => {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  if (!title) return;

  let tasks = getAllTasks();

  if (editTaskId) {
    const task = tasks.find(t => t.id === editTaskId);
    if (!task) return;

    task.title = title;
    task.desc = taskDescInput.value.trim();
    task.date = taskDateInput.value;
  } else {
    tasks.push({
      id: Date.now(),
      title,
      desc: taskDescInput.value.trim(),
      date: taskDateInput.value,
      completed: false
    });
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  taskForm.classList.add("hidden");
  resetForm();
  handleParse(tasks);
});

/* ===== TASK ACTIONS ===== */
taskList.addEventListener("click", e => {
  const taskItem = e.target.closest(".task-item");
  if (!taskItem) return;

  const taskId = Number(taskItem.dataset.id);
  let tasks = getAllTasks();

  // VIEW
  if (e.target.classList.contains("task-view")) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    viewDesc.textContent = task.desc || "No description";
    viewModal.classList.remove("hidden");
  }

  // EDIT
  if (e.target.classList.contains("task-edit")) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editTaskId = task.id;
    taskTitleInput.value = task.title;
    taskDescInput.value = task.desc;
    taskDateInput.value = task.date;

    formTitle.textContent = "Edit Task";
    saveTaskBtn.textContent = "Update Task";
    taskForm.classList.remove("hidden");
  }

  // DELETE
  if (e.target.classList.contains("task-delete")) {
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem("tasks", JSON.stringify(tasks));
    handleParse(tasks);
  }
});

/* ===== CHECKBOX ===== */
taskList.addEventListener("change", e => {
  if (!e.target.classList.contains("task-check")) return;

  const taskId = Number(e.target.closest(".task-item").dataset.id);
  const tasks = getAllTasks();

  const task = tasks.find(t => t.id === taskId);
  if (!task) return;

  task.completed = !task.completed;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  handleParse(tasks);
});

/* ===== VIEW MODAL ===== */
closeViewBtn.addEventListener("click", () => {
  viewModal.classList.add("hidden");
});

/* ===== SEARCH + FILTER ===== */
searchInput.addEventListener("input", applyFilters);
statusFilter.addEventListener("change", applyFilters);

function applyFilters() {
  let tasks = getAllTasks();
  const q = searchInput.value.toLowerCase();
  const status = statusFilter.value;

  if (q) {
    tasks = tasks.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q)
    );
  }

  if (status === "completed") {
    tasks = tasks.filter(t => t.completed);
  }

  if (status === "pending") {
    tasks = tasks.filter(t => !t.completed);
  }

  handleParse(tasks);
}

/* ===== DRAG & DROP ===== */
taskList.addEventListener("dragstart", e => {
  const taskItem = e.target.closest(".task-item");
  if (!taskItem) return;
  dragTaskId = taskItem.dataset.id;
});

taskList.addEventListener("dragover", e => {
  e.preventDefault();
});

taskList.addEventListener("drop", e => {
  const targetItem = e.target.closest(".task-item");
  if (!targetItem || !dragTaskId) return;

  const targetId = targetItem.dataset.id;
  if (dragTaskId === targetId) return;

  let tasks = getAllTasks();

  const fromIndex = tasks.findIndex(t => String(t.id) === String(dragTaskId));
  const toIndex = tasks.findIndex(t => String(t.id) === String(targetId));

  if (fromIndex === -1 || toIndex === -1) return;

  const [movedTask] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, movedTask);

  localStorage.setItem("tasks", JSON.stringify(tasks));
  handleParse(tasks);
  dragTaskId = null;
});
