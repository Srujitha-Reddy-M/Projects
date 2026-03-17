//jshint esversion:6

//Method-1

    // var day = "";
    // var currentDay = today.getDay();
    // if( currentDay === 6 || currentDay === 0){
    //     day = weekDay[currentDay];
    // }
    // else{
    //     day = weekDay[currentDay];
    // }

//Method 2
//module.exports.getDate = function(){  or

exports.getDate = function(){
    const today = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    };

    return today.toLocaleDateString("en-US", options);
    
}

exports.getDay = function(){
    const today = new Date();
    const options = {
        weekday: "long",
    };

    return today.toLocaleDateString("en-US", options);
}
    