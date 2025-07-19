import { inngest } from "@/config/inngest";
import { getAuth } from "@clerk/nextjs/server";
import { err } from "inngest/types";
import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const {userId} = getAuth(request)
        const {address,items} = await request.json();

        if (!address || items.kength === 0) {
            return NextResponse.json({success:false, message: 'invalid data'});
        }

        //calculate amount using items
        const amount = await items.reduce(async(acc,item)=>{
            const product = await Product.findById(item.product);
            return await acc + product.offerPrice * item.quantity;
        },0)

        await inngest.send({
            name: 'order/created',
            data: {
                address,
                amount,
                items,
                amount: amount + Math.floor(amount * 0.02),
                date: Date.now()
            }
        })
        // clear user cart
        const user = await User.findById(userId)
        user.cartItems = {}
        await user.save()
        return NextResponse.json({success:true, message:'Order Placed'})
    } catch (error) {
        console.log(error)
        return NextResponse.json({success:false, message: error.message})
    }
}