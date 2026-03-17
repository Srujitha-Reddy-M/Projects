const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");


const app = express();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get("/", function(req,res){
    res.sendFile(__dirname + "/signup.html");
});


app.post("/", function(req, res){
    const fn = req.body.fName;
    const ln = req.body.lName;
    const eID = req.body.email;

   const data = {
    members: [
        {
            email_address: eID,
            status: "subscribed",
            merge_fields: {
                FNAME: fn,
                LNAME: ln
            }
        }        
    ]
   };

    const jsonData = JSON.stringify(data);    
    const url = "https://us21.api.mailchimp.com/3.0/lists/45aaf3c256"
   
    //The value of auth should be the API key. 
   const options ={
    method : "POST",
    auth: "Replace_With_API_KEY"
   }
   
   const request = https.request(url, options, function(response){

    if(response.statusCode === 200){
        res.sendFile(__dirname + "/success.html");
    }else{
        res.sendFile(__dirname + "/failure.html");
    }
        response.on("data", function(data){
            console.log(JSON.parse(data));
        });
   });

   //request.write(jsonData);
   request.end();



});

app.post("/failure", function(req,res){
    res.redirect("/");
});

app.listen(process.env.PORT || 3000, function(){
    console.log("Server running on port 3000");
});


//list id
//45aaf3c256