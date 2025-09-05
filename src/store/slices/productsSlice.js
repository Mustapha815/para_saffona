import { createSlice } from '@reduxjs/toolkit';

const initialProducts = [
  {
    id: '1',
    name: 'Argan Oil Serum',
    nameAr: 'سيروم زيت الأركان',
    nameFr: 'Sérum à l\'Huile d\'Argan',
    category: 'skincare',
    price: 120,
    stock: 45,
    minStock: 10,
    expiryDate: '2025-06-15',
    barcode: '123456789012',
    supplier: 'Moroccan Natural',
    description: 'Premium argan oil serum for skin hydration',
    image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '2',
    name: 'Black Seed Oil Capsules',
    nameAr: 'كبسولات زيت الحبة السوداء',
    nameFr: 'Capsules d\'Huile de Nigelle',
    category: 'herbal',
    price: 85,
    stock: 8,
    minStock: 15,
    expiryDate: '2024-12-30',
    barcode: '123456789013',
    supplier: 'Herbal Morocco',
    description: 'Natural black seed oil supplements',
    image: 'https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '3',
    name: 'Rose Water Toner',
    nameAr: 'تونر ماء الورد',
    nameFr: 'Tonique à l\'Eau de Rose',
    category: 'skincare',
    price: 65,
    stock: 30,
    minStock: 10,
    expiryDate: '2025-03-20',
    barcode: '123456789014',
    supplier: 'Atlas Beauty',
    description: 'Natural rose water facial toner',
    image: 'https://images.pexels.com/photos/4041406/pexels-photo-4041406.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '4',
    name: 'Baby Organic Shampoo',
    nameAr: 'شامبو طبيعي للأطفال',
    nameFr: 'Shampooing Bio pour Bébé',
    category: 'babycare',
    price: 45,
    stock: 25,
    minStock: 12,
    expiryDate: '2025-08-10',
    barcode: '123456789015',
    supplier: 'Baby Care MA',
    description: 'Gentle organic shampoo for babies',
    image: 'https://images.pexels.com/photos/7262901/pexels-photo-7262901.jpeg?auto=compress&cs=tinysrgb&w=300'
  },
  {
    id: '5',
    name: 'Vitamin D3 Supplements',
    nameAr: 'مكملات فيتامين د3',
    nameFr: 'Suppléments Vitamine D3',
    category: 'supplements',
    price: 95,
    stock: 40,
    minStock: 20,
    expiryDate: '2025-12-15',
    barcode: '123456789016',
    supplier: 'Pharma Plus',
    description: 'Essential vitamin D3 supplements',
    image: 'https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg?auto=compress&cs=tinysrgb&w=300'
  }
];

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: initialProducts,
  },
  reducers: {
    addProduct: (state, action) => {
      const newProduct = { ...action.payload, id: Date.now().toString() };
      state.items.push(newProduct);
    },
    updateProduct: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(product => product.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deleteProduct: (state, action) => {
      state.items = state.items.filter(product => product.id !== action.payload);
    },
    updateStock: (state, action) => {
      const { productId, quantity } = action.payload;
      const product = state.items.find(p => p.id === productId);
      if (product) {
        product.stock -= quantity;
      }
    },
  },
});

export const { addProduct, updateProduct, deleteProduct, updateStock } = productsSlice.actions;
export default productsSlice.reducer;