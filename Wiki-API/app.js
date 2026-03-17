//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB", {useNewUrlParser: true});

const wikiSchema = {
    title: String,
    content: String
};

const wikiModel = mongoose.model("article", wikiSchema);

//chained routes for all articles

app.route("/articles").get(function(req,res){
    wikiModel.find({}).then(function(docs){
        res.send(docs);
    }).catch(function(err){
        res.send(err);
    });
})
.post(function(req,res){
    const newDoc = new wikiModel({
        title: req.body.title,
        content: req.body.content
    });

    newDoc.save().then(function(err){
        if(!err){
            res.send("Succesfully added a new document to DB");
        }else{
            res.send(err);
        }
    });
})
.delete(function(req,res){
    wikiModel.deleteMany({}).then(function(err){
        if(!err){
            res.send("Succesfully deleted all documents");
        }else{
            res.send(err);
        }
    });
});

//chained route for specific articles

app.route("/articles/:pathName")
.get(function(req,res){
    wikiModel.findOne({title: req.params.pathName}).then(function(doc){
        res.send(doc);
    }).catch(function(err){
        res.send(err);
    });
})

.put(function(req, res){
    wikiModel.replaceOne(
        {title: req.params.pathName},
        {title: req.body.title, content: req.body.content}
    ).then(function(err){
        if(!err){
            res.send("Succefully updated the doc");
        }else{
            res.send(err);
        }
    });
})

.patch(function(req, res){
    wikiModel.updateOne(
        {title: req.params.pathName},
        {$set: req.body}
    ).then(function(err){
        if(!err){
            res.send("Succefully updated the doc");
        }else{
            res.send(err);
        }
    });
})

.delete(function(req,res){
    wikiModel.deleteOne(
        {title: req.params.pathName}
    ).then(function(err){
        if(!err){
            res.send("Succefully updated the doc");
        }else{
            res.send(err);
        }
    });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});