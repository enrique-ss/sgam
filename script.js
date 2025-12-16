// Data
const bars = [
    { l: 'Social', v: 14 }, 
    { l: 'Design', v: 9 }, 
    { l: 'Copy', v: 5 }, 
    { l: 'Video', v: 3 }, 
    { l: 'SEO', v: 2 }
];

const donut = [
    { l: 'Andamento', v: 12, c: 'var(--primary)' },
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

// Donut chart
const donutEl = document.getElementById('donut');
const legEl = document.getElementById('legend');
const w = 100, h = 100, r = 50, hole = 35;
const ns = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(ns, 'svg');
svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
const total = donut.reduce((a, b) => a + b.v, 0);
let ang = 0;

donut.forEach(d => {
    const perc = d.v / total;
    const rad = perc * 2 * Math.PI;
    const x1 = Math.cos(ang) * r;
    const y1 = Math.sin(ang) * r;
    const x2 = Math.cos(ang + rad) * r;
    const y2 = Math.sin(ang + rad) * r;
    const big = perc > 0.5 ? 1 : 0;
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', `M0 0 L${x1} ${y1} A${r} ${r} 0 ${big} 1 ${x2} ${y2} Z`);
    path.setAttribute('fill', d.c);
    const title = document.createElementNS(ns, 'title');
    title.textContent = `${d.l}: ${d.v}`;
    path.appendChild(title);
    const g = document.createElementNS(ns, 'g');
    g.setAttribute('transform', `translate(${w/2},${h/2})`);
    g.appendChild(path);
    svg.appendChild(g);
    ang += rad;
    legEl.innerHTML += `<div class="leg-item"><span><span class="dot" style="background:${d.c}"></span>${d.l}</span><b>${d.v}</b></div>`;
});

const c = document.createElementNS(ns, 'circle');
c.setAttribute('cx', w/2);
c.setAttribute('cy', h/2);
c.setAttribute('r', hole);
c.setAttribute('fill', 'var(--card)');
svg.appendChild(c);
donutEl.appendChild(svg);