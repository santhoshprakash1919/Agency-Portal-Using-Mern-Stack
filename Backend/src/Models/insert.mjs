import mongoose from "mongoose";
import agency from "./agency.mjs";
import products from "./products.mjs";
import dotenv from "dotenv";
dotenv.config();

console.log("Loaded URL:", process.env.MONGO_URL);

async function insertData() {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB Connected");

    const mtr = await agency.create(
      { name: "MTR Foods", category: "Wholesale" }
    );
    const oshan = await agency.create(
      { name: "Oshan Chocolates", category: "Wholesale" }
    );
    const lamp_oil = await agency.create(
      { name: "Suriyan Lamp Oil", category: "Wholesale" }
    );
    const atta = await agency.create(
      { name: "Ganesh Atta", category: "Wholesale" }
    );

    await products.insertMany([
     { name: "Badam Mix", agency: mtr._id },
    { name: "Payasam Mix", agency: mtr._id },
     { name: "Lemon Rice Powder", agency: mtr._id },
    { name: "Gulab Jamun Mix", agency: mtr._id },

      { name: "Gems candy", agency: oshan._id },
     { name: "Pop up lollipop", agency: oshan._id },
      { name: "Cycle race candy", agency: oshan._id },
     { name: "Crush waffer biscuit", agency: oshan._id },

    { name: "200 ml bottle", agency: lamp_oil._id },
     { name: "500 ml bottle", agency: lamp_oil._id },
    { name: "100 ml bottle", agency: lamp_oil._id },
     { name: "1L bottle", agency: lamp_oil._id },

      { name: "20 kg Maida Atta Bag", agency: atta._id },
     { name: "20 kg Rava Atta Bag", agency: atta._id },
    { name: "20 kg Wheat Atta Bag", agency: atta._id },
      { name: "20 kg Benz Atta Bag", agency: atta._id }
    ]);

    console.log("Data inserted successfully");
    await mongoose.disconnect(

      
    );
    process.exit(0);
  } catch (err) {
    console.error("Error inserting data:", err);
  }
}

insertData();