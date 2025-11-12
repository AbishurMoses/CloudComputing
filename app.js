// App State
let todos = [];
let currentFilter = 'all';
let editingTodoId = null;

// DOM Elements
const todoTitleInput = document.getElementById('todoTitle');
const todoContentInput = document.getElementById('todoContent');
const todoCategorySelect = document.getElementById('todoCategory');
const addTodoBtn = document.getElementById('addTodoBtn');
const todosContainer = document.getElementById('todosContainer');
const emptyState = document.getElementById('emptyState');
const searchBtn = document.getElementById('searchBtn');
const searchContainer = document.getElementById('searchContainer');
const searchInput = document.getElementById('searchInput');
const cancelSearchBtn = document.getElementById('cancelSearch');
const themeToggleBtn = document.getElementById('themeToggle');
const categoryBtns = document.querySelectorAll('.category-btn');

// Modal Elements
const editModal = document.getElementById('editModal');
const closeModalBtn = document.getElementById('closeModal');
const cancelEditBtn = document.getElementById('cancelEdit');
const saveEditBtn = document.getElementById('saveEdit');
const editTitleInput = document.getElementById('editTitle');
const editContentInput = document.getElementById('editContent');
const editCategorySelect = document.getElementById('editCategory');

// Initialize App
function init() {
    loadTodos();
    renderTodos();
    loadTheme();
    attachEventListeners();
}

// Load todos from localStorage
function loadTodos() {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
        todos = JSON.parse(savedTodos);
    }
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Load theme preference
function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Toggle theme
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Create a new todo
function createTodo() {
    const title = todoTitleInput.value.trim();
    const content = todoContentInput.value.trim();
    const category = todoCategorySelect.value;

    if (!title && !content) {
        alert('Please enter a title or content for your note.');
        return;
    }

    const todo = {
        id: Date.now(),
        title: title || 'Untitled',
        content: content,
        category: category,
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    todos.unshift(todo);
    saveTodos();
    renderTodos();

    // Clear inputs
    todoTitleInput.value = '';
    todoContentInput.value = '';
    todoCategorySelect.value = 'personal';
}

// Render todos
function renderTodos() {
    const filteredTodos = filterTodos();
    
    if (filteredTodos.length === 0) {
        todosContainer.innerHTML = '';
        emptyState.classList.add('show');
        return;
    }

    emptyState.classList.remove('show');
    todosContainer.innerHTML = filteredTodos.map(todo => createTodoCard(todo)).join('');
}

// Create todo card HTML
function createTodoCard(todo) {
    const createdDate = new Date(todo.createdAt).toLocaleDateString();
    
    return `
        <div class="todo-card ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
            <div class="todo-header">
                <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
                <div class="todo-actions">
                    <button class="btn-icon complete-btn" onclick="toggleComplete(${todo.id})" aria-label="Toggle complete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            ${todo.completed 
                                ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>' 
                                : '<circle cx="12" cy="12" r="10"></circle>'}
                        </svg>
                    </button>
                    <button class="btn-icon delete-btn" onclick="deleteTodo(${todo.id})" aria-label="Delete">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <p class="todo-content">${escapeHtml(todo.content)}</p>
            <div class="todo-meta">
                <span class="todo-category category-${todo.category}">${todo.category}</span>
                <span class="todo-date">${createdDate}</span>
            </div>
        </div>
    `;
}

// Filter todos based on category and search
function filterTodos() {
    let filtered = todos;

    // Filter by category
    if (currentFilter !== 'all') {
        filtered = filtered.filter(todo => todo.category === currentFilter);
    }

    // Filter by search
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filtered = filtered.filter(todo => 
            todo.title.toLowerCase().includes(searchTerm) || 
            todo.content.toLowerCase().includes(searchTerm)
        );
    }

    return filtered;
}

// Toggle todo completion
function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        todo.updatedAt = new Date().toISOString();
        saveTodos();
        renderTodos();
    }
}

// Delete todo
function deleteTodo(id) {
    if (confirm('Are you sure you want to delete this note?')) {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }
}

// Open edit modal
function openEditModal(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        editingTodoId = id;
        editTitleInput.value = todo.title;
        editContentInput.value = todo.content;
        editCategorySelect.value = todo.category;
        editModal.classList.add('active');
    }
}

// Close edit modal
function closeEditModal() {
    editingTodoId = null;
    editModal.classList.remove('active');
    editTitleInput.value = '';
    editContentInput.value = '';
}

// Save edited todo
function saveEdit() {
    if (editingTodoId === null) return;

    const todo = todos.find(t => t.id === editingTodoId);
    if (todo) {
        todo.title = editTitleInput.value.trim() || 'Untitled';
        todo.content = editContentInput.value.trim();
        todo.category = editCategorySelect.value;
        todo.updatedAt = new Date().toISOString();
        
        saveTodos();
        renderTodos();
        closeEditModal();
    }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Attach event listeners
function attachEventListeners() {
    // Add todo
    addTodoBtn.addEventListener('click', createTodo);
    
    // Enter key to add todo
    todoTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            createTodo();
        }
    });

    // Theme toggle
    themeToggleBtn.addEventListener('click', toggleTheme);

    // Search functionality
    searchBtn.addEventListener('click', () => {
        searchContainer.classList.add('active');
        searchInput.focus();
    });

    cancelSearchBtn.addEventListener('click', () => {
        searchContainer.classList.remove('active');
        searchInput.value = '';
        renderTodos();
    });

    searchInput.addEventListener('input', renderTodos);

    // Category filters
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            categoryBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-category');
            renderTodos();
        });
    });

    // Todo card click to edit
    todosContainer.addEventListener('click', (e) => {
        const todoCard = e.target.closest('.todo-card');
        if (todoCard && !e.target.closest('.todo-actions')) {
            const id = parseInt(todoCard.getAttribute('data-id'));
            openEditModal(id);
        }
    });

    // Modal events
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);
    saveEditBtn.addEventListener('click', saveEdit);

    // Close modal on background click
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Cmd/Ctrl + K for search
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            searchContainer.classList.add('active');
            searchInput.focus();
        }

        // Escape to close modal or search
        if (e.key === 'Escape') {
            if (editModal.classList.contains('active')) {
                closeEditModal();
            } else if (searchContainer.classList.contains('active')) {
                searchContainer.classList.remove('active');
                searchInput.value = '';
                renderTodos();
            }
        }
    });

    // Auto-resize textarea
    todoContentInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });

    editContentInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);