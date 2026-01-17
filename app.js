const express=require("express")
const app=express();
const mongoose=require("mongoose")
const Listing =require("./models/listing.js")
const path = require("path")
const ejsMate= require("ejs-mate");
const ExpressError = require("./utils/Expresserror.js");
const {listingSchema} = require('./Schema.js');

const Review = require("./models/review.js")


const wrapAsync = require("./utils/wrapAsync.js");


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

//Schema Validation using JOI NPM PACKAGE
//WE HAVE USED THIS FUNCTION AS MIDDLE WARE
const validateListing=(req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let erMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,erMsg);
    }
    else{
        next();
    }
}

//INDEX ROUTE
app.get("/listings",wrapAsync (async (req,res)=>{
    const allListings = await Listing.find({});
//     console.log(
//   allListings.map(l => ({
//     title: l.title,
//     image: l.image
//   }))
// );
    res.render("listings/index.ejs",{allListings});
}))
//NEW ROUTE
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs")
})

//SHOW ROUTE
app.get("/listings/:id", wrapAsync (async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs",{listing});
}))

//CREATE ROUTE
//we are using try and catch to ensure error hadling it was bulky thats why we have shift to wrapAsync
// app.post("/listings", async (req,res,next)=>{
//     try{
//     const newListing = new Listing(req.body.listing);
//     await newListing.save();
//     res.redirect("/listings")
//     }

//     catch(err){
//         next(err)
//     }
    
// })
app.post("/listings",validateListing, wrapAsync (async (req,res,next)=>{
    // if(!req.body.listing){
    //     throw new ExpressError(400,"Send valid data for listening")
    // }
    
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings")
  
}));

//EDIT ROUTE
app.get("/listings/:id/edit",async (req,res)=>{
    let {id}=req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs",{listing});

});
//update route
app.put("/listings/:id",validateListing, wrapAsync (async (req,res)=>{
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE
app.delete("/listings/:id", wrapAsync (async (req,res)=>{
    let {id}=req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings")
    

}));


//REVIEWS
//POST ROUTE
app.post("/listings/:id/reviews",async (req,res)=>{
    let listing= await Listing.findById(req.params.id);
    let newreview = new Review(req.body.review);

    listing.reviews.push(newreview);

    await newreview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
    
    
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



app.use((req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

//error handling middleware
app.use((err,req,res,next)=>{
    let {statusCode = 500, message = "Something went wrong"} = err;
    
    res.status(statusCode).render("error.ejs",{message});
})
app.listen(8080,()=>{
    console.log("Server is listening to port 8080");
    
})

