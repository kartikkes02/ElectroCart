import { NextResponse } from "next/server";

// GET handler for fetching user data
export async function GET() {
  console.log("GET /api/user/data called");
  
  try {
    // First, let's try without Clerk to isolate the issue
    console.log("Inside try block");
    
    const userData = {
      message: "API is working",
      timestamp: new Date().toISOString()
    };
    
    console.log("About to return response:", userData);
    return NextResponse.json({ success: true, data: userData });
    
  } catch (error) {
    console.error("Error in GET /api/user/data:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: error.message 
    }, { status: 500 });
  }
}

// POST handler for creating/updating user data
export async function POST(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Add your logic here to handle POST requests
    // For example, save user data to database
    
    return NextResponse.json({ success: true, message: "Data saved successfully" });
  } catch (error) {
    console.error("Error in POST /api/user/data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PUT handler for updating user data
export async function PUT(request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Add your logic here to handle PUT requests
    
    return NextResponse.json({ success: true, message: "Data updated successfully" });
  } catch (error) {
    console.error("Error in PUT /api/user/data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE handler for deleting user data
export async function DELETE() {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Add your logic here to handle DELETE requests
    
    return NextResponse.json({ success: true, message: "Data deleted successfully" });
  } catch (error) {
    console.error("Error in DELETE /api/user/data:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
