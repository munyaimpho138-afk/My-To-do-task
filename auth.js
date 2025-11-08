// User management functions
class AuthManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('todoUsers')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        if (this.currentUser && window.location.pathname.endsWith('index.html')) {
            window.location.href = 'todo.html';
            return;
        }

        // Setup event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Form toggling
        document.getElementById('showSignup')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms();
        });

        document.getElementById('showLogin')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleForms();
        });

        // Form submissions
        document.getElementById('loginForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('signupForm')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSignup();
        });

        // Real-time password confirmation check
        document.getElementById('confirmPassword')?.addEventListener('input', (e) => {
            this.checkPasswordMatch();
        });
    }

    toggleForms() {
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const messageEl = document.getElementById('authMessage');
        
        loginForm.classList.toggle('active');
        signupForm.classList.toggle('active');
        messageEl.style.display = 'none'; // Clear any messages
    }

    checkPasswordMatch() {
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const messageEl = document.getElementById('authMessage');

        if (confirmPassword && password !== confirmPassword) {
            messageEl.textContent = 'Passwords do not match!';
            messageEl.className = 'auth-message error';
            messageEl.style.display = 'block';
            return false;
        } else if (confirmPassword && password === confirmPassword) {
            messageEl.textContent = 'Passwords match!';
            messageEl.className = 'auth-message success';
            messageEl.style.display = 'block';
            return true;
        }
        
        messageEl.style.display = 'none';
        return true;
    }

    handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const email = document.getElementById('signupEmail').value.trim().toLowerCase();
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validation
        if (!name || !email || !password) {
            this.showMessage('Please fill in all fields!', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match!', 'error');
            return;
        }

        if (password.length < 6) {
            this.showMessage('Password must be at least 6 characters long!', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            this.showMessage('Please enter a valid email address!', 'error');
            return;
        }

        // Check if user already exists
        if (this.users.find(user => user.email === email)) {
            this.showMessage('User with this email already exists!', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: password, // Store plain text for demo (NOT for production)
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers();

        this.showMessage('Account created successfully! Please login.', 'success');
        this.toggleForms();
        document.getElementById('signupForm').reset();
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value.trim().toLowerCase();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showMessage('Please fill in all fields!', 'error');
            return;
        }

        // For demo purposes: Direct password comparison
        // In production, you would hash the input password and compare with stored hash
        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = {
                id: user.id,
                name: user.name,
                email: user.email
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showMessage('Login successful! Redirecting...', 'success');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            this.showMessage('Invalid email or password!', 'error');
        }
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    saveUsers() {
        localStorage.setItem('todoUsers', JSON.stringify(this.users));
    }

    showMessage(message, type) {
        const messageEl = document.getElementById('authMessage');
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        messageEl.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                messageEl.style.display = 'none';
            }, 5000);
        }
    }
}

// Initialize auth manager
const authManager = new AuthManager();