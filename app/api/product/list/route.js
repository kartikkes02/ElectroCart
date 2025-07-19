import { connect } from "mongoose";
import { NextResponse } from "next/server";
import connectDB from "@/config/db";
import Product from "@/models/Product";

export async function GET(request) {
    try {
        // const { userId } = getAuth(request);
        // const isSeller = authSeller(userId);

        // if(!isSeller) {
        //     return NextResponse.json({success: false, message: 'not authorized'});
        // }
        

        await connectDB();
        const products = await Product.find({});
        return NextResponse.json({success: true, products});
    } catch (error) {
        return NextResponse.json({success: false, message: error.message});
    }
}
