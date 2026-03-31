const products = [
  {
    name: 'Handmade Linen Dress',
    image: '/images/dress.png',
    description: 'A beautifully crafted, handmade linen dress. Breezy, natural fabric for effortless everyday wear.',
    category: 'dresses',
    price: 89.99,
    stock: 10,
    sizes: ['S', 'M', 'L'],
    images: ['/images/dress.png']
  },
  {
    name: 'Classic Cotton Shirt',
    image: '/images/shirt.png',
    description: 'Meticulously stitched by artisans for the perfect fit using premium cotton.',
    category: 'shirts',
    price: 59.99,
    stock: 20,
    sizes: ['M', 'L', 'XL'],
    images: ['/images/shirt.png']
  },
  {
    name: 'Beige Casual Pants',
    image: '/images/dress.png', // reusing image for mockup
    description: 'Comfortable handmade pants perfect for any casual occasion.',
    category: 'pants',
    price: 79.99,
    stock: 15,
    sizes: ['32', '34', '36'],
    images: ['/images/dress.png']
  }
];

export default products;
