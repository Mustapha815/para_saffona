import { createSlice } from '@reduxjs/toolkit';

const initialCategories = [
  {
    id: '1',
    name: 'Skincare',
    nameAr: 'العناية بالبشرة',
    nameFr: 'Soins de la Peau',
    description: 'Products for skin health and beauty',
    descriptionAr: 'منتجات للعناية بصحة وجمال البشرة',
    descriptionFr: 'Produits pour la santé et la beauté de la peau',
    image: 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    sortOrder: 1,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Hair Care',
    nameAr: 'العناية بالشعر',
    nameFr: 'Soins Capillaires',
    description: 'Shampoos, conditioners and hair treatments',
    descriptionAr: 'شامبو وبلسم وعلاجات الشعر',
    descriptionFr: 'Shampooings, après-shampooings et traitements capillaires',
    image: 'https://images.pexels.com/photos/3993449/pexels-photo-3993449.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    sortOrder: 2,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '3',
    name: 'Supplements',
    nameAr: 'المكملات الغذائية',
    nameFr: 'Compléments Alimentaires',
    description: 'Vitamins, minerals and dietary supplements',
    descriptionAr: 'الفيتامينات والمعادن والمكملات الغذائية',
    descriptionFr: 'Vitamines, minéraux et compléments alimentaires',
    image: 'https://images.pexels.com/photos/3683083/pexels-photo-3683083.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    sortOrder: 3,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Baby & Maternity',
    nameAr: 'الطفل والأمومة',
    nameFr: 'Bébé & Maternité',
    description: 'Products for babies and expecting mothers',
    descriptionAr: 'منتجات للأطفال والأمهات الحوامل',
    descriptionFr: 'Produits pour bébés et futures mamans',
    image: 'https://images.pexels.com/photos/7262901/pexels-photo-7262901.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    sortOrder: 4,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '5',
    name: 'Personal Hygiene',
    nameAr: 'النظافة الشخصية',
    nameFr: 'Hygiène Personnelle',
    description: 'Personal care and hygiene products',
    descriptionAr: 'منتجات العناية الشخصية والنظافة',
    descriptionFr: 'Produits de soins personnels et d\'hygiène',
    image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    sortOrder: 5,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '6',
    name: 'Herbal Remedies',
    nameAr: 'العلاجات العشبية',
    nameFr: 'Remèdes à Base de Plantes',
    description: 'Natural and herbal health products',
    descriptionAr: 'المنتجات الصحية الطبيعية والعشبية',
    descriptionFr: 'Produits de santé naturels et à base de plantes',
    image: 'https://images.pexels.com/photos/3825581/pexels-photo-3825581.jpeg?auto=compress&cs=tinysrgb&w=400',
    isActive: true,
    sortOrder: 6,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    items: initialCategories,
  },
  reducers: {
    addCategory: (state, action) => {
      const newCategory = {
        ...action.payload,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        isActive: true,
        sortOrder: state.items.length + 1
      };
      state.items.push(newCategory);
    },
    updateCategory: (state, action) => {
      const { id, ...updates } = action.payload;
      const index = state.items.findIndex(category => category.id === id);
      if (index !== -1) {
        state.items[index] = { ...state.items[index], ...updates };
      }
    },
    deleteCategory: (state, action) => {
      state.items = state.items.filter(category => category.id !== action.payload);
    },
    toggleCategoryStatus: (state, action) => {
      const category = state.items.find(cat => cat.id === action.payload);
      if (category) {
        category.isActive = !category.isActive;
      }
    },
    reorderCategories: (state, action) => {
      const { categoryId, newOrder } = action.payload;
      const category = state.items.find(cat => cat.id === categoryId);
      if (category) {
        category.sortOrder = newOrder;
      }
      // Sort items by sortOrder
      state.items.sort((a, b) => a.sortOrder - b.sortOrder);
    }
  },
});

export const { 
  addCategory, 
  updateCategory, 
  deleteCategory, 
  toggleCategoryStatus, 
  reorderCategories 
} = categoriesSlice.actions;
export default categoriesSlice.reducer;