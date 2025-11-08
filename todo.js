class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        // Check authentication
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Update UI with user info
        this.updateUserInfo(currentUser);

        // Load tasks
        this.loadTasks();

        // Setup event listeners
        this.setupEventListeners();

        // Update stats
        this.updateStats();
    }

    updateUserInfo(user) {
        const welcomeElement = document.getElementById('userWelcome');
        if (welcomeElement) {
            welcomeElement.textContent = `Welcome, ${user.name}!`;
        }
    }

    setupEventListeners() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.addTask();
        });

        // Enter key in task input
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });
    }

    addTask() {
        const input = document.getElementById('taskInput');
        const date = document.getElementById('taskDate');
        const time = document.getElementById('taskTime');
        const priority = document.getElementById('taskPriority');

        const taskText = input.value.trim();
        
        if (!taskText) {
            alert('Please enter a task!');
            return;
        }

        const task = {
            id: Date.now().toString(),
            text: taskText,
            date: date.value,
            time: time.value,
            priority: priority.value,
            completed: false,
            createdAt: new Date().toISOString(),
            userId: JSON.parse(localStorage.getItem('currentUser')).id
        };

        this.tasks.unshift(task); // Add to beginning
        this.saveTasks();
        this.renderTasks();
        this.updateStats();

        // Clear inputs
        input.value = '';
        date.value = '';
        time.value = '';
        priority.value = 'medium';
        input.focus();
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    toggleTaskCompletion(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'high':
                return this.tasks.filter(task => task.priority === 'high');
            default:
                return this.tasks;
        }
    }

    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks found</h3>
                    <p>${this.currentFilter === 'all' ? 'Add your first task above!' : 'No tasks match the current filter'}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority">
                <input 
                    type="checkbox" 
                    class="task-checkbox" 
                    ${task.completed ? 'checked' : ''}
                    onchange="todoApp.toggleTaskCompletion('${task.id}')"
                >
                <div class="task-content">
                    <span class="task-text">${task.text}</span>
                    <div class="task-details">
                        ${task.date ? `<span><i class="far fa-calendar"></i> ${this.formatDate(task.date)}</span>` : ''}
                        ${task.time ? `<span><i class="far fa-clock"></i> ${task.time}</span>` : ''}
                        <span class="task-priority priority-${task.priority}">
                            ${task.priority} priority
                        </span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="todoApp.deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const pendingTasks = this.tasks.filter(task => !task.completed).length;
        const completedTasks = this.tasks.filter(task => task.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
    }

    loadTasks() {
        const savedTasks = localStorage.getItem('todoTasks');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (savedTasks) {
            const allTasks = JSON.parse(savedTasks);
            // Only load tasks for current user
            this.tasks = allTasks.filter(task => task.userId === currentUser.id);
        }
        
        this.renderTasks();
    }

    saveTasks() {
        // Get all tasks from localStorage
        const allTasks = JSON.parse(localStorage.getItem('todoTasks')) || [];
        
        // Remove current user's tasks
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const otherUsersTasks = allTasks.filter(task => task.userId !== currentUser.id);
        
        // Combine other users' tasks with current user's tasks
        const updatedTasks = [...otherUsersTasks, ...this.tasks];
        
        localStorage.setItem('todoTasks', JSON.stringify(updatedTasks));
    }

    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

// Initialize the app
const todoApp = new TodoApp();

// Make it globally available for onclick handlers
window.todoApp = todoApp;