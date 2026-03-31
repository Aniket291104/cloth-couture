import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import axios from 'axios';

const ProductCreate = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [images, setImages] = useState([]);
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [sizes, setSizes] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const uploadFileHandler = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const allFiles = Array.from(files);
    if (images.length + allFiles.length > 10) {
      alert('You can upload a maximum of 10 images.');
      return;
    }

    const formData = new FormData();
    allFiles.forEach(file => formData.append('images', file));
    setUploading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      };
      const { data } = await axios.post('http://localhost:5001/api/upload', formData, config);
      setImages(prev => [...prev, ...data]);
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      alert(error.response?.data?.message || 'Error uploading image.');
    }
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')) : null;
    if (!userInfo || userInfo.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const userInfo = JSON.parse(localStorage.getItem('userInfo'));

    if (images.length < 2) {
      setError('A minimum of 2 images are required.');
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token || ''}`,
        },
        withCredentials: true,
      };

      await axios.post('http://localhost:5001/api/products', {
        name,
        price,
        images,
        category,
        countInStock,
        description,
        sizes
      }, config);
      
      alert('Product created successfully');
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-serif">Create Product</CardTitle>
        </CardHeader>
        <form onSubmit={submitHandler}>
          <CardContent className="space-y-4">
            {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input type="text" placeholder="Enter name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input type="number" placeholder="Enter price" value={price} onChange={(e) => setPrice(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Count</label>
                <Input type="number" placeholder="Enter stock" value={countInStock} onChange={(e) => setCountInStock(e.target.value)} required />
              </div>
            </div>

            <div className="p-4 border rounded-md bg-gray-50 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Images (.png, .jpg) - Min 2, Max 10</label>
                <Input type="file" multiple accept="image/png, image/jpeg, image/jpg" onChange={uploadFileHandler} className="bg-white" />
                {uploading && <p className="text-sm text-blue-500">Uploading...</p>}
              </div>
              
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 border rounded overflow-hidden shadow-sm">
                      <img src={img} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                      <button 
                        type="button" 
                        onClick={() => setImages(images.filter((_, i) => i !== idx))} 
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-1 text-xs hover:bg-red-600"
                        title="Remove image"
                      >
                        X
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input type="text" placeholder="Enter category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Sizes (comma separated)</label>
              <Input type="text" placeholder="S, M, L, XL" value={sizes} onChange={(e) => setSizes(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea 
                className="w-full flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>

          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Submitting...' : 'Create Product'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ProductCreate;
