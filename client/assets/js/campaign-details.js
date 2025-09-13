// campaign-details.js
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id){ document.getElementById('detailCard').innerHTML = '<p>Invalid campaign ID</p>'; return; }
  
    const title = document.getElementById('c-title');
    const cat = document.getElementById('c-category');
    const imgEl = document.getElementById('c-image');
    const desc = document.getElementById('c-description');
    const goalEl = document.getElementById('c-goal');
    const raisedEl = document.getElementById('c-raised');
    const progressEl = document.getElementById('c-progress');
    const statusEl = document.getElementById('c-status');
    const donorsList = document.getElementById('donorsList');
    const donateForm = document.getElementById('donateForm');
    const donateMsg = document.getElementById('donate-msg');
  
    async function load(){
      const res = await apiFetch(`/campaigns/${id}`);
      if (!res.ok){ document.getElementById('detailCard').innerHTML = '<p>Failed to load campaign</p>'; return; }
      const c = res.data;
      title.textContent = c.title;
      cat.textContent = c.category;
      desc.textContent = c.description;
      goalEl.textContent = c.goalAmount;
      raisedEl.textContent = c.raisedAmount || 0;
      statusEl.textContent = c.status || 'Active';
      const pct = Math.min(100, Math.round(((c.raisedAmount||0)/(c.goalAmount||1))*100));
      progressEl.style.width = pct + '%';
      if (c.documents && c.documents.length){
        imgEl.src = `${FILE_BASE}/${c.documents[0]}`; imgEl.style.display='block';
      } else imgEl.style.display='none';
  
      donorsList.innerHTML = '';
      (c.donors || []).forEach(d => {
        const li = document.createElement('li');
        li.textContent = `₹${d.amount} by ${d.donor?.name || 'Anonymous'} on ${new Date(d.donatedAt).toLocaleString()}`;
        donorsList.appendChild(li);
      });
    }
  
    donateForm?.addEventListener('submit', async (e) => {
      e.preventDefault();
      donateMsg.textContent = '';
      const amount = Number(document.getElementById('donation-amount').value);
      if (!amount || amount <= 0){ donateMsg.textContent = 'Enter valid amount'; return; }
      const token = getToken();
      if (!token){ window.location.href = '/login.html'; return; }
  
      donateMsg.textContent = 'Processing...';
      const res = await apiFetch(`/donations/${id}`, { method:'POST', body:{ amount } });
      if (res.ok){
        donateMsg.style.color='green'; donateMsg.textContent = 'Thank you for your donation!';
        donationForm.reset && donationForm.reset();
        await load();
      } else {
        donateMsg.style.color='red'; donateMsg.textContent = res.data?.message || 'Donation failed';
      }
    });
  
    await load();
  });
  