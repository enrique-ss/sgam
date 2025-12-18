const PERMS = {
    admin: { tabs: ['dash', 'clientes', 'demandas', 'entregas', 'config'], create: true, edit: true, manage: true, approve: true },
    colaborador: { tabs: ['dash', 'demandas', 'entregas', 'config'], create: true, edit: false, manage: false, approve: true },
    cliente: { tabs: ['entregas', 'config'], create: false, edit: false, manage: false, approve: false }
};

const MENU = [
    { id: 'dash', icon: '📊', label: 'Dash' },
    { id: 'clientes', icon: '👥', label: 'Clientes' },
    { id: 'demandas', icon: '🔥', label: 'Demandas' },
    { id: 'entregas', icon: '📦', label: 'Entregas' },
    { id: 'config', icon: '⚙️', label: 'Config' }
];

const DATA = {
    bars: [{ l: 'Social', v: 13 }, { l: 'Design', v: 9 }, { l: 'Copy', v: 5 }, { l: 'Video', v: 3 }, { l: 'SEO', v: 2 }],
    donut: [
        { l: 'Andamento', v: 5, c: '#6366f1' },
        { l: 'Atrasados', v: 3, c: '#fbbf24' },
        { l: 'Concluídos', v: 12, c: '#10b981' },
        { l: 'Cancelados', v: 2, c: '#f43f5e' }
    ],
    clients: [
        { name: 'Pet Paradise', email: 'contato@petparadise.com', phone: '(51) 98765-4321', active: true },
        { name: 'FitLife Academia', email: 'admin@fitlife.com.br', phone: '(51) 99876-5432', active: true },
        { name: 'Moda Bella', email: 'vendas@modabella.com', phone: '(51) 97654-3210', active: true },
        { name: 'TechSolutions', email: 'info@techsolutions.com', phone: '(51) 96543-2109', active: true },
        { name: 'Café Aroma', email: 'contato@cafearoma.com', phone: '(51) 95432-1098', active: false },
        { name: 'Restaurante Sabor', email: 'gerencia@sabor.com.br', phone: '(51) 94321-0987', active: true }
    ],
    demands: [
        { id: 1, title: 'Campanha Instagram', type: 'Social Media', desc: 'Posts para feed e stories promocionais', client: 'Pet Paradise', budget: 800, delivery: '25/12/25', status: 'EM ANDAMENTO' },
        { id: 2, title: 'Site Institucional', type: 'Design', desc: 'Desenvolvimento de site responsivo', client: 'FitLife Academia', budget: 3500, delivery: '15/01/26', status: 'EM ANDAMENTO' },
        { id: 3, title: 'Banner Black Friday', type: 'Design', desc: 'Banners para site e redes sociais', client: 'Moda Bella', budget: 600, delivery: '20/11/25', status: 'ATRASADO' },
        { id: 4, title: 'Textos Blog', type: 'Copywriting', desc: 'Artigos SEO para blog corporativo', client: 'TechSolutions', budget: 1200, delivery: '30/12/25', status: 'EM ANDAMENTO' },
        { id: 5, title: 'Vídeo Lançamento', type: 'Vídeo', desc: 'Vídeo promocional para novo produto', client: 'Café Aroma', budget: 2500, delivery: '10/11/25', status: 'ATRASADO' },
        { id: 6, title: 'Cardápio Digital', type: 'Design', desc: 'Design de cardápio digital interativo', client: 'Restaurante Sabor', budget: 900, delivery: '28/12/25', status: 'EM ANDAMENTO' },
        { id: 7, title: 'SEO Local', type: 'SEO', desc: 'Otimização para busca local', client: 'Pet Paradise', budget: 1500, delivery: '05/01/26', status: 'EM ANDAMENTO' },
        { id: 8, title: 'E-mail Marketing', type: 'Copywriting', desc: 'Campanha de e-mail marketing', client: 'Moda Bella', budget: 700, delivery: '18/11/25', status: 'ATRASADO' }
    ],
    deliveries: [
        { id: 101, title: 'Logo Redesign', type: 'Design', client: 'Pet Paradise', budget: 1500, delivered: '15/11/25', status: 'CONCLUÍDO' },
        { id: 102, title: 'Vídeo Promocional', type: 'Vídeo', client: 'FitLife Academia', budget: 2000, delivered: '20/10/25', status: 'CONCLUÍDO' },
        { id: 103, title: 'E-commerce SEO', type: 'SEO', client: 'Moda Bella', budget: 5000, delivered: '05/12/25', status: 'CANCELADO' },
        { id: 104, title: 'Identidade Visual', type: 'Design', client: 'Café Aroma', budget: 2800, delivered: '10/11/25', status: 'CONCLUÍDO' },
        { id: 105, title: 'Posts Redes Sociais', type: 'Social Media', client: 'Restaurante Sabor', budget: 650, delivered: '28/10/25', status: 'CONCLUÍDO' },
        { id: 106, title: 'Landing Page', type: 'Design', client: 'TechSolutions', budget: 1800, delivered: '15/10/25', status: 'CONCLUÍDO' },
        { id: 107, title: 'Catálogo Digital', type: 'Design', client: 'Moda Bella', budget: 1200, delivered: '05/11/25', status: 'CONCLUÍDO' },
        { id: 108, title: 'Fotografia Produtos', type: 'Vídeo', client: 'Pet Paradise', budget: 980, delivered: '22/10/25', status: 'CONCLUÍDO' },
        { id: 109, title: 'Rebranding Completo', type: 'Design', client: 'FitLife Academia', budget: 4500, delivered: '30/09/25', status: 'CANCELADO' },
        { id: 110, title: 'Campanha Natal', type: 'Social Media', client: 'Café Aroma', budget: 850, delivered: '01/12/25', status: 'CONCLUÍDO' },
        { id: 111, title: 'Otimização Google', type: 'SEO', client: 'Restaurante Sabor', budget: 1600, delivered: '18/11/25', status: 'CONCLUÍDO' },
        { id: 112, title: 'Anúncios Facebook', type: 'Social Media', client: 'TechSolutions', budget: 1100, delivered: '25/11/25', status: 'CONCLUÍDO' }
    ],
    users: [
        { id: 1, name: 'João Silva', email: 'joao.silva@sgam.com', role: 'admin', active: true },
        { id: 2, name: 'Maria Santos', email: 'maria.santos@sgam.com', role: 'colaborador', active: true },
        { id: 3, name: 'Pedro Costa', email: 'pedro.costa@sgam.com', role: 'colaborador', active: true },
        { id: 4, name: 'Ana Oliveira', email: 'ana@petparadise.com', role: 'cliente', active: true },
        { id: 5, name: 'Carlos Souza', email: 'carlos@fitlife.com.br', role: 'cliente', active: true },
        { id: 6, name: 'Julia Alves', email: 'julia.alves@sgam.com', role: 'colaborador', active: false },
        { id: 7, name: 'Roberto Lima', email: 'roberto@modabella.com', role: 'cliente', active: true },
        { id: 8, name: 'Fernanda Ramos', email: 'fernanda.ramos@sgam.com', role: 'admin', active: true }
    ]
};

let user = null;

window.addEventListener('DOMContentLoaded', () => {
    const logged = localStorage.getItem('isLoggedIn');
    const userData = localStorage.getItem('currentUser');
    
    if (!logged || !userData) return logout();
    
    try {
        user = JSON.parse(userData);
        if (!user?.email) throw new Error('Invalid');
        init();
    } catch (e) {
        logout();
    }
});

function init() {
    updateUser();
    buildMenu();
    applyPerms();
    addLogout();
    initSidebar();
    initTheme();
    initModal();
    initCharts();
    render();
}

function buildMenu() {
    const nav = document.getElementById('mainNav');
    const p = PERMS[user.level] || PERMS.cliente;
    
    MENU.forEach((m, i) => {
        if (!p.tabs.includes(m.id)) return;
        
        const a = document.createElement('a');
        a.href = '#';
        a.className = i === 0 ? 'nav-link active' : 'nav-link';
        a.setAttribute('data-target', m.id);
        a.innerHTML = `${m.icon} <span>${m.label}</span>`;
        a.onclick = (e) => { e.preventDefault(); switchTab(m.id); };
        nav.appendChild(a);
    });
}

function switchTab(id) {
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    
    const link = document.querySelector(`[data-target="${id}"]`);
    const tab = document.getElementById(id);
    
    if (link) link.classList.add('active');
    if (tab) tab.classList.add('active');
    
    const titles = {
        'dash': 'Visão Geral',
        'clientes': 'Clientes',
        'demandas': 'Demandas',
        'entregas': 'Entregas',
        'config': 'Configurações'
    };
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) pageTitle.textContent = titles[id] || 'Visão Geral';
    
    if (window.innerWidth <= 840) document.getElementById('sidebar').classList.add('hidden');
}

function applyPerms() {
    const p = PERMS[user.level] || PERMS.cliente;
    const btn = document.getElementById('btnNewDemand');
    const admin = document.getElementById('adminSection');
    
    if (btn) btn.style.display = p.create ? 'block' : 'none';
    if (admin) admin.style.display = p.manage ? 'block' : 'none';
}

function updateUser() {
    const avatar = document.querySelector('.avatar');
    const name = document.querySelector('.info strong');
    const info = document.querySelector('.info');
    
    if (avatar && user.name) {
        avatar.textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    
    if (name) {
        name.textContent = user.name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1).toLowerCase()).join(' ');
    }
    
    if (info && !document.getElementById('userLevel')) {
        const level = document.createElement('small');
        level.id = 'userLevel';
        level.style.cssText = 'color:var(--muted); font-size:0.75rem; margin-top:2px;';
        level.textContent = (user.level || 'admin').charAt(0).toUpperCase() + (user.level || 'admin').slice(1);
        info.appendChild(level);
    }
}

function addLogout() {
    const profile = document.querySelector('.user-profile');
    if (!profile || document.querySelector('.btn-logout')) return;
    
    const btn = document.createElement('button');
    btn.textContent = 'Sair';
    btn.className = 'btn-logout';
    btn.style.cssText = 'width:100%; margin-top:12px; padding:10px; background:rgba(244,63,94,0.1); border:1px solid rgba(244,63,94,0.3); color:var(--danger); border-radius:12px; font-size:0.85rem; font-weight:600; cursor:pointer; transition:0.3s;';
    btn.onmouseenter = () => { btn.style.background = 'rgba(244,63,94,0.2)'; btn.style.transform = 'translateY(-2px)'; };
    btn.onmouseleave = () => { btn.style.background = 'rgba(244,63,94,0.1)'; btn.style.transform = 'translateY(0)'; };
    btn.onclick = () => { if (confirm('Sair?')) logout(); };
    profile.appendChild(btn);
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    window.location.replace('login/auth.html');
}

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('toggleSidebar');
    const close = document.getElementById('closeSidebar');
    
    if (toggle) toggle.onclick = () => sidebar.classList.remove('hidden');
    if (close) close.onclick = () => sidebar.classList.add('hidden');
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 840 && sidebar && !sidebar.contains(e.target) && !toggle.contains(e.target) && !sidebar.classList.contains('hidden')) {
            sidebar.classList.add('hidden');
        }
    });
}

function initTheme() {
    const btn = document.getElementById('theme');
    const body = document.body;
    
    if (localStorage.theme === 'light') body.classList.add('light');
    if (btn) {
        btn.textContent = body.classList.contains('light') ? '☀️' : '🌙';
        btn.onclick = () => {
            body.classList.toggle('light');
            localStorage.theme = body.classList.contains('light') ? 'light' : 'dark';
            btn.textContent = body.classList.contains('light') ? '☀️' : '🌙';
        };
    }
}

function initCharts() {
    const bars = document.getElementById('bars');
    const donut = document.getElementById('donut');
    const legend = document.getElementById('legend');
    
    if (bars && !bars.innerHTML) {
        const max = Math.max(...DATA.bars.map(d => d.v));
        DATA.bars.forEach(d => {
            const g = document.createElement('div');
            g.className = 'bar-group';
            const b = document.createElement('div');
            b.className = 'bar';
            b.style.height = '0%';
            setTimeout(() => b.style.height = (d.v / max * 100) + '%', 100);
            const l = document.createElement('div');
            l.className = 'lbl';
            l.textContent = d.l;
            g.append(b, l);
            bars.appendChild(g);
        });
    }
    
    if (donut && legend && !donut.innerHTML) {
        const w = 140, h = 140, r = 65, hole = 45;
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        
        const total = DATA.donut.reduce((a, b) => a + b.v, 0);
        let angle = 0;
        
        DATA.donut.forEach(d => {
            const frac = d.v / total;
            const a = frac * 2 * Math.PI;
            const big = frac > 0.5 ? 1 : 0;
            
            const x1 = Math.cos(angle) * r, y1 = Math.sin(angle) * r;
            const x2 = Math.cos(angle + a) * r, y2 = Math.sin(angle + a) * r;
            const x3 = Math.cos(angle) * hole, y3 = Math.sin(angle) * hole;
            const x4 = Math.cos(angle + a) * hole, y4 = Math.sin(angle + a) * hole;
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', `M ${x1} ${y1} A ${r} ${r} 0 ${big} 1 ${x2} ${y2} L ${x4} ${y4} A ${hole} ${hole} 0 ${big} 0 ${x3} ${y3} Z`);
            path.setAttribute('fill', d.c);
            
            const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
            g.setAttribute('transform', `translate(${w/2},${h/2})`);
            g.appendChild(path);
            svg.appendChild(g);
            
            angle += a;
            legend.innerHTML += `<div class="leg-item"><span><span class="dot" style="background:${d.c}"></span>${d.l}</span><b>${d.v}</b></div>`;
        });
        
        donut.appendChild(svg);
    }
}

function render() {
    const p = PERMS[user.level] || PERMS.cliente;
    
    // Clientes
    const clientsList = document.getElementById('clientsList');
    if (clientsList) {
        clientsList.innerHTML = DATA.clients.map(c => `
            <div class="item">
                <div class="desc">
                    <b>${c.name}</b>
                    <small>Email: ${c.email} | Tel: ${c.phone}</small>
                </div>
                <span class="badge ${c.active ? 'success' : 'danger'}">${c.active ? 'ATIVO' : 'INATIVO'}</span>
            </div>
        `).join('');
    }
    
    // Demandas - Mostra EM ANDAMENTO e ATRASADO com checkboxes
    const demandsList = document.getElementById('demandsList');
    if (demandsList) {
        demandsList.innerHTML = DATA.demands.map(d => {
            const canApprove = p.approve;
            
            return `
                <div class="item">
                    <div class="desc">
                        <b>${d.title}</b>
                        <small>Tipo: ${d.type} | Cliente: ${d.client}<br>Orçamento: R$ ${d.budget.toFixed(2)} | Entrega: ${d.delivery}<br>${d.desc}</small>
                    </div>
                    ${canApprove ? `
                        <div class="action-buttons">
                            <button class="btn-complete" onclick="completeDemand(${d.id})" title="Concluir">✓</button>
                            <button class="btn-cancel-demand" onclick="cancelDemand(${d.id})" title="Cancelar">✕</button>
                        </div>
                    ` : ''}
                    <span class="badge ${d.status === 'ATRASADO' ? 'danger' : 'success'}">${d.status}</span>
                </div>
            `;
        }).join('');
    }
    
    // Entregas - Mostra apenas histórico (CONCLUÍDO e CANCELADO) sem edição
    const deliveriesList = document.getElementById('deliveriesList');
    if (deliveriesList) {
        deliveriesList.innerHTML = DATA.deliveries.map(d => {
            const badge = d.status === 'CANCELADO' ? 'danger' : 'success';
            
            return `
                <div class="item">
                    <div class="desc">
                        <b>${d.title}</b>
                        <small>Tipo: ${d.type} | Cliente: ${d.client} | R$ ${d.budget.toFixed(2)} | Entregue: ${d.delivered}</small>
                    </div>
                    <span class="badge ${badge}">${d.status}</span>
                </div>
            `;
        }).join('');
    }
    
    // Próximas entregas (Dashboard)
    const nextDel = document.getElementById('nextDeliveries');
    if (nextDel) {
        const upcoming = DATA.demands.filter(d => d.status === 'EM ANDAMENTO').slice(0, 3);
        nextDel.innerHTML = upcoming.map(d => `
            <div class="item">
                <div class="icon ${d.type === 'Social Media' ? 'purple' : 'blue'}">${d.title.substring(0, 2).toUpperCase()}</div>
                <div class="desc">
                    <b>${d.title}</b>
                    <small>${d.delivery} • ${d.type}</small>
                </div>
                <div class="badge success">ATIVO</div>
            </div>
        `).join('');
    }
    
    // Alertas (Dashboard)
    const alerts = document.getElementById('alertsList');
    if (alerts) {
        const late = DATA.demands.filter(d => d.status === 'ATRASADO');
        alerts.innerHTML = late.map(d => `
            <div class="item">
                <div class="desc">
                    <b>${d.title}</b>
                    <small class="danger">Cliente: ${d.client} | Deveria ter sido entregue em ${d.delivery}</small>
                </div>
                <span class="badge danger">URGENTE</span>
            </div>
        `).join('');
    }
    
    // Perfil
    const profile = document.getElementById('profileSection');
    if (profile) {
        profile.innerHTML = `
            <div class="config-item"><label>Nome</label><input type="text" value="${user.name}" disabled class="config-input"></div>
            <div class="config-item"><label>Email</label><input type="email" value="${user.email}" disabled class="config-input"></div>
            <div class="config-item"><label>Cargo</label><input type="text" value="${user.level}" disabled class="config-input"></div>
        `;
    }
    
    // Usuários (apenas admin)
    const usersTable = document.getElementById('usersTable');
    if (usersTable && p.manage) {
        const roleLabels = { admin: 'Admin', colaborador: 'Colaborador', cliente: 'Cliente' };
        usersTable.innerHTML = `
            <div class="table-header">
                <div class="td">Nome</div>
                <div class="td">Email</div>
                <div class="td">Cargo</div>
                <div class="td">Status</div>
                <div class="td">Ações</div>
            </div>
            ${DATA.users.map(u => `
                <div class="table-row">
                    <div class="td"><b>${u.name}</b></div>
                    <div class="td">${u.email}</div>
                    <div class="td">${roleLabels[u.role]}</div>
                    <div class="td"><span class="badge ${u.active ? 'success' : 'danger'}">${u.active ? 'ATIVO' : 'INATIVO'}</span></div>
                    <div class="td">
                        <button class="btn-edit" style="padding:6px 12px; font-size:0.75rem;">Editar</button>
                    </div>
                </div>
            `).join('')}
        `;
    }
}

// Função para concluir demanda
window.completeDemand = function(id) {
    const demand = DATA.demands.find(d => d.id === id);
    if (!demand) return;
    
    if (confirm(`Concluir a demanda "${demand.title}"?`)) {
        // Remove da lista de demandas
        const index = DATA.demands.findIndex(d => d.id === id);
        DATA.demands.splice(index, 1);
        
        // Adiciona ao histórico de entregas
        DATA.deliveries.unshift({
            id: Date.now(),
            title: demand.title,
            type: demand.type,
            client: demand.client,
            budget: demand.budget,
            delivered: new Date().toLocaleDateString('pt-BR'),
            status: 'CONCLUÍDO'
        });
        
        showToast('✅ Demanda concluída com sucesso!', 'success');
        render();
    }
};

// Função para cancelar demanda
window.cancelDemand = function(id) {
    const demand = DATA.demands.find(d => d.id === id);
    if (!demand) return;
    
    if (confirm(`Cancelar a demanda "${demand.title}"?`)) {
        // Remove da lista de demandas
        const index = DATA.demands.findIndex(d => d.id === id);
        DATA.demands.splice(index, 1);
        
        // Adiciona ao histórico de entregas
        DATA.deliveries.unshift({
            id: Date.now(),
            title: demand.title,
            type: demand.type,
            client: demand.client,
            budget: demand.budget,
            delivered: new Date().toLocaleDateString('pt-BR'),
            status: 'CANCELADO'
        });
        
        showToast('❌ Demanda cancelada', 'danger');
        render();
    }
};

function showToast(msg, type) {
    const old = document.querySelector('.toast-notification');
    if (old) old.remove();
    
    const colors = {
        success: 'rgba(16,185,129,0.9)',
        danger: 'rgba(244,63,94,0.9)',
        warning: 'rgba(251,191,36,0.9)'
    };
    
    const t = document.createElement('div');
    t.className = 'toast-notification';
    t.textContent = msg;
    t.style.cssText = `position:fixed; top:90px; right:20px; padding:14px 20px; background:${colors[type]}; color:white; border-radius:12px; font-weight:600; font-size:0.85rem; z-index:10000; animation:slideIn 0.3s, slideOut 0.3s 2.7s;`;
    
    if (!document.getElementById('anim')) {
        const s = document.createElement('style');
        s.id = 'anim';
        s.textContent = '@keyframes slideIn { from { transform:translateX(400px); opacity:0; } to { transform:translateX(0); opacity:1; } } @keyframes slideOut { from { transform:translateX(0); opacity:1; } to { transform:translateX(400px); opacity:0; } }';
        document.head.appendChild(s);
    }
    
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function initModal() {
    const modal = document.getElementById('modalDemand');
    const open = document.getElementById('btnNewDemand');
    const close = document.getElementById('closeModal');
    const cancel = document.getElementById('btnCancel');
    const form = document.getElementById('formDemand');
    const overlay = modal?.querySelector('.modal-overlay');
    
    const closeModal = () => {
        if (modal) modal.classList.remove('active');
        document.body.style.overflow = '';
        if (form) form.reset();
    };
    
    if (open) open.onclick = () => { modal.classList.add('active'); document.body.style.overflow = 'hidden'; };
    if (close) close.onclick = closeModal;
    if (cancel) cancel.onclick = closeModal;
    if (overlay) overlay.onclick = closeModal;
    
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal?.classList.contains('active')) closeModal(); });
    
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            alert('✅ Demanda criada!');
            closeModal();
        };
    }
}