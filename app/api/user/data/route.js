import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = auth();
    
    // Return cart data structure even without authentication for development
    const cartData = {
      userId: userId || "anonymous",
      cartItems: [], // Initialize as empty array
      totalPrice: 0,
      itemCount: 0
    };
    
    // If you have a database, fetch actual cart data here:
    // const userCart = await fetchCartFromDatabase(userId);
    // if (userCart) {
    //   cartData.cartItems = userCart.items || [];
    //   cartData.totalPrice = userCart.total || 0;
    //   cartData.itemCount = userCart.items?.length || 0;
    // }
    
    return NextResponse.json(cartData);
    
  } catch (error) {
    console.error("Error in GET /api/user/data:", error);
    
    // Always return cartItems structure even on error
    return NextResponse.json({
      userId: null,
      cartItems: [],
      totalPrice: 0,
      itemCount: 0,
      error: "Failed to load cart data"
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId } = auth();
    const body = await request.json();
    
    // Handle adding items to cart
    const { productId, quantity = 1, product } = body;
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }
    
    // Add your cart logic here
    // For now, return success with updated cart
    const updatedCart = {
      userId: userId || "anonymous",
      cartItems: [
        // Your existing cart items would go here
        {
          id: productId,
          quantity,
          ...product
        }
      ],
      totalPrice: (product?.price || 0) * quantity,
      itemCount: 1
    };
    
    return NextResponse.json(updatedCart);
    
  } catch (error) {
    console.error("Error in POST /api/user/data:", error);
    return NextResponse.json({
      cartItems: [],
      error: "Failed to add item to cart"
    }, { status: 500 });
  }
}
