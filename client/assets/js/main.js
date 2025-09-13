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
