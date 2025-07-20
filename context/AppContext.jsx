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
  const [cartItems, setCartItems] = useState({}); // This stays as object

  const fetchProductData = async () => {
    // setProducts(productsDummyData);
    try {
      const {data} = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      if (
        user &&
        user.publicMetadata &&
        user.publicMetadata.role === "seller"
      ) {
        setIsSeller(true);
      }
      
      const token = await getToken()

      const { data } = await axios.get('/api/user/data',{ headers: { Authorization: `Bearer ${token}`}})
      if(data.success) {
        setUserData(data.user)
        // ✅ FIX: Always ensure cartItems is an object, never undefined
        setCartItems(data.user.cartItems || {})
      } else{
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.message);
      // ✅ FIX: Set empty object on error to prevent undefined
      setCartItems({});
    }
  };

  const addToCart = async (itemId) => {
    // ✅ FIX: Ensure cartItems is always an object
    let cartData = structuredClone(cartItems || {});
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken()
        await axios.post('/api/cart/update',{cartData},{headers:{Authorization: `Bearer ${token}`}});
        toast.success('Items added to cart');
      } catch (error) {
        toast.error(error.message);
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
  const [cartItems, setCartItems] = useState({}); // This stays as object

  const fetchProductData = async () => {
    // setProducts(productsDummyData);
    try {
      const {data} = await axios.get('/api/product/list');
      if (data.success) {
        setProducts(data.products);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchUserData = async () => {
    try {
      if (
        user &&
        user.publicMetadata &&
        user.publicMetadata.role === "seller"
      ) {
        setIsSeller(true);
      }
      
      const token = await getToken()

      const { data } = await axios.get('/api/user/data',{ headers: { Authorization: `Bearer ${token}`}})
      if(data.success) {
        setUserData(data.user)
        // ✅ FIX: Always ensure cartItems is an object, never undefined
        setCartItems(data.user.cartItems || {})
      } else{
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(error.message);
      // ✅ FIX: Set empty object on error to prevent undefined
      setCartItems({});
    }
  };

  const addToCart = async (itemId) => {
    // ✅ FIX: Ensure cartItems is always an object
    let cartData = structuredClone(cartItems || {});
    if (cartData[itemId]) {
      cartData[itemId] += 1;
    } else {
      cartData[itemId] = 1;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken()
        await axios.post('/api/cart/update',{cartData},{headers:{Authorization: `Bearer ${token}`}});
        toast.success('Items added to cart');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const updateCartQuantity = async (itemId, quantity) => {
    // ✅ FIX: Ensure cartItems is always an object
    let cartData = structuredClone(cartItems || {});
    if (quantity === 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }
    setCartItems(cartData);
    if (user) {
      try {
        const token = await getToken()
        await axios.post('/api/cart/update',{cartData},{headers:{Authorization: `Bearer ${token}`}});
        toast.success('Cart Updated');
      } catch (error) {
        toast.error(error.message);
      }
    }
  };

  const getCartCount = () => {
    // ✅ FIX: Handle case when cartItems might be undefined
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
    // ✅ FIX: Handle case when cartItems might be undefined
    if (!cartItems || typeof cartItems !== 'object') {
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
      // ✅ FIX: Clear cart when user logs out
      setCartItems({});
      setUserData(false);
      setIsSeller(false);
    }
  }, [user]); // Added dependency array

  const value = {
    user,getToken,
    currency,router,
    isSeller,setIsSeller,
    userData,fetchUserData,
    products,fetchProductData,
    cartItems: cartItems || {}, // ✅ FIX: Always provide fallback
    setCartItems,
    addToCart,updateCartQuantity,
    getCartCount,getCartAmount,
  };

  return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
  );
};    </AppContext.Provider>
  );
};
