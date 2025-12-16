// ==========================================
// VERIFICAR AUTENTICAÇÃO
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!isLoggedIn || !currentUser) {
        // Redireciona para a página de login
        window.location.href = 'index.html';
        return;
    }
    
    // Atualizar informações do usuário na interface
    updateUserInfo(currentUser);
});

function updateUserInfo(user) {
    // Atualizar avatar com iniciais
    const avatar = document.querySelector('.avatar');
    const initials = user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    avatar.textContent = initials;
    
    // Atualizar nome do usuário
    const userName = document.querySelector('.info strong');
    userName.textContent = user.name;
}

// Data
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

// Sidebar toggle
const sidebar = document.getElementById('sidebar');
const toggleBtn = document.getElementById('toggleSidebar');
const closeBtn = document.getElementById('closeSidebar');

// Abre a sidebar
toggleBtn.onclick = () => {
    sidebar.classList.remove('hidden');
};

// Fecha a sidebar
closeBtn.onclick = () => {
    sidebar.classList.add('hidden');
};

// Fecha sidebar ao clicar fora (apenas mobile)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 840 && 
        !sidebar.contains(e.target) && 
        !toggleBtn.contains(e.target) &&
        !sidebar.classList.contains('hidden')) {
        sidebar.classList.add('hidden');
    }
});

// Navigation
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
        document.getElementById(targetId).classList.add('active');
        pageTitle.innerText = titles[targetId];
        
        // Fecha sidebar no mobile após selecionar item
        if (window.innerWidth <= 840) {
            sidebar.classList.add('hidden');
        }
    });
});

// Theme toggle
const themeBtn = document.getElementById('theme');
const body = document.body;

if (localStorage.theme === 'light') body.classList.add('light');
themeBtn.innerText = body.classList.contains('light') ? '☀️' : '🌙';

themeBtn.onclick = () => {
    body.classList.toggle('light');
    localStorage.theme = body.classList.contains('light') ? 'light' : 'dark';
    themeBtn.innerText = body.classList.contains('light') ? '☀️' : '🌙';
};

// Bar chart
const barEl = document.getElementById('bars');
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

// --- DONUT CHART (Versão Transparente "True Ring") ---
const donutEl = document.getElementById('donut');
const legEl = document.getElementById('legend');

// Configurações de Tamanho
const w = 140, h = 140; 
const radius = 65;      // Raio externo
const holeRadius = 45;  // Raio interno (buraco)
const ns = 'http://www.w3.org/2000/svg';

const svg = document.createElementNS(ns, 'svg');
svg.setAttribute('viewBox', `0 0 ${w} ${h}`);

const total = donut.reduce((a, b) => a + b.v, 0);
let currentAngle = 0;

donut.forEach(d => {
    const fraction = d.v / total;
    const angle = fraction * 2 * Math.PI; // Ângulo em radianos
    
    // Calcular coordenadas
    // Precisamos de 4 pontos: Inicio Externo, Fim Externo, Fim Interno, Inicio Interno
    
    // Pontos Externos
    const x1_out = Math.cos(currentAngle) * radius;
    const y1_out = Math.sin(currentAngle) * radius;
    const x2_out = Math.cos(currentAngle + angle) * radius;
    const y2_out = Math.sin(currentAngle + angle) * radius;
    
    // Pontos Internos
    const x1_in = Math.cos(currentAngle) * holeRadius;
    const y1_in = Math.sin(currentAngle) * holeRadius;
    const x2_in = Math.cos(currentAngle + angle) * holeRadius;
    const y2_in = Math.sin(currentAngle + angle) * holeRadius;

    // Flag para arcos maiores que 180 graus
    const big = fraction > 0.5 ? 1 : 0;

    // Desenhar o caminho (Path) do anel
    // M (Move p/ inicio externo) -> A (Arco externo) -> L (Linha p/ fim interno) -> A (Arco interno invertido) -> Z (Fecha)
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
    
    // Tooltip nativo
    const title = document.createElementNS(ns, 'title');
    title.textContent = `${d.l}: ${d.v}`;
    path.appendChild(title);

    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${w/2},${h/2})`); // Centraliza no SVG
    g.appendChild(path);
    svg.appendChild(g);

    currentAngle += angle;

    // Renderizar Legenda
    legEl.innerHTML += `
        <div class="leg-item">
            <span><span class="dot" style="background:${d.c}"></span>${d.l}</span>
            <b>${d.v}</b>
        </div>`;
});

// Nota: Removemos a criação do <circle> central para deixar o fundo transparente
donutEl.innerHTML = ''; // Limpa conteúdo anterior se houver
donutEl.appendChild(svg);

// ==========================================
// MODAL NOVA DEMANDA
// ==========================================

const modal = document.getElementById('modalDemand');
const btnNewDemand = document.getElementById('btnNewDemand');
const btnCloseModal = document.getElementById('closeModal');
const btnCancel = document.getElementById('btnCancel');
const formDemand = document.getElementById('formDemand');

// Abre o modal
btnNewDemand.onclick = () => {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Previne scroll do body
};

// Fecha o modal
const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restaura scroll
    formDemand.reset(); // Limpa o formulário
};

btnCloseModal.onclick = closeModal;
btnCancel.onclick = closeModal;

// Fecha ao clicar no overlay
modal.querySelector('.modal-overlay').onclick = closeModal;

// Previne fechar ao clicar dentro do modal-content
modal.querySelector('.modal-content').onclick = (e) => {
    e.stopPropagation();
};

// Fecha com tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
    }
});

// Submissão do formulário
formDemand.onsubmit = (e) => {
    e.preventDefault();
    
    // Coleta os dados do formulário
    const formData = new FormData(formDemand);
    const demandData = {
        titulo: formData.get('titulo'),
        tipo: formData.get('tipo'),
        cliente: formData.get('cliente'),
        orcamento: formData.get('orcamento'),
        dataEntrega: formData.get('dataEntrega'),
        prioridade: formData.get('prioridade'),
        descricao: formData.get('descricao')
    };
    
    console.log('Nova Demanda Criada:', demandData);
    
    // Aqui você pode adicionar lógica para:
    // - Enviar para um backend
    // - Salvar localmente
    // - Adicionar à lista de demandas
    
    // Mostra mensagem de sucesso (simples)
    alert(`✅ Demanda "${demandData.titulo}" criada com sucesso!`);
    
    // Fecha o modal
    closeModal();
};

// Define data mínima como hoje para o input de data
const dateInput = document.getElementById('dataEntrega');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);

// ==========================================
// LOGOUT - Adicionar botão de logout
// ==========================================

// Criar botão de logout na sidebar (adicionar ao user-profile)
const userProfile = document.querySelector('.user-profile');
const logoutBtn = document.createElement('button');
logoutBtn.className = 'btn-logout';
logoutBtn.innerHTML = '🚪 Sair';
logoutBtn.style.cssText = `
    width: 100%;
    margin-top: 12px;
    padding: 10px;
    background: rgba(244, 63, 94, 0.1);
    border: 1px solid rgba(244, 63, 94, 0.3);
    color: var(--danger);
    border-radius: 8px;
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
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
});

userProfile.appendChild(logoutBtn);