const PERMS = {
    admin: { tabs: ['dash', 'clientes', 'demandas', 'entregas', 'config'], create: true, edit: true, manage: true },
    colaborador: { tabs: ['dash', 'clientes', 'demandas', 'entregas', 'config'], create: true, edit: false, manage: false },
    cliente: { tabs: ['entregas', 'config'], create: false, edit: false, manage: false, approve: true }
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
        { l: 'Andamento', v: 1, c: '#6366f1' },
        { l: 'Atrasados', v: 3, c: '#fbbf24' },
        { l: 'Concluídos', v: 8, c: '#10b981' },
        { l: 'Cancelados', v: 1, c: '#f43f5e' }
    ],
    deliveries: [
        { id: 1, title: 'Logo Redesign', type: 'Design', client: 'Pet Shop', budget: 1500, delivered: '15/11/25', status: 'CONCLUÍDO', approved: true },
        { id: 2, title: 'Vídeo Promocional', type: 'Vídeo', client: 'Academia', budget: 2000, delivered: '20/10/25', status: 'CONCLUÍDO', approved: false },
        { id: 3, title: 'E-commerce SEO', type: 'SEO', client: 'Loja', budget: 5000, delivered: '05/12/25', status: 'CANCELADO', approved: null }
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
    const list = document.getElementById('deliveriesList');
    
    if (list) {
        list.innerHTML = DATA.deliveries.map(d => {
            const show = p.approve && d.status === 'CONCLUÍDO';
            const badge = show ? (d.approved ? 'success' : 'warning') : (d.status === 'CANCELADO' ? 'danger' : 'success');
            const stat = show ? (d.approved ? 'CONCLUÍDO' : 'EM ANDAMENTO') : d.status;
            
            return `
                <div class="item">
                    <div class="desc">
                        <b>${d.title}</b>
                        <small>Tipo: ${d.type} | Cliente: ${d.client} | R$ ${d.budget.toFixed(2)}</small>
                    </div>
                    ${show ? `
                        <div class="status-check">
                            <input type="checkbox" id="c${d.id}" ${d.approved ? 'checked' : ''} onchange="toggle(${d.id})">
                            <label for="c${d.id}" class="checkbox-custom"></label>
                        </div>
                    ` : ''}
                    <span class="badge ${badge}">${stat}</span>
                </div>
            `;
        }).join('');
    }
    
    const profile = document.getElementById('profileSection');
    if (profile) {
        profile.innerHTML = `
            <div class="config-item"><label>Nome</label><input type="text" value="${user.name}" disabled class="config-input"></div>
            <div class="config-item"><label>Email</label><input type="email" value="${user.email}" disabled class="config-input"></div>
            <div class="config-item"><label>Cargo</label><input type="text" value="${user.level}" disabled class="config-input"></div>
        `;
    }
}

window.toggle = function(id) {
    const d = DATA.deliveries.find(x => x.id === id);
    if (!d) return;
    d.approved = !d.approved;
    showToast(d.approved ? '✅ Marcado como concluído' : '⚠️ Voltou para andamento', d.approved ? 'success' : 'warning');
    render();
};

function showToast(msg, type) {
    const old = document.querySelector('.toast-notification');
    if (old) old.remove();
    
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = `position:fixed; top:90px; right:20px; padding:14px 20px; background:${type === 'success' ? 'rgba(16,185,129,0.9)' : 'rgba(251,191,36,0.9)'}; color:white; border-radius:12px; font-weight:600; font-size:0.85rem; z-index:10000; animation:slideIn 0.3s, slideOut 0.3s 2.7s;`;
    
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