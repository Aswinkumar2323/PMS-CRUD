import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [view, setView] = useState('login'); // 'login', 'register', 'dashboard'
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || '');
  
  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  
  // Dashboard State
  const [products, setProducts] = useState([]);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodPrice, setProdPrice] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editPrice, setEditPrice] = useState('');

  // Setup Axios Interceptor
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(config => {
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [token]);

  // Fetch Products when entering dashboard
  useEffect(() => {
    if (token && view === 'dashboard') {
      fetchProducts();
    }
  }, [token, view]);

  // If token exists on load, go to dashboard
  useEffect(() => {
    if (token) setView('dashboard');
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = view === 'login' ? '/auth/login' : '/auth/register';
      const payload = view === 'login' ? { email, password } : { name, email, password, role };
      const { data } = await axios.post(`${API_URL}${endpoint}`, payload);
      
      setToken(data.token);
      setUserRole(data.role);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      setView('dashboard');
      // clear fields
      setEmail(''); setPassword(''); setName('');
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication failed');
    }
  };

  const logout = () => {
    setToken('');
    setUserRole('');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setView('login');
  };

  const fetchProducts = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/products`);
      setProducts(data);
    } catch (err) {
      console.error('Failed to fetch products');
    }
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/products`, {
        name: prodName, description: prodDesc, price: Number(prodPrice)
      });
      setProdName(''); setProdDesc(''); setProdPrice('');
      fetchProducts();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  const deleteProduct = async (id) => {
    try {
      await axios.delete(`${API_URL}/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const startEdit = (product) => {
    setEditingId(product._id);
    setEditName(product.name);
    setEditDesc(product.description || '');
    setEditPrice(product.price);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const updateProduct = async (id) => {
    try {
      await axios.put(`${API_URL}/products/${id}`, {
        name: editName, description: editDesc, price: Number(editPrice)
      });
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update product');
    }
  };

  return (
    <div className="app-container">
      {view !== 'dashboard' ? (
        <div className="glass-card">
          <h2>{view === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <form onSubmit={handleAuth}>
            {view === 'register' && (
              <>
                <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="USER">Regular User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </>
            )}
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" className="btn-primary">
              {view === 'login' ? 'Log In' : 'Sign Up'}
            </button>
          </form>
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button className="btn-text" onClick={() => setView(view === 'login' ? 'register' : 'login')}>
              {view === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card">
          <div className="header-row">
            <h2>Dashboard <span style={{fontSize:'1rem', color:'var(--text-muted)'}}>({userRole})</span></h2>
            <button onClick={logout} className="btn-danger">Logout</button>
          </div>

          <form onSubmit={addProduct} style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <input type="text" placeholder="Product Name" value={prodName} onChange={e => setProdName(e.target.value)} required />
              <input type="number" placeholder="Price" value={prodPrice} onChange={e => setProdPrice(e.target.value)} required />
            </div>
            <input type="text" placeholder="Description" value={prodDesc} onChange={e => setProdDesc(e.target.value)} />
            <button type="submit" className="btn-primary">Add Product</button>
          </form>

          <h3>Your Products</h3>
          <div className="product-list">
            {products.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No products found.</p>
            ) : (
              products.map(p => (
                <div key={p._id} className="product-item">
                  {editingId === p._id ? (
                    <>
                      <div className="product-info" style={{ flex: 1 }}>
                        <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                        <input type="text" value={editDesc} onChange={e => setEditDesc(e.target.value)} style={{ marginTop: '0.5rem' }} />
                        <input type="number" value={editPrice} onChange={e => setEditPrice(e.target.value)} style={{ marginTop: '0.5rem' }} />
                      </div>
                      <div className="btn-group">
                        <button onClick={() => updateProduct(p._id)} className="btn-save" title="Save">✓</button>
                        <button onClick={cancelEdit} className="btn-cancel" title="Cancel">✕</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="product-info">
                        <h3>{p.name}</h3>
                        <p>{p.description}</p>
                        <div className="price">Rs {p.price}</div>
                      </div>
                      <div className="btn-group">
                        <button onClick={() => startEdit(p)} className="btn-edit" title="Edit">✏️</button>
                        <button onClick={() => deleteProduct(p._id)} className="btn-danger">Delete</button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
