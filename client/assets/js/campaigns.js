// campaigns.js - public listing + filter
document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('publicGrid');
    const btnAll = document.getElementById('filterAll');
    const btnMed = document.getElementById('filterMedical');
    const btnEdu = document.getElementById('filterEducation');
  
    async function load(category = '') {
      grid.innerHTML = '<p class="text-muted">Loading campaigns...</p>';
      const res = await apiFetch('/campaigns');
      if (!res.ok) {
        grid.innerHTML = '<p class="small text-danger">Failed to load campaigns</p>';
        return;
      }
  
      let campaigns = res.data;
      if (category) campaigns = campaigns.filter(c => c.category === category);
  
      grid.innerHTML = '';
      if (campaigns.length === 0) {
        grid.innerHTML = '<p class="small text-muted">No campaigns found</p>';
        return;
      }
  
      campaigns.forEach(c => {
        const col = document.createElement('div');
        col.className = 'col-md-4';
  
        const raised = c.raisedAmount || 0;
        const pct = Math.min(100, Math.round((raised / (c.goalAmount || 1)) * 100));
  
        col.innerHTML = `
          <div class="card h-100 shadow-sm">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${escapeHtml(c.title)}</h5>
              <p class="card-text small text-secondary mb-1">${c.category}</p>
              <p class="card-text">${escapeHtml((c.description || '').substring(0, 100))}...</p>
              <div class="progress mb-2" style="height:6px;">
                <div class="progress-bar bg-success" role="progressbar" style="width:${pct}%;"></div>
              </div>
              <p class="small mb-2">₹${raised} raised of ₹${c.goalAmount}</p>
              <a class="btn btn-primary mt-auto" href="/campaign-details.html?id=${c._id}">View Details</a>
            </div>
          </div>
        `;
        grid.appendChild(col);
      });
    }
  
    function escapeHtml(s) {
      if (!s) return '';
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
  
    btnAll?.addEventListener('click', () => load(''));
    btnMed?.addEventListener('click', () => load('Medical'));
    btnEdu?.addEventListener('click', () => load('Education'));
  
    load();
  });
  