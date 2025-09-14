// main.js - helper used by all pages
const API_BASE = "http://localhost:5000/api";
const FILE_BASE = "http://localhost:5000";

function setToken(token){
  localStorage.setItem("token", token);
}
function getToken(){
  return localStorage.getItem("token");
}
function clearToken(){
  localStorage.removeItem("token");
}
function setUser(user){
  localStorage.setItem("user", JSON.stringify(user));
}
function getUser(){
  try{ return JSON.parse(localStorage.getItem("user")); }catch(e){ return null; }
}
function clearUser(){ localStorage.removeItem("user"); }

// apiFetch wrapper
async function apiFetch(path, opts = {}){
  // path is full path after /api, e.g. '/auth/login' or '/campaigns'
  const token = getToken();
  const headers = opts.headers ? { ...opts.headers } : {};
  if (token) headers['Authorization'] = 'Bearer ' + token;

  const config = { method: opts.method || 'GET', headers };

  if (opts.body){
    if (opts.body instanceof FormData){
      // ✅ Let browser set Content-Type with boundary automatically
      config.body = opts.body;
    } else {
      headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(opts.body);
    }
  }

  try {
    const res = await fetch(API_BASE + path, config);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch(e){ data = text; }
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.error("API Fetch Error:", err);  // ✅ extra logging for debugging
    return { ok:false, status:0, data: { message: err.message } };
  }
}
document.addEventListener('DOMContentLoaded', async () => {
  // Animate stats (example)
  function animateValue(id, start, end, duration, prefix='') {
    let obj = document.getElementById(id);
    let startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      let progress = Math.min((timestamp - startTime) / duration, 1);
      obj.textContent = prefix + Math.floor(progress * (end - start) + start);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Example: load stats from API
  const res = await apiFetch('/campaigns');
  if (res.ok) {
    const campaigns = res.data;
    animateValue('stat-campaigns', 0, campaigns.length, 1000, '');
    animateValue('stat-raised', 0, campaigns.reduce((s,c)=>s+(c.raisedAmount||0),0), 1500, '₹');
    animateValue('stat-medical', 0, campaigns.filter(c=>c.category==='Medical').length, 1000);
    animateValue('stat-education', 0, campaigns.filter(c=>c.category==='Education').length, 1000);

    // Show 3 featured campaigns
    const container = document.getElementById('featuredCampaigns');
    campaigns.slice(0,3).forEach(c=>{
      const raised = c.raisedAmount || 0;
      const pct = Math.min(100, Math.round((raised/(c.goalAmount||1))*100));
      const div = document.createElement('div');
      div.className = 'col-md-4';
      div.innerHTML = `
        <div class="campaign-card h-100">
          <span class="badge bg-danger mb-2">${c.category}</span>
          <h5>${c.title}</h5>
          <p class="small text-muted">${c.description.substring(0,100)}...</p>
          <div class="progress my-2" style="height:8px;">
            <div class="progress-bar bg-primary" style="width:${pct}%"></div>
          </div>
          <p class="small">₹${raised} of ₹${c.goalAmount}</p>
          <a href="/campaign-details.html?id=${c._id}" class="btn btn-sm btn-outline-primary">View Details</a>
          <a href="/campaign-details.html?id=${c._id}" class="btn btn-sm btn-success ms-2">Donate</a>
        </div>
      `;
      container.appendChild(div);
    });
  }
});
