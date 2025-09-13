// create-campaign.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('createPageForm');
    const msg = document.getElementById('createPageMsg');
    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      msg.textContent = '';
      const user = getUser();
      if (!user || user.role !== 'Creator'){ msg.textContent = 'Only creators can create campaigns'; return; }
  
      const title = document.getElementById('title').value.trim();
      const description = document.getElementById('description').value.trim();
      const goal = document.getElementById('goal').value;
      const category = document.getElementById('category').value;
      const docs = document.getElementById('documents').files;
  
      if (!title || !description || !goal){ msg.textContent = 'Fill required fields'; return; }
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('goalAmount', goal);
      fd.append('category', category);
      if (docs) Array.from(docs).forEach(f => fd.append('documents', f));
  
      msg.textContent = 'Creating...';
      const res = await apiFetch('/campaigns', { method:'POST', body: fd });
      if (res.ok){ msg.style.color='green'; msg.textContent = 'Campaign created'; form.reset(); window.location.href = `/campaign-details.html?id=${res.data._id}`; }
      else { msg.style.color='red'; msg.textContent = res.data?.message || 'Failed to create' }
    });
  });
  