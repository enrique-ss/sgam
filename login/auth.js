// ==========================================
// ELEMENTOS DO DOM
// ==========================================
const loginCard = document.getElementById('loginCard');
const signupCard = document.getElementById('signupCard');
const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

// ==========================================
// VERIFICAR SE JÁ ESTÁ LOGADO (COM PROTEÇÃO ANTI-LOOP)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUserRaw = localStorage.getItem('currentUser');
    
    // Só redireciona se tiver o flag E conseguir ler o usuário corretamente
    if (isLoggedIn === 'true' && currentUserRaw) {
        try {
            const user = JSON.parse(currentUserRaw);
            // Verifica se o objeto usuário tem conteúdo válido antes de redirecionar
            if (user && user.email) {
                window.location.href = '../index.html';
                return;
            }
        } catch (e) {
            console.error("Dados de usuário corrompidos no login. Limpando...");
            localStorage.clear(); 
        }
    }
    
    // Lembrar usuário
    const rememberedEmail = localStorage.getItem('rememberUser');
    if (rememberedEmail) {
        const emailInput = document.getElementById('loginEmail');
        const rememberInput = document.getElementById('rememberMe');
        if(emailInput) emailInput.value = rememberedEmail;
        if(rememberInput) rememberInput.checked = true;
    }
});

// ==========================================
// TROCAR ENTRE LOGIN E CADASTRO
// ==========================================
if(showSignupBtn) {
    showSignupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchCards(loginCard, signupCard);
    });
}

if(showLoginBtn) {
    showLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchCards(signupCard, loginCard);
    });
}

function switchCards(hideCard, showCard) {
    hideCard.classList.add('fade-out');
    
    setTimeout(() => {
        hideCard.classList.add('hidden');
        hideCard.classList.remove('fade-out');
        
        showCard.classList.remove('hidden');
        showCard.classList.add('fade-in');
        
        setTimeout(() => {
            showCard.classList.remove('fade-in');
        }, 300);
    }, 300);
}

// ==========================================
// LOGIN
// ==========================================
if(loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // Buscar usuários cadastrados no localStorage
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Verificar se é um usuário cadastrado manualmente
        let user = users.find(u => u.email === email && u.password === password);
        
        // === MOCK USERS PARA TESTE DE NÍVEIS ===
        // Isso permite você testar sem criar contas manualmente
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
            // Se o usuário veio do cadastro manual e não tem level, define padrão
            if (!user.level) user.level = 'admin'; // ou 'colaborador' por padrão

            // Login bem-sucedido
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('rememberUser', email);
            } else {
                localStorage.removeItem('rememberUser');
            }
            
            showToast(`Bem-vindo, ${user.name}! (${user.level}) 🚀`, 'success');
            
            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
            
        } else {
            showToast('E-mail ou senha incorretos! ❌', 'error');
        }
    });
}

// ==========================================
// CADASTRO
// ==========================================
if(signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const confirmPassword = document.getElementById('signupConfirmPassword').value;
        
        if (password !== confirmPassword) {
            showToast('As senhas não coincidem! ❌', 'error');
            return;
        }
        
        if (password.length < 6) {
            showToast('A senha deve ter no mínimo 6 caracteres! ❌', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.some(u => u.email === email)) {
            showToast('Este e-mail já está cadastrado! ❌', 'error');
            return;
        }
        
        // Novos cadastros entram como ADMIN por padrão neste demo
        // Em produção, isso seria 'cliente' ou 'pendente'
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            level: 'admin', 
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        showToast('Conta criada com sucesso! 🎉', 'success');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1000);
    });
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    Object.assign(toast.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 24px',
        borderRadius: '12px',
        fontWeight: '600',
        fontSize: '0.9rem',
        zIndex: '10000',
        animation: 'slideInRight 0.3s ease-out',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
    });
    
    if (type === 'success') {
        toast.style.background = 'rgba(16, 185, 129, 0.2)';
        toast.style.color = '#10b981';
        toast.style.borderColor = 'rgba(16, 185, 129, 0.4)';
    } else {
        toast.style.background = 'rgba(244, 63, 94, 0.2)';
        toast.style.color = '#f43f5e';
        toast.style.borderColor = 'rgba(244, 63, 94, 0.4)';
    }
    
    if (!document.querySelector('#toast-animations')) {
        const style = document.createElement('style');
        style.id = 'toast-animations';
        style.textContent = `
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(100px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes slideOutRight {
                from { opacity: 1; transform: translateX(0); }
                to { opacity: 0; transform: translateX(100px); }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}