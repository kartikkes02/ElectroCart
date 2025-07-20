// 'use client'
// import { productsDummyData, userDummyData } from "@/assets/assets";
// import { useRouter } from "next/navigation";
// import { createContext, useContext, useEffect, useState } from "react";
// import {useAuth, useUser} from "@clerk/nextjs";

// export const AppContext = createContext();

// export const useAppContext = () => {
//     return useContext(AppContext)
// }

// export const AppContextProvider = (props) => {

//     const currency = process.env.NEXT_PUBLIC_CURRENCY
//     const router = useRouter()

//     const {user} = useUser()
//     const{ getToken } = useAuth()
//     const [products, setProducts] = useState([])
//     const [userData, setUserData] = useState(false)
//     const [isSeller, setIsSeller] = useState(false)
//     const [cartItems, setCartItems] = useState({})

//     const fetchProductData = async () => {
//         setProducts(productsDummyData)
//     }

//     const fetchUserData = async () => {
//         // if(user.publicMetadata.role === 'seller') {
//         //     setIsSeller(true);
//         // }
//         // setUserData(userDummyData)
//         try{
//             if(user.publicMetadata.role === 'seller') {
//                 setIsSeller(true);
//             }
//             setUserData(userDummyData)
//         }catch(error) {

//             }
//         }
//     }

//     const addToCart = async (itemId) => {

//         let cartData = structuredClone(cartItems);
//         if (cartData[itemId]) {
//             cartData[itemId] += 1;
//         }
//         else {
//             cartData[itemId] = 1;
//         }
//         setCartItems(cartData);

//     }

//     const updateCartQuantity = async (itemId, quantity) => {

//         let cartData = structuredClone(cartItems);
//         if (quantity === 0) {
//             delete cartData[itemId];
//         } else {
//             cartData[itemId] = quantity;
//         }
//         setCartItems(cartData)

//     }

//     const getCartCount = () => {
//         let totalCount = 0;
//         for (const items in cartItems) {
//             if (cartItems[items] > 0) {
//                 totalCount += cartItems[items];
//             }
//         }
//         return totalCount;
//     }

//     const getCartAmount = () => {
//         let totalAmount = 0;
//         for (const items in cartItems) {
//             let itemInfo = products.find((product) => product._id === items);
//             if (cartItems[items] > 0) {
//                 totalAmount += itemInfo.offerPrice * cartItems[items];
//             }
//         }
//         return Math.floor(totalAmount * 100) / 100;
//     }

//     useEffect(() => {
//         fetchProductData()
//     }, [])

//     useEffect(() => {
//         fetchUserData()
//     }, [])

//     useEffect(() => {
//         if(user) {
//             fetchUserData()
//         }
//     })

//     const value = {
//         user, getToken,
//         currency, router,
//         isSeller, setIsSeller,
//         userData, fetchUserData,
//         products, fetchProductData,
//         cartItems, setCartItems,
//         addToCart, updateCartQuantity,
//         getCartCount, getCartAmount
//     }

//     return (
//         <AppContext.Provider value={value}>
//             {props.children}
//         </AppContext.Provider>
//     )

"use client";
import { productsDummyData, userDummyData } from "@/assets/assets";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

export const AppContext = createContext();

export const useAppContext = () => {
  return useContext(AppContext);
};

export const AppContextProvider = (props) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY;
  const router = useRouter();

  const { user } = useUser();
  const { getToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [userData, setUserData] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  const fetchProductData = async () => {
    try {
      const { data } = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error(error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      setIsLoading(true); // Set loading to true
      
      if (
        user &&
        user.publicMetadata &&
        user.publicMetadata.role === "seller"
      ) {
        setIsSeller(true);
      }
      
      const token = await getToken();

      const { data } = await axios.get('/api/user/data', { 
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('API Response:', data); // Debug log
      
      if (data && data.success && data.user) {
        setUserData(data.user);
        // FIX: Multiple safety checks
        setCartItems(data.user?.cartItems || {});
      } else {
        console.error('Invalid API response structure:', data);
        toast.error(data?.message || 'Failed to fetch user data');
        setCartItems({}); // Set empty cart on invalid response
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error(`Error fetching user data: ${error.message}`);
      // FIX: Ensure cartItems stays as empty object on error
      setCartItems({});
    } finally {
      setIsLoading(false); // Set loading to false regardless of success/failure
    }
  };

  const addToCart = async (itemId) => {
    // FIX: Add safety check
    if (!cartItems) {
      console.error('cartItems is undefined, initializing...');
      setCartItems({});
      return;
    }

    let cartData = structuredClone(cartItems);
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    
    if (user) {
      try {
        const token = await getToken();
        await axios.post('/api/cart/update', { cartData }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Items added to cart');
      } catch (error) {
        console.error('Error adding to cart:', error);
        toast.error(error.message);
      }
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    // FIX: Add safety check
    if (!cartItems) {
      console.error('cartItems is undefined, initializing...');
      setCartItems({});
      return;
    }

    let cartData = structuredClone(cartItems);
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    
    if (user) {
      try {
        const token = await getToken();
        await axios.post('/api/cart/update', { cartData }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Cart Updated');
      } catch (error) {
        console.error('Error updating cart:', error);
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    // FIX: Add safety check
    if (!cartItems || typeof cartItems !== 'object') {
      return 0;
    }
    
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
    // FIX: Add safety checks
    if (!cartItems || typeof cartItems !== 'object' || !Array.isArray(products)) {
      return 0;
    }

    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      if (cartItems[items] > 0 && itemInfo) {
        totalAmount += itemInfo.offerPrice * cartItems[items];
      }
    }
    return Math.floor(totalAmount * 100) / 100;
  };

  // Fixed: Only run fetchProductData once on mount
  useEffect(() => {
    fetchProductData();
  }, []);

  // Fixed: Only run fetchUserData when user changes
  useEffect(() => {
    if (user) {
      fetchUserData();
    } else {
      // If no user, reset everything and stop loading
      setIsLoading(false);
      setCartItems({});
      setUserData(false);
      setIsSeller(false);
    }
  }, [user]); // Added dependency array

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
    isLoading, // Add loading state to context
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};
