// ==========================================
// VERIFICAR AUTENTICAÇÃO
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // 1. Verificar credenciais
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUserRaw = localStorage.getItem('currentUser');
    
    // Se não tiver login ou dados, expulsa imediatamente
    if (!isLoggedIn || !currentUserRaw) {
        forceLogout();
        return;
    }
    
    try {
        // 2. Tentar ler os dados
        const currentUser = JSON.parse(currentUserRaw);
        
        // 3. Se o objeto estiver vazio ou inválido, expulsa
        if (!currentUser || !currentUser.email) {
            throw new Error('Dados inválidos');
        }

        // 4. Tudo certo, carrega a UI
        updateUserInfo(currentUser);
        initLogoutButton(); // Inicializa o botão aqui para garantir contexto
        
    } catch (e) {
        console.error('Erro de sessão:', e);
        forceLogout();
    }
});

function forceLogout() {
    // Limpa dados críticos de sessão
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    // Redireciona para o login (ajuste o caminho conforme sua estrutura de pastas)
    window.location.replace('../login/index.html');
}

function updateUserInfo(user) {
    // Helper para formatar nome
    const formatName = (name) => {
        if(!name) return 'Usuário';
        return name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ');
    };
    
    const avatar = document.querySelector('.avatar');
    if (avatar && user.name) {
        const initials = user.name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
        avatar.textContent = initials;
    }
    
    const userName = document.querySelector('.info strong');
    if (userName) userName.textContent = formatName(user.name);
    
    const userLevel = user.level || 'admin';
    const levelText = userLevel.charAt(0).toUpperCase() + userLevel.slice(1).toLowerCase();
    
    const userInfo = document.querySelector('.info');
    if (userInfo && !document.getElementById('userLevel')) {
        const levelEl = document.createElement('small');
        levelEl.id = 'userLevel';
        levelEl.style.cssText = 'color:var(--text-muted); font-size:0.75rem; margin-top:2px; display:block;';
        levelEl.textContent = levelText;
        userInfo.appendChild(levelEl);
    }
}

function initLogoutButton() {
    const userProfile = document.querySelector('.user-profile');
    // Evita duplicar o botão se a função rodar 2x
    if (userProfile && !document.querySelector('.btn-logout')) {
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn-logout';
        logoutBtn.innerHTML = 'Sair';
        logoutBtn.style.cssText = `
            width: 100%;
            padding: 10px;
            background: rgba(244, 63, 94, 0.1);
            border: 1px solid rgba(244, 63, 94, 0.3);
            color: var(--danger);
            border-radius: 12px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        `;

        logoutBtn.addEventListener('mouseenter', () => {
            logoutBtn.style.background = 'rgba(244, 63, 94, 0.2)';
            logoutBtn.style.transform = 'translateY(-2px)';
        });

        logoutBtn.addEventListener('mouseleave', () => {
            logoutBtn.style.background = 'rgba(244, 63, 94, 0.1)';
            logoutBtn.style.transform = 'translateY(0)';
        });

        logoutBtn.addEventListener('click', () => {
            if (confirm('Deseja realmente sair?')) {
                forceLogout();
            }
        });

        userProfile.appendChild(logoutBtn);
    }
}

// Data & Charts (Mantido igual)
const bars = [
    { l: 'Social', v: 13 }, 
    { l: 'Design', v: 9 }, 
    { l: 'Copy', v: 5 }, 
    { l: 'Video', v: 3 }, 
    { l: 'SEO', v: 2 }
];

const donut = [
    { l: 'Andamento', v: 1, c: 'var(--primary)' },
    { l: 'Atrasados', v: 3, c: 'var(--warn)' },
    { l: 'Concluídos', v: 8, c: 'var(--success)' },
    { l: 'Cancelados', v: 1, c: 'var(--danger)' }
];

const titles = {
    dash: 'Visão Geral',
    clientes: 'Meus Clientes',
    demandas: 'Gestão de Demandas',
    entregas: 'Controle de Entregas',
    config: 'Configurações'
};

// Sidebar Logic
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
const closeBtn = document.getElementById('closeSidebar');

if (toggleBtn) toggleBtn.onclick = () => sidebar.classList.remove('hidden');
if (closeBtn) closeBtn.onclick = () => sidebar.classList.add('hidden');

document.addEventListener('click', (e) => {
    if (window.innerWidth <= 840 && sidebar && !sidebar.contains(e.target) && 
        toggleBtn && !toggleBtn.contains(e.target) && !sidebar.classList.contains('hidden')) {
        sidebar.classList.add('hidden');
    }
});

// Tabs Navigation
const navLinks = document.querySelectorAll('.nav-link');
const tabContents = document.querySelectorAll('.tab-content');
const pageTitle = document.getElementById('page-title');

navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        
        navLinks.forEach(l => l.classList.remove('active'));
        tabContents.forEach(tab => tab.classList.remove('active'));
        
        link.classList.add('active');
        const targetId = link.getAttribute('data-target');
        const targetTab = document.getElementById(targetId);
        if (targetTab) targetTab.classList.add('active');
        
        if(pageTitle) pageTitle.innerText = titles[targetId];
        
        if (window.innerWidth <= 840 && sidebar) {
            sidebar.classList.add('hidden');
        }
    });
});

// Theme
const themeBtn = document.getElementById('theme');
const body = document.body;

if (localStorage.theme === 'light') body.classList.add('light');
if(themeBtn) themeBtn.innerText = body.classList.contains('light') ? '☀️' : '🌙';

if(themeBtn) {
    themeBtn.onclick = () => {
        body.classList.toggle('light');
        localStorage.theme = body.classList.contains('light') ? 'light' : 'dark';
        themeBtn.innerText = body.classList.contains('light') ? '☀️' : '🌙';
    };
}

// Charts Initialization
window.addEventListener('load', () => {
    // Bar chart
    const barEl = document.getElementById('bars');
    if (barEl) {
        barEl.innerHTML = '';
        const max = Math.max(...bars.map(d => d.v));

        bars.forEach(d => {
            const g = document.createElement('div');
            g.className = 'bar-group';
            const b = document.createElement('div');
            b.className = 'bar';
            b.style.height = '0%';
            b.setAttribute('data-val', d.v);
            setTimeout(() => b.style.height = (d.v / max * 100) + '%', 100);
            const l = document.createElement('div');
            l.className = 'lbl';
            l.innerText = d.l;
            g.append(b, l);
            barEl.appendChild(g);
        });
    }

    // Donut Chart
    const donutEl = document.getElementById('donut');
    const legEl = document.getElementById('legend');

    if (donutEl && legEl) {
        const w = 140, h = 140; 
        const radius = 65;
        const holeRadius = 45;
        const ns = 'http://www.w3.org/2000/svg';

        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

        const total = donut.reduce((a, b) => a + b.v, 0);
        let currentAngle = 0;

        donut.forEach(d => {
            const fraction = d.v / total;
            const angle = fraction * 2 * Math.PI;
            
            const x1_out = Math.cos(currentAngle) * radius;
            const y1_out = Math.sin(currentAngle) * radius;
            const x2_out = Math.cos(currentAngle + angle) * radius;
            const y2_out = Math.sin(currentAngle + angle) * radius;
            
            const x1_in = Math.cos(currentAngle) * holeRadius;
            const y1_in = Math.sin(currentAngle) * holeRadius;
            const x2_in = Math.cos(currentAngle + angle) * holeRadius;
            const y2_in = Math.sin(currentAngle + angle) * holeRadius;

            const big = fraction > 0.5 ? 1 : 0;

            const pathCmd = `
                M ${x1_out} ${y1_out}
                A ${radius} ${radius} 0 ${big} 1 ${x2_out} ${y2_out}
                L ${x2_in} ${y2_in}
                A ${holeRadius} ${holeRadius} 0 ${big} 0 ${x1_in} ${y1_in}
                Z
            `;

            const path = document.createElementNS(ns, 'path');
            path.setAttribute('d', pathCmd);
            path.setAttribute('fill', d.c);
            
            const title = document.createElementNS(ns, 'title');
            title.textContent = `${d.l}: ${d.v}`;
            path.appendChild(title);

            const g = document.createElementNS(ns, 'g');
            g.setAttribute('transform', `translate(${w/2},${h/2})`);
            g.appendChild(path);
            svg.appendChild(g);

            currentAngle += angle;

            legEl.innerHTML += `
                <div class="leg-item">
                    <span><span class="dot" style="background:${d.c}"></span>${d.l}</span>
                    <b>${d.v}</b>
                </div>`;
        });

        donutEl.innerHTML = '';
        donutEl.appendChild(svg);
    }
});

// Modal Logic
const modal = document.getElementById('modalDemand');
const btnNewDemand = document.getElementById('btnNewDemand');
const btnCloseModal = document.getElementById('closeModal');
const btnCancel = document.getElementById('btnCancel');
const formDemand = document.getElementById('formDemand');

if(modal && btnNewDemand) {
    btnNewDemand.onclick = () => {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeModalFunc = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if(formDemand) formDemand.reset();
    };

    if(btnCloseModal) btnCloseModal.onclick = closeModalFunc;
    if(btnCancel) btnCancel.onclick = closeModalFunc;

    const overlay = modal.querySelector('.modal-overlay');
    if(overlay) overlay.onclick = closeModalFunc;

    const content = modal.querySelector('.modal-content');
    if(content) content.onclick = (e) => e.stopPropagation();

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModalFunc();
        }
    });

    if(formDemand) {
        formDemand.onsubmit = (e) => {
            e.preventDefault();
            const formData = new FormData(formDemand);
            const demandData = {
                titulo: formData.get('titulo'),
                tipo: formData.get('tipo')
            };
            alert(`✅ Demanda "${demandData.titulo}" criada com sucesso!`);
            closeModalFunc();
        };
    }
}

// Date input min
const dateInput = document.getElementById('dataEntrega');
if(dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
}