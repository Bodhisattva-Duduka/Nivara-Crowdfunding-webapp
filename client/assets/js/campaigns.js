// campaigns.js - public listing + filter
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('publicGrid');
    const btnAll = document.getElementById('filterAll');
    const btnMed = document.getElementById('filterMedical');
    const btnEdu = document.getElementById('filterEducation');
  
    async function load(category=''){
      grid.innerHTML = 'Loading...';
      const res = await apiFetch('/campaigns');
      if (!res.ok){ grid.innerHTML = '<p class="small">Failed to load</p>'; return; }
      let campaigns = res.data;
      if (category) campaigns = campaigns.filter(c => c.category === category);
      grid.innerHTML = '';
      if (campaigns.length === 0){ grid.innerHTML = '<p class="small">No campaigns found</p>'; return; }
      campaigns.forEach(c => {
        const div = document.createElement('div'); div.className = 'card campaign-card';
        const img = c.documents && c.documents.length ? `${FILE_BASE}/${c.documents[0]}` : '';
        const raised = c.raisedAmount || 0; const pct = Math.min(100, Math.round((raised/(c.goalAmount||1))*100));
        div.innerHTML = `
          ${img? `<img src="${img}" class="campaign-img" />` : ''}
          <h3>${escapeHtml(c.title)}</h3>
          <p class="muted">${c.category}</p>
          <p>${escapeHtml((c.description||'').substring(0,150))}...</p>
          <div class="progress-bar"><div class="progress" style="width:${pct}%"></div></div>
          <p class="small">₹${raised} raised of ₹${c.goalAmount}</p>
          <div style="display:flex;gap:8px"><a class="btn" href="/campaign-details.html?id=${c._id}">View</a></div>
        `;
        grid.appendChild(div);
      });
    }
  
    btnAll?.addEventListener('click', ()=>load(''));
    btnMed?.addEventListener('click', ()=>load('Medical'));
    btnEdu?.addEventListener('click', ()=>load('Education'));
  
    function escapeHtml(s){ if(!s) return ''; return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    load();
  });
  