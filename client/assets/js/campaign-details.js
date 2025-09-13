// campaign-details.js
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      document.getElementById('detailCard').innerHTML = '<p>Invalid campaign ID</p>';
      return;
    }
  
    const title = document.getElementById('c-title');
    const cat = document.getElementById('c-category');
    const desc = document.getElementById('c-description');
    const goalEl = document.getElementById('c-goal');
    const raisedEl = document.getElementById('c-raised');
    const progressEl = document.getElementById('c-progress');
    const statusEl = document.getElementById('c-status');
    const donorsList = document.getElementById('donorsList');
    const donateForm = document.getElementById('donateForm');
    const donateMsg = document.getElementById('donate-msg');
    const docsContainer = document.getElementById('c-documents'); // must exist in campaign-details.html
  
    async function load() {
      const res = await apiFetch(`/campaigns/${id}`);
      if (!res.ok) {
        document.getElementById('detailCard').innerHTML = '<p>Failed to load campaign</p>';
        return;
      }
      const c = res.data;
  
      // Basic campaign info
      title.textContent = c.title;
      cat.textContent = c.category;
      desc.textContent = c.description;
      goalEl.textContent = c.goalAmount;
      raisedEl.textContent = c.raisedAmount || 0;
      statusEl.textContent = c.status || 'Active';
  
      const pct = Math.min(
        100,
        Math.round(((c.raisedAmount || 0) / (c.goalAmount || 1)) * 100)
      );
      progressEl.style.width = pct + '%';
  
      // Documents rendering
      docsContainer.innerHTML = '';
      if (c.documents && c.documents.length) {
        c.documents.forEach(file => {
          // file should be the stored filename, e.g. "1757798782517-documents.pdf"
          const fileUrl = `http://localhost:5000${file}`;
          const ext = file.split('.').pop().toLowerCase();
  
          if (ext === 'pdf') {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.target = '_blank';
            link.textContent = 'View PDF';
            link.className = 'campaign-doc-link btn btn-sm btn-outline-danger d-block mb-2';
            docsContainer.appendChild(link);
          } else {
            const link = document.createElement('a');
            link.href = fileUrl;
            link.target = '_blank';
            link.textContent = 'Download File';
            link.className = 'campaign-doc-link btn btn-sm btn-outline-secondary d-block mb-2';
            docsContainer.appendChild(link);
          }
        });
      }
  
      // Donors list
      donorsList.innerHTML = '';
      (c.donors || []).forEach(d => {
        const li = document.createElement('li');
        li.textContent = `₹${d.amount} by ${d.donor?.name || 'Anonymous'} on ${new Date(
          d.donatedAt
        ).toLocaleString()}`;
        donorsList.appendChild(li);
      });
    }
  
    // Donation form submit
    donateForm?.addEventListener('submit', async e => {
      e.preventDefault();
      donateMsg.textContent = '';
      const amount = Number(document.getElementById('donation-amount').value);
      if (!amount || amount <= 0) {
        donateMsg.textContent = 'Enter valid amount';
        return;
      }
      const token = getToken();
      if (!token) {
        window.location.href = '/login.html';
        return;
      }
  
      donateMsg.textContent = 'Processing...';
      const res = await apiFetch(`/donations/${id}`, {
        method: 'POST',
        body: { amount }
      });
      if (res.ok) {
        donateMsg.style.color = 'green';
        donateMsg.textContent = 'Thank you for your donation!';
        donateForm.reset && donateForm.reset();
        await load();
      } else {
        donateMsg.style.color = 'red';
        donateMsg.textContent = res.data?.message || 'Donation failed';
      }
    });
  
    await load();
  });
  