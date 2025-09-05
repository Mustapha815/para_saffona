import { toast } from "react-toastify";

const initState = {
  cartItems: localStorage.getItem('cartItems') ? 
             JSON.parse(localStorage.getItem('cartItems')) : [],
  cartAmount: localStorage.getItem('cartAmount') ? 
              JSON.parse(localStorage.getItem('cartAmount')) : 0,
  selectedProduct: null,
  showProductDetails: false,
  selectedPack: null,
  showPackDetails: false,
favoritesCount: localStorage.getItem("favoritesCount")
    ? JSON.parse(localStorage.getItem("favoritesCount"))
    : 0,

};

export const clientReducer = (state = initState, action) => {
  switch (action.type) {
    // Cart Actions
 case 'ADD_TO_CART': {
  const isMobile = window.innerWidth <= 576;
  const product = action.payload;

  // ✅ هنا الشرط يكون بالـ id + isPack
  const findIndex = state.cartItems.findIndex(
    item => item.id === product.id && item.isPack === product.isPack
  );

  if (findIndex >= 0) {
    const updatedCartItems = state.cartItems.map((item, index) =>
      index === findIndex
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    toast.success(
      `Increased ${state.cartItems[findIndex].name} quantity`, 
      {
        position: isMobile ? 'top-left' : 'bottom-left',
        style: isMobile ? { display: 'none' } : {}
      }
    );

    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    localStorage.setItem('cartAmount', JSON.stringify(updatedCartItems.length));

    return {
      ...state,
      cartItems: updatedCartItems,
      cartAmount: updatedCartItems.length
    };
  } else {
    // ✅ نخزن معاه isPack باش نقدر نميز بيناتهم
    const newProduct = { 
      ...product, 
      quantity: 1 
    };
    const updatedCartItems = [...state.cartItems, newProduct];
    
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    localStorage.setItem('cartAmount', JSON.stringify(updatedCartItems.length));
    
    toast.success(`Product ${product.name} added to cart`, {
      position: isMobile ? 'top-left' : 'bottom-left',
      style: isMobile ? { display: 'none' } : {}
    });

    return {
      ...state,
      cartItems: updatedCartItems,
      cartAmount: updatedCartItems.length
    };
  }
}
case 'INCREASE_QUANTITY': {
  const isMobile = window.innerWidth <= 576;
  const { id: productId, isPack } = action.payload;

  const findIndex = state.cartItems.findIndex(
    item => item.id === productId && item.isPack === isPack
  );

  if (findIndex >= 0) {
    const updatedCartItems = state.cartItems.map((item, index) =>
      index === findIndex
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );

    toast.success(`Increased ${state.cartItems[findIndex].name} quantity`, {
      position: isMobile ? 'top-left' : 'bottom-left',
      style: isMobile ? { display: 'none' } : {}
    });

    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));

    return {
      ...state,
      cartItems: updatedCartItems
    };
  }
  return state;
}

case 'DECREASE_QUANTITY': {
  const isMobile = window.innerWidth <= 576;
  const { id: productId, isPack } = action.payload;

  const findIndex = state.cartItems.findIndex(
    item => item.id === productId && item.isPack === isPack
  );

  if (findIndex >= 0) {
    const updatedCartItems = state.cartItems.map((item, index) =>
      index === findIndex
        ? { ...item, quantity: item.quantity - 1 }
        : item
    );

    const filteredCartItems = updatedCartItems.filter(item => item.quantity > 0);

    toast.info(`Decreased ${state.cartItems[findIndex].name} quantity`, {
      position: isMobile ? 'top-left' : 'bottom-left',
      style: isMobile ? { display: 'none' } : {}
    });

    localStorage.setItem('cartItems', JSON.stringify(filteredCartItems));
    localStorage.setItem('cartAmount', JSON.stringify(filteredCartItems.length));

    return {
      ...state,
      cartItems: filteredCartItems,
      cartAmount: filteredCartItems.length
    };
  }
  return state;
}

case 'REMOVE_FROM_CART': {
  const { id: productId, isPack } = action.payload;

  const updatedCartItems = state.cartItems.filter(
    item => !(item.id === productId && item.isPack === isPack)
  );

  localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
  localStorage.setItem('cartAmount', JSON.stringify(updatedCartItems.length));

  return {
    ...state,
    cartItems: updatedCartItems,
    cartAmount: updatedCartItems.length
  };
}


    case 'CLEAR_CART': {
      localStorage.removeItem('cartItems');
      localStorage.removeItem('cartAmount');
      
      return {
        ...state,
        cartItems: [],
        cartAmount: 0
      };
    }

   
      case 'SHOW_PRODUCT_DETAILS':
      return {
        ...state,
        selectedProduct: action.payload,
        showProductDetails: true,
        selectedPack: null,
        showPackDetails: false,
      };

    case 'HIDE_PRODUCT_DETAILS':
      return {
        ...state,
        selectedProduct: null,
        showProductDetails: false,
      };

    case 'SHOW_PACK_DETAILS':
      return {
        ...state,
        selectedPack: action.payload,
        showPackDetails: true,
        selectedProduct: null,
        showProductDetails: false,
      };

    case 'HIDE_PACK_DETAILS':
      return {
        ...state,
        selectedPack: null,
        showPackDetails: false,
      };
    case 'setFvoritesCount':
  localStorage.setItem('favoritesCount', JSON.stringify(action.payload));
  return {
    ...state,
    favoritesCount: action.payload,
  };

    default:
      return state;
  }
};  
