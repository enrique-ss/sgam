// Dados
const bars = [
    { l: 'Social', v: 14 }, 
    { l: 'Design', v: 9 }, 
    { l: 'Copy', v: 5 }, 
    { l: 'Video', v: 3 }, 
    { l: 'SEO', v: 2 }
];

const donut = [
    { l: 'Andamento', v: 12, c: 'var(--c1)' },
    { l: 'Revisão', v: 5, c: 'var(--c3)' },
    { l: 'Finalizado', v: 3, c: 'var(--c5)' },
    { l: 'Cancelado', v: 1, c: 'var(--c4)' }
];

// Tema
const btn = document.getElementById('theme');
const body = document.body;

if (localStorage.theme === 'light') body.classList.add('light');
updateIcon();

btn.onclick = () => {
    body.classList.toggle('light');
    localStorage.theme = body.classList.contains('light') ? 'light' : 'dark';
    updateIcon();
};

function updateIcon() {
    btn.innerText = body.classList.contains('light') ? '☀️' : '🌙';
}

// Renderizar
document.addEventListener('DOMContentLoaded', () => {
    // Barras
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

    // Rosca
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

        // Legenda
        legEl.innerHTML += `
            <div class="leg-item">
                <span><span class="dot" style="background:${d.c}"></span>${d.l}</span>
                <b>${d.v}</b>
            </div>`;
    });

    // Buraco central
    const c = document.createElementNS(ns, 'circle');
    c.setAttribute('cx', w/2);
    c.setAttribute('cy', h/2);
    c.setAttribute('r', hole);
    c.setAttribute('fill', 'var(--card)');
    svg.appendChild(c);
    
    donutEl.appendChild(svg);
});