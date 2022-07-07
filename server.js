var express = require('express'),
  http= require('https'),
  unirest = require('unirest'),
  app = express(),
  port = process.env.PORT || 4000;

  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });



  app.get('/quotes', function (req, res) {
    let origin= req.query.origin;
    let destination = req.query.destination;

    let quotes=[];
    for(var i=1;i<=30;i++){
        quotes.push(getQuotes(i, origin, destination));
    }

    Promise.all(quotes).then(function(result){
      res.send(result);
    })

 });

 function getQuotes(i, origin, destination){
  let date = new Date();
  date.setDate(date.getDate()+i);

  return new Promise(function(resolve,rej){    
    unirest.get("https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/US/USD/en-US/"+origin+"-sky/"+destination+"-sky/"+formatDate(date)+"?inboundpartialdate=2019-09-01")
    .header("X-RapidAPI-Host", "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com")
    .header("X-RapidAPI-Key", "aad45ed090msh1c122f50828fce9p133240jsn070943bd5940")                
    .end(function (result) {           
        if(result.body.Quotes!==undefined && result.body.Quotes.length>0){
            let depDate=new Date(result.body.Quotes[0].OutboundLeg.DepartureDate);
            let places = result.body.Places;
            let locOrigin = places.filter(s=>s.IataCode==origin)[0].CityName;
            let locDestination = places.filter(s=>s.IataCode==destination)[0].CityName;
            let quotes ={
                minPrice:result.body.Quotes[0].MinPrice,
                month:depDate.getMonth(),
                date:depDate.getDate(),
                title:locOrigin + ' - ' + locDestination
            };     
            
            resolve(quotes);
        }

        resolve({});
        
  });
  
  }); 
 }

 
 function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}


app.listen(port);

console.log('Mohammed Athar Imran Ahmed RESTful API server started on: ' + port);

