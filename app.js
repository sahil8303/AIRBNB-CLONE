const express=require("express")
const app=express();
const mongoose=require("mongoose")
const Listing =require("./models/listing.js")
const path = require("path")
const ejsMate= require("ejs-mate")
const MONGO_URL="mongodb://127.0.0.1:27017/wanderlust"

main()
.then(()=>{
    console.log("Connected to DB");
    
})
.catch((err)=>{
    console.log(err);
    
})

async function main(){
    await mongoose.connect(MONGO_URL);
}

const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);

app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended:true}))
app.use(express.static(path.join(__dirname,"/public")))

//INDEX ROUTE
app.get("/listings",async (req,res)=>{
    const allListings = await Listing.find({});
//     console.log(
//   allListings.map(l => ({
//     title: l.title,
//     image: l.image
//   }))
// );
    res.render("listings/index.ejs",{allListings});
})
//NEW ROUTE
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})

//SHOW ROUTE
app.get("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
})

//CREATE ROUTE
app.post("/listings", async (req,res)=>{
    // let {title,description,image,price,country,location} = req.body;
    let newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
})

//EDIT ROUTE
app.get("/listings/:id/edit",async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});

});
//update route
app.put("/listings/:id", async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
});

//DELETE ROUTE
app.delete("/listings/:id",async (req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
    

})


// app.get("/testlisting",async (req,res)=>{
//     let sampleListing = new Listing({
//         title:"My New villa",
//         description:"By the beach",
//         price:1200,
//         loaction:"Nagpur,Maharashtra",
//         Country:"India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("Succesfull testing")
    
// })
app.get("/",(req,res)=>{
    res.send("Hi,I am root")
})

app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
    
})

