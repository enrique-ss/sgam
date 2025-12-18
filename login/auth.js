const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// Verificar se já está logado
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = localStorage.getItem('currentUser');
    
    if (isLoggedIn === 'true' && currentUser) {
        try {
            const user = JSON.parse(currentUser);
            if (user && user.email) {
                window.location.href = '../index.html';
                return;
            }
        } catch (e) {
            localStorage.clear();
        }
    }
    
    // Lembrar usuário
    const rememberedEmail = localStorage.getItem('rememberUser');
    if (rememberedEmail) {
        document.getElementById('loginEmail').value = rememberedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

// Trocar entre login e cadastro
showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.classList.add('hidden');
    signupCard.classList.remove('hidden');
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupCard.classList.add('hidden');
    loginCard.classList.remove('hidden');
});

// Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.email === email && u.password === password);
    
    // Usuários de teste
    if (!user) {
        if (email === 'admin@rsti.com' && password === '123456') {
            user = { name: 'Enrique', email: email, level: 'admin' };
        } else if (email === 'colaborador@rsti.com' && password === '123456') {
            user = { name: 'Alisson', email: email, level: 'colaborador' };
        } else if (email === 'cliente@rsti.com' && password === '123456') {
            user = { name: 'Gabriel', email: email, level: 'cliente' };
        }
    }

    if (user) {
        if (!user.level) user.level = 'admin';

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        if (rememberMe) {
            localStorage.setItem('rememberUser', email);
        } else {
            localStorage.removeItem('rememberUser');
        }
        
        showToast(`Bem-vindo, ${user.name}!`, 'success');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
        
    } else {
        showToast('E-mail ou senha incorretos!', 'error');
    }
});

// Cadastro
signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showToast('As senhas não coincidem!', 'error');
        return;
    }
    
    if (password.length < 6) {
        showToast('A senha deve ter no mínimo 6 caracteres!', 'error');
        return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (users.some(u => u.email === email)) {
        showToast('Este e-mail já está cadastrado!', 'error');
        return;
    }
    
    const newUser = {
        id: Date.now(),
        name: name,
        email: email,
        password: password,
        level: 'cliente',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    
    showToast('Conta criada com sucesso!', 'success');
    
    setTimeout(() => {
        window.location.href = '../index.html';
    }, 1000);
});

// Toast
function showToast(message, type) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}