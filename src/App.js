import React, { createContext, useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "./index.css";

const API_URL = "https://fakestoreapi.com/products";
const ProductContext = createContext();

const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    axios.get(API_URL).then((res) => setProducts(res.data));
  }, []);

  const addProduct = async (product) => {
    const res = await axios.post(API_URL, product);
    setProducts([...products, res.data]);
  };

  const updateProduct = async (id, updatedProduct) => {
    await axios.put(`${API_URL}/${id}`, updatedProduct);
    setProducts(products.map((p) => (p.id === id ? updatedProduct : p)));
  };

  const deleteProduct = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct }}>
      {children}
    </ProductContext.Provider>
  );
};

const ProductList = () => {
  const { products, deleteProduct } = React.useContext(ProductContext);
  return (
    <div className="container">
      <h2 className="title">Products</h2>
      <Link to="/add" className="btn primary">Add Product</Link>
      <div className="product-list">
        {products.map((p) => (
          <div key={p.id} className="product-card">
            <img src={p.image} alt={p.title} className="product-image" />
            <h3 className="product-title">{p.title}</h3>
            <p className="product-price">${p.price}</p>
            <div className="actions">
              <Link to={`/product/${p.id}`} className="btn view">View</Link>
              <Link to={`/edit/${p.id}`} className="btn edit">Edit</Link>
              <button onClick={() => deleteProduct(p.id)} className="btn delete">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/${id}`).then((res) => setProduct(res.data));
  }, [id]);

  return product ? (
    <div className="product-detail">
      <img src={product.image} alt={product.title} className="detail-image" />
      <h2>{product.title}</h2>
      <p>{product.description}</p>
      <p className="product-price">Price: ${product.price}</p>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

const ProductForm = ({ isEdit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addProduct, updateProduct, products } = React.useContext(ProductContext);
  const [form, setForm] = useState({ title: "", price: "", description: "", image: "" });

  useEffect(() => {
    if (isEdit && id) {
      const product = products.find((p) => p.id === Number(id));
      if (product) setForm(product);
    }
  }, [id, isEdit, products]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEdit) {
      updateProduct(Number(id), form);
    } else {
      addProduct(form);
    }
    navigate("/");
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" />
      <input placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
      <input placeholder="Image URL" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input" />
      <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="textarea" />
      <button type="submit" className="btn submit">{isEdit ? "Update" : "Add"} Product</button>
    </form>
  );
};

const App = () => (
  <Router>
    <ProductProvider>
      <Routes>
        <Route path="/" element={<ProductList />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/add" element={<ProductForm isEdit={false} />} />
        <Route path="/edit/:id" element={<ProductForm isEdit={true} />} />
      </Routes>
    </ProductProvider>
  </Router>
);

export default App;
