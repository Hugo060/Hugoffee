const TOKEN_KEY = 'hugoffee_token';
const USER_KEY = 'hugoffee_user';
const EXPIRY_KEY = 'hugoffee_token_exp';
const USERS_DB_KEY = 'hugoffee_registered_users'; 
const DAYS_TO_EXPIRE = 7;

async function initializeUsersDB() {
    let users = JSON.parse(localStorage.getItem(USERS_DB_KEY));
    if (!users || users.length === 0) {
        try {
            const response = await fetch('/datos/usuarios.json');
            const data = await response.json();
            users = data.usuarios.map(u => ({
                id: u.id,
                name: u.nombre,
                email: u.email,
                password: u.password,
                fecha_registro: u.fecha_registro || new Date().toISOString(),
                compras: u.compras_anteriores || []
            }));
            localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        } catch (error) {
            users = [];
        }
    }
    return users;
}

function getRegisteredUsers() {
    return JSON.parse(localStorage.getItem(USERS_DB_KEY)) || [];
}

async function registerUserInMockDB(name, email, password) {
    const users = await initializeUsersDB();
    const exists = users.some(u => u.email === email);
    if (exists) return false;

    const newUser = {
        id: 'usr_' + Math.random().toString(36).substring(2, 7),
        name,
        email,
        password,
        fecha_registro: new Date().toISOString(),
        compras: []
    };

    users.push(newUser);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    return true;
}

function getValidSession() {
    const localToken = localStorage.getItem(TOKEN_KEY);
    const expTime = localStorage.getItem(EXPIRY_KEY);

    if (localToken && expTime) {
        if (Date.now() < parseInt(expTime, 10)) {
            return {
                token: localToken,
                user: JSON.parse(localStorage.getItem(USER_KEY))
            };
        } else {
            clearSession();
        }
    }

    const sessionToken = sessionStorage.getItem(TOKEN_KEY);
    if (sessionToken) {
        return {
            token: sessionToken,
            user: JSON.parse(sessionStorage.getItem(USER_KEY))
        };
    }

    return null;
}

function saveSession(userData, token, rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem(TOKEN_KEY, token);
    storage.setItem(USER_KEY, JSON.stringify(userData));

    if (rememberMe) {
        const expirationDate = Date.now() + (DAYS_TO_EXPIRE * 24 * 60 * 60 * 1000);
        localStorage.setItem(EXPIRY_KEY, expirationDate.toString());
    }
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRY_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
}

document.addEventListener('DOMContentLoaded', async () => {
    await initializeUsersDB();

    const session = getValidSession();
    const currentPath = window.location.pathname;

    if (session && (currentPath.includes('inicioSesion.html') || currentPath.includes('registro.html'))) {
        window.location.href = 'menu.html';
        return;
    }

    const userBtn = document.getElementById('userBtn');
    const userDropdown = document.getElementById('userDropdown');
    const userNameDisplay = document.getElementById('userNameDisplay');
    const logoutBtn = document.getElementById('logoutBtn');

    if (userBtn) {
        userBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!session) {
                window.location.href = 'inicioSesion.html';
            } else if (userDropdown) {
                userDropdown.classList.toggle('active');
            }
        });
    }

    if (session && userNameDisplay) {
        userNameDisplay.textContent = `Hola, ${session.user.name || 'Usuario'}`;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            clearSession();
            window.location.href = 'inicioSesion.html';
        });
    }

    document.addEventListener('click', () => {
        if (userDropdown) userDropdown.classList.remove('active');
    });

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginForm = document.getElementById('loginForm');

    if (loginForm && emailInput) {
        let errorMsgEl = document.getElementById('loginErrorMsg');
        if (!errorMsgEl) {
            errorMsgEl = document.createElement('div');
            errorMsgEl.id = 'loginErrorMsg';
            errorMsgEl.style.color = '#d9534f';
            errorMsgEl.style.fontSize = '0.85rem';
            errorMsgEl.style.marginBottom = '10px';
            errorMsgEl.style.display = 'none';
            loginForm.prepend(errorMsgEl);
        }

        emailInput.addEventListener('input', () => {
            const emailVal = emailInput.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(emailVal)) {
                emailInput.style.borderColor = '#708238';
            } else {
                emailInput.style.borderColor = '';
            }
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();
            const rememberMe = document.getElementById('rememberMe')?.checked || false;

            const users = getRegisteredUsers();
            const user = users.find(u => u.email === email && u.password === password);

            if (user) {
                const fakeToken = 'token_' + Math.random().toString(36).substring(2) + Date.now();
                const sessionUser = { id: user.id, name: user.name, email: user.email };
                saveSession(sessionUser, fakeToken, rememberMe);
                
                handleLoginSuccess(sessionUser);
            } else {
                errorMsgEl.textContent = 'Correo o contraseña incorrectos, o la cuenta no existe.';
                errorMsgEl.style.display = 'block';
                passwordInput.value = '';
                emailInput.style.borderColor = '#d9534f';
                passwordInput.style.borderColor = '#d9534f';
            }
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        let regErrorMsgEl = document.getElementById('regErrorMsg');
        if (!regErrorMsgEl) {
            regErrorMsgEl = document.createElement('div');
            regErrorMsgEl.id = 'regErrorMsg';
            regErrorMsgEl.style.color = '#d9534f';
            regErrorMsgEl.style.fontSize = '0.85rem';
            regErrorMsgEl.style.marginBottom = '10px';
            regErrorMsgEl.style.display = 'none';
            registerForm.prepend(regErrorMsgEl);
        }

        const regEmailInput = document.getElementById('regEmail');
        if (regEmailInput) {
            regEmailInput.addEventListener('input', () => {
                const emailVal = regEmailInput.value.trim();
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (emailRegex.test(emailVal)) {
                    regEmailInput.style.borderColor = '#708238';
                } else {
                    regEmailInput.style.borderColor = '';
                }
            });
        }

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('regName').value.trim();
            const email = regEmailInput.value.trim();
            const passwordInputReg = document.getElementById('regPassword');
            const password = passwordInputReg.value;

            if (await registerUserInMockDB(name, email, password)) {
                const users = getRegisteredUsers();
                const newUser = users.find(u => u.email === email);
                const fakeToken = 'token_' + Math.random().toString(36).substring(2) + Date.now();
                const sessionUser = { id: newUser ? newUser.id : '', name, email };
                
                saveSession(sessionUser, fakeToken, true);

                handleLoginSuccess(sessionUser);
            } else {
                regErrorMsgEl.textContent = 'Este correo ya está registrado.';
                regErrorMsgEl.style.display = 'block';
                passwordInputReg.value = '';
                regEmailInput.style.borderColor = '#d9534f';
                passwordInputReg.style.borderColor = '#d9534f';
            }
        });
    }

    function handleLoginSuccess(user) {
        if (user && user.id) {
            mergeGuestCartToUser(user.id);
        }

        const redirectUrl = localStorage.getItem('redirectAfterLogin');

        if (redirectUrl) {
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectUrl;
        } else {
            window.location.href = 'index.html';
        }
    }

    function mergeGuestCartToUser(userId) {
        const guestCart = JSON.parse(sessionStorage.getItem('hugoffee_cart_guest')) || [];
        
        if (guestCart.length === 0) return; 

        const userStorageKey = `hugoffee_cart_${userId}`;
        const userCart = JSON.parse(localStorage.getItem(userStorageKey)) || [];

        guestCart.forEach(guestItem => {
            const existingItem = userCart.find(item => item.id === guestItem.id);
            if (existingItem) {
                existingItem.quantity += guestItem.quantity;
            } else {
                userCart.push(guestItem);
            }
        });

        localStorage.setItem(userStorageKey, JSON.stringify(userCart));

        sessionStorage.removeItem('hugoffee_cart_guest');
    }

});