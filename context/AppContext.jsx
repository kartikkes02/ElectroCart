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
        setCartItems(data.user.cartItems)
      } else{
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addToCart = async (itemId) => {
    let cartData = structuredClone(cartItems);
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
    let cartData = structuredClone(cartItems);
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
    let totalCount = 0;
    for (const items in cartItems) {
      if (cartItems[items] > 0) {
        totalCount += cartItems[items];
      }
    }
    return totalCount;
  };

  const getCartAmount = () => {
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
    }
  }, [user]); // Added dependency array

  const value = {
    user,getToken,
    currency,router,
    isSeller,setIsSeller,
    userData,fetchUserData,
    products,fetchProductData,
    cartItems,setCartItems,
    addToCart,updateCartQuantity,
    getCartCount,getCartAmount,
  };

  return (
    <AppContext.Provider value={value}>
        {props.children}
    </AppContext.Provider>
  );
};
