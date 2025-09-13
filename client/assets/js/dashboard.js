// dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const logoutBtn = document.getElementById('logoutBtn');
    const userGreeting = document.getElementById('userGreeting');
    const donorView = document.getElementById('donorView');
    const creatorView = document.getElementById('creatorView');
    const campaignGrid = document.getElementById('campaignGrid');
    const myCampaigns = document.getElementById('myCampaigns');
    const createForm = document.getElementById('createForm');
    const createMsg = document.getElementById('create-msg');
  
    const token = getToken();
    if (!token) { window.location.href = '/login.html'; return; }
  
    // load profile
    const me = await apiFetch('/auth/me');
    if (!me.ok){ clearToken(); clearUser(); window.location.href='/login.html'; return; }
    const user = me.data;
    setUser(user);
    userGreeting.innerHTML = `<div class="small">Welcome, <strong>${user.name}</strong> — <span class="muted">${user.role}</span></div>`;
  
    // logout
    logoutBtn?.addEventListener('click', () => {
      clearToken(); clearUser(); window.location.href = '/login.html';
    });
  
    // Fetch all campaigns (public) and render
    async function loadCampaigns(){
      campaignGrid.innerHTML = 'Loading...';
      const res = await apiFetch('/campaigns');
      if (!res.ok){ campaignGrid.innerHTML = '<p class="small">Failed to load campaigns</p>'; return; }
      const campaigns = res.data;
      campaignGrid.innerHTML = '';
      campaigns.forEach(renderCampaignCard);
    }
  
    function renderCampaignCard(c){
      const div = document.createElement('div'); div.className = 'card campaign-card';
      const imgSrc = c.documents && c.documents.length ? (FILE_BASE + '/' + c.documents[0]) : '';
      const raised = c.raisedAmount || 0;
      const goal = c.goalAmount || 1;
      const pct = Math.min(100, Math.round((raised/goal)*100));
      div.innerHTML = `
        ${imgSrc ? `<img src="${imgSrc}" class="campaign-img" />` : ''}
        <h3>${escapeHtml(c.title)}</h3>
        <p class="muted">${c.category} • ${c.creator?.name || 'Creator'}</p>
        <p>${escapeHtml((c.description||'').substring(0,160))}...</p>
        <div class="progress-bar"><div class="progress" style="width:${pct}%"></div></div>
        <p class="small">₹${raised} raised of ₹${goal} • ${pct}%</p>
        <div style="display:flex;gap:8px">
          <a class="btn" href="/campaign-details.html?id=${c._id}">View Details</a>
        </div>
      `;
      campaignGrid.appendChild(div);
    }
  
    // Render creator's campaigns
    async function loadMyCampaigns(){
      myCampaigns.innerHTML = 'Loading...';
      const res = await apiFetch('/campaigns');
      if (!res.ok){ myCampaigns.innerHTML = '<p class="small">Failed to load</p>'; return; }
      const campaigns = res.data.filter(x => x.creator?._id === user._id || x.creator === user._id);
      myCampaigns.innerHTML = '';
      if (campaigns.length === 0) myCampaigns.innerHTML = '<p class="small">You have not created any campaigns yet.</p>';
      campaigns.forEach(c => {
        const div = document.createElement('div'); div.className='card campaign-card';
        const imgSrc = c.documents && c.documents.length ? (FILE_BASE + '/' + c.documents[0]) : '';
        const raised = c.raisedAmount || 0; const pct = Math.min(100, Math.round((raised/(c.goalAmount||1))*100));
        div.innerHTML = `
          ${imgSrc? `<img src="${imgSrc}" class="campaign-img" />` : ''}
          <h3>${escapeHtml(c.title)}</h3>
          <p class="muted">${c.category}</p>
          <div class="progress-bar"><div class="progress" style="width:${pct}%"></div></div>
          <p class="small">₹${raised} raised of ₹${c.goalAmount}</p>
          <div style="display:flex;gap:8px">
            <a class="link" href="/campaign-details.html?id=${c._id}">View</a>
          </div>
        `;
        myCampaigns.appendChild(div);
      });
    }
  
    // Create campaign handler (creator only)
    if (createForm){
      createForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        createMsg.textContent = '';
        if (user.role !== 'Creator'){ createMsg.textContent = 'Only campaign creators can create campaigns'; return; }
  
        const title = document.getElementById('c-title').value.trim();
        const description = document.getElementById('c-description').value.trim();
        const goal = document.getElementById('c-goal').value;
        const category = document.getElementById('c-category').value;
        const inputFiles = document.getElementById('c-docs');
  
        if (!title || !description || !goal){ createMsg.textContent = 'Please fill required fields'; return; }
  
        const fd = new FormData();
        fd.append('title', title);
        fd.append('description', description);
        fd.append('goalAmount', goal);
        fd.append('category', category);
        if (inputFiles && inputFiles.files){
          Array.from(inputFiles.files).forEach(f => fd.append('documents', f));
        }
  
        createMsg.textContent = 'Creating...';
        const res = await apiFetch('/campaigns', { method:'POST', body: fd });
        if (res.ok){
          createMsg.style.color = 'green'; createMsg.textContent = 'Campaign created!';
          createForm.reset();
          await loadMyCampaigns();
          await loadCampaigns();
        } else {
          createMsg.style.color = 'red'; createMsg.textContent = res.data?.message || 'Failed to create';
        }
      });
    }
  
    // display appropriate view for role
    if (user.role === 'Donor'){ donorView.classList.remove('hidden'); await loadCampaigns(); }
    if (user.role === 'Creator'){ creatorView.classList.remove('hidden'); await loadMyCampaigns(); await loadCampaigns(); }
  
    // helper to escape HTML
    function escapeHtml(s){
      if(!s) return '';
      return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }
  
  });
  