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
                window.location.href = '../principal/dashboard.html';
                return;
            }
        } catch (e) {
            console.error("Dados de usuário corrompidos no login. Limpando...");
            localStorage.clear(); // Limpa tudo para permitir novo login limpo
        }
    }
    
    // Lembrar usuário (apenas preenche o campo, não loga automático)
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
        
        // Buscar usuários cadastrados
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Verificar credenciais (ou admin hardcoded para testes)
        const user = users.find(u => u.email === email && u.password === password);
        
        // Lógica de Admin Mock (opcional, para testes rápidos)
        const isAdminMock = (email === 'admin@admin.com' && password === 'admin');

        if (user || isAdminMock) {
            const userData = user || { name: 'Administrador', email: email, level: 'admin' };

            // Login bem-sucedido
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(userData));
            
            if (rememberMe) {
                localStorage.setItem('rememberUser', email);
            } else {
                localStorage.removeItem('rememberUser');
            }
            
            // Animação de sucesso
            showToast('Login realizado com sucesso! 🎉', 'success');
            
            // Redireciona
            setTimeout(() => {
                window.location.href = '../principal/dashboard.html';
            }, 1000);
            
        } else {
            // Credenciais inválidas
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
        
        // Validar senhas
        if (password !== confirmPassword) {
            showToast('As senhas não coincidem! ❌', 'error');
            return;
        }
        
        // Validar tamanho da senha
        if (password.length < 6) {
            showToast('A senha deve ter no mínimo 6 caracteres! ❌', 'error');
            return;
        }
        
        // Buscar usuários existentes
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Verificar se e-mail já existe
        if (users.some(u => u.email === email)) {
            showToast('Este e-mail já está cadastrado! ❌', 'error');
            return;
        }
        
        // Criar novo usuário
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            createdAt: new Date().toISOString()
        };
        
        // Salvar usuário
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        // Fazer login automático
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        // Animação de sucesso
        showToast('Conta criada com sucesso! 🎉', 'success');
        
        // Redireciona
        setTimeout(() => {
            window.location.href = '../principal/dashboard.html';
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