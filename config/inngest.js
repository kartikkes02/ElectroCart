// import User from "@/models/User";
// import { Inngest } from "inngest";
// import { connectDB } from "@/lib/mongodb";

// // Create a client to send and receive events
// export const inngest = new Inngest({ id: "electrocart" });

// // Inngest function to save data

// export const syncUserCreation = inngest.createFunction(
// {
//     id: 'sync-user-from-clerk'
// },
// {
//     event: 'clerk/user.created'
// },
// async ({event}) => {
//     const { id, first_name, last_name, email_addresses, image_url } = event.data;
//     const userData = {
//         _id: id,
//         name: first_name + last_name,
//         email: email_addresses[0].email_address,
//         imageURL: image_url,
//     };
//     await connectDB(
//         await User.create(userData)
//     )
// })

// // Inngest Function to update user data

// export const syncUserUpdate = inngest.createFunction(
//     {
//         id: 'update-user-from-clerk'
//     },
//     {
//         event: 'clerk/user.updated'
//     },
//     async ({event}) => {
//         const { id, first_name, last_name, email_addresses, image_url } = event.data;
//         const userData = {
//             _id: id,
//             name: first_name + last_name,
//             email: email_addresses[0].email_address,
//             imageURL: image_url,
//         };
//         await connectDB(
//             await User.findByIdAndUpdate(id, userData)
//         );
//     }
// )

// // Inngest Function to delete user
// export const syncUserDeletion = inngest.createFunction(
//     {
//         id: 'delete-user-with-clerk'
//     },
//     {
//         event: 'clerk/user.deleted'
//     },
//     async ({event}) => {
//         const { id } = event.data;
//         await connectDB(
//             await User.findByIdAndDelete(id)
//         );
//     }
// );


import User from "@/models/User";
import { Inngest } from "inngest";
import { connectDB } from "../lib/mongodb";  // Add your connectDB import

// Create a client to send and receive events
export const inngest = new Inngest({ id: "electrocart" });

// Inngest function to save data
export const syncUserCreation = inngest.createFunction(
  { 
    id: "sync-user-from-clerk",
    name: "ElectroCart User Creation Function" 
  },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const userData = {
        _id: id,
        name: `${first_name} ${last_name}`,
        email: email_addresses[0].email_address,
        imageURL: image_url,
      };
      
      await connectDB();
      await User.create(userData);
      
      return { success: true, userId: id };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
);

// Inngest Function to update user data
export const syncUserUpdate = inngest.createFunction(
  {
    id: "update-user-from-clerk",
    name: "ElectroCart User Update Function"
  },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name, last_name, email_addresses, image_url } = event.data;
      const userData = {
        name: `${first_name} ${last_name}`,
        email: email_addresses[0].email_address,
        imageURL: image_url,
      };
      
      await connectDB();
      await User.findByIdAndUpdate(id, userData);
      
      return { success: true, userId: id };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }
);

// Inngest Function to delete user
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-with-clerk",
    name: "ElectroCart User Deletion Function"
  },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      const { id } = event.data;
      
      await connectDB();
      await User.findByIdAndDelete(id);
      
      return { success: true, userId: id };
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }
);
