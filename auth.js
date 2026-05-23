
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authButtons = document.querySelector('.auth-buttons');

    const getUsers = () => {
        try {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            return Array.isArray(users) ? users : [];
        } catch (error) {
            localStorage.setItem('users', JSON.stringify([]));
            return [];
        }
    };

    const saveUsers = (users) => {
        localStorage.setItem('users', JSON.stringify(users));
    };

    const setCurrentUser = (user) => {
        const safeUser = { ...user };
        localStorage.setItem('loggedInUser', JSON.stringify(safeUser));
        localStorage.setItem('currentUser', JSON.stringify(safeUser));
    };

    const getCurrentUser = () => {
        try {
            return JSON.parse(localStorage.getItem('loggedInUser')) || JSON.parse(localStorage.getItem('currentUser'));
        } catch (error) {
            localStorage.removeItem('loggedInUser');
            localStorage.removeItem('currentUser');
            return null;
        }
    };

    // Check login status on page load
    if (getCurrentUser()) {
        updateNavForLoggedInUser();
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }

    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSignup();
        });
    }

    // Password visibility toggle
    // (Guarded to avoid runtime crashes if HTML structure changes)
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', () => {
            // Use robust lookup: try explicit data-target-id, else look for sibling inputs
            const passwordInput =
                (toggle.dataset && toggle.dataset.targetId ? document.getElementById(toggle.dataset.targetId) : null) ||
                toggle.previousElementSibling ||
                toggle.parentElement && toggle.parentElement.querySelector('input[type="password"], input[type="text"]');

            if (!passwordInput || !passwordInput.type) return;

            if (passwordInput.type === 'password') {

                passwordInput.type = 'text';
                toggle.classList.remove('fa-eye-slash');
                toggle.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                toggle.classList.remove('fa-eye');
                toggle.classList.add('fa-eye-slash');
            }
        });
    });


    function handleLogin() {
        clearErrors(loginForm);
        const email = (document.getElementById('login-email').value || '').trim().toLowerCase();
        const password = (document.getElementById('login-password').value || '').trim();
        const users = getUsers();
        const user = users.find(u => (u.email || '').toLowerCase() === email && u.password === password);

        if (user) {
            setCurrentUser(user);
            window.location.href = 'index.html';
        } else {
            showError(document.getElementById('login-password'), 'Invalid email or password');
        }
    }

    function handleSignup() {
        clearErrors(signupForm);
        const name = (document.getElementById('signup-name').value || '').trim();
        const email = (document.getElementById('signup-email').value || '').trim().toLowerCase();
        const password = (document.getElementById('signup-password').value || '').trim();
        const confirmPassword = (document.getElementById('confirm-password').value || '').trim();

        if (!validateSignup(name, email, password, confirmPassword)) {
            return;
        }

        const users = getUsers();
        if (users.some(u => (u.email || '').toLowerCase() === email)) {
            showError(document.getElementById('signup-email'), 'Email already exists');
            return;
        }

        const newUser = { id: `${Date.now()}`, name, email, password, loyaltyPoints: 0 }; // Add ID for dashboard specs
        users.push(newUser);
        saveUsers(users);
        setCurrentUser(newUser);
        window.location.href = 'index.html';
    }

    function validateSignup(name, email, password, confirmPassword) {
        let isValid = true;
        // Name validation
        if (!name) {
            showError(document.getElementById('signup-name'), 'Name is required');
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError(document.getElementById('signup-email'), 'Invalid email format');
            isValid = false;
        }

        // Password validation
        if (password.length < 6) {
            showError(document.getElementById('signup-password'), 'Password must be at least 6 characters');
            isValid = false;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            showError(document.getElementById('confirm-password'), 'Passwords do not match');
            isValid = false;
        }

        return isValid;
    }

    function showError(input, message) {
        if (!input) return;
        const formGroup = input.parentElement;
        const errorContainer = formGroup && formGroup.querySelector
            ? formGroup.querySelector('.error-message')
            : null;

        if (errorContainer) {
            formGroup.classList.add('error');
            errorContainer.textContent = message;
        }
    }

    function clearErrors(form) {
        if (!form) return;
        form.querySelectorAll('.form-group').forEach(group => {
            group.classList.remove('error');
            const err = group.querySelector('.error-message');
            if (err) err.textContent = '';
        });
    }


    function updateNavForLoggedInUser() {
        const user = getCurrentUser();
        if (user && authButtons) {
            authButtons.innerHTML = `
                <span class="welcome-message">Welcome, ${user.name}</span>
                <button id="logout-btn" class="btn">Logout</button>
            `;
            document.getElementById('logout-btn').addEventListener('click', () => {
                localStorage.removeItem('loggedInUser');
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            });
        }
    }
});
