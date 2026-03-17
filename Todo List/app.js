//jshint esversion:6

const express = require("express");
const bodyparser = require("body-parser");
const date = require(__dirname + "/date.js")
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

var day ="";

//var weekDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// var items = ["Buy Food", "Cook Food", "Eat Food"];
// var workItems = [];


//Using MongoDB to store the data
//Replace username and password below
mongoose.connect("mongodb+srv://username:password@clustertodo.bdlsfnf.mongodb.net/todolistDB", {useNewUrlParser: true});

//create the schema
const itemsSchema = {
    name: String
};

//create model
const itemsModel = mongoose.model("Item", itemsSchema);

//create some documents
const item1 = new itemsModel({
    name: "Welcome to Notes ;)"
});

const item2 = new itemsModel({
    name: "Hit + to add more items to the list"
});

const item3 = new itemsModel({
    name: "<--- Check the box to remove item"
});

//create an array to put the docs
const defaultItems = [item1, item2, item3];


//custom schema for the custom paths
const customSchema ={
    name: String,
    items: [itemsSchema]
};

const customModel = mongoose.model("customList", customSchema);


app.get("/",function(req,res){
    day = date.getDate(); //gets the complete date,   date.getDay gives only the day
    
    itemsModel.find({}).then(function(foundItems){

        if(foundItems.length === 0){
            //save the docs to DB
            itemsModel.insertMany(defaultItems).then(function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Succesfully added multiple docs");
                }
                res.redirect("/");
            });
        }else{
            res.render("lists", {listTitle: day, newItems: foundItems});
        }
    }).catch(function(err){
        console.log(err);
    }); 
});


app.get("/:customPathName", function(req,res){
    const customPathName = _.capitalize(req.params.customPathName);

    customModel.findOne({name: customPathName}).then(function(doc){
        if(!doc){
            // console.log("Document not found");
            const customlist = new customModel({
                name: customPathName,
                items: defaultItems
            });
            customlist.save();
            res.redirect("/"+ customPathName);
        }else{
            // console.log("Found doc");
            res.render("lists", {listTitle: doc.name, newItems: doc.items});
        }
    }).catch(function(err){
        console.log(err);
    });
});        

app.post("/", function(req,res){
    const itemName = req.body.addItem;
    const pathName = req.body.lists;

    //DB
    const nextItem = new itemsModel({
        name: itemName
    });

    if(pathName === day){
        nextItem.save();
        res.redirect("/");
    }else{
        customModel.findOne({name: pathName}).then(function(found){
            console.log(found);
            found.items.push(nextItem);
            found.save();
            res.redirect("/"+ pathName);
        }).catch(function(err){
            console.log(err);
        });
    }


    // if(req.body.lists === "Work List"){
    //     workItems.push(item);
    //     res.redirect("/work");
    // }else{
    //     items.push(item);
    //     res.redirect("/");
    // }
});

app.post("/delete", function(req,res){
    const checkedId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === day){
        itemsModel.findByIdAndRemove(checkedId).then(function(err){
            if(err){
                console.log(err);
            }else{
                console.log("Succesfully added multiple docs");
            }
        });
    }else{
        customModel.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedId}}}).then(function(found){
            res.redirect("/" + listName);
        }).catch(function(err){
            console.log(err);
        });
    }
});


// app.get("/work", function(req, res){
//     res.render("lists", {listTitle: "Work List", newItems: workItems});
// });


app.listen(3000, function(){
    console.log("server running on port 3000");
});