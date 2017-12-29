var express = require('express');
var app = express();
var server = require('http').createServer(app);
var port = 8085;
var bitcoin = require('bitcoin');
var Client1 = require('node-rest-client').Client;
var ServiceCall = new Client1();
var fs = require('fs');
var client = new bitcoin.Client({
    host: '127.0.0.1',
    port: 27504,
    user: 'adminpc',
    pass: 'admin'
});


var LastBlock=1051;
var CurrnectBlock = 100;
var URL = "http://127.0.0.1:3001/block/";

function LoadFun(){
    try{
    
    fs.readFile('./data.json', 'utf-8', function (err, data) {

        if (data!="")
        {
            var arrayOfObjects = JSON.parse(data)
            LastBlock = arrayOfObjects.LastBlock;

            client.getInfo(function (err, data) {
                CurrnectBlock = data.blocks;
                console.log('LastBlock : ' + LastBlock + " CurrenctBlock : " + CurrnectBlock);
                
                if  (LastBlock!=CurrnectBlock){
                    test(LastBlock);
                }
                else{
                    setTimeout(function() {
                       LoadFun() 
                    }, 10000);
                }
            });
    }
        
    })
    } catch (e) {
        console.log('Error : ' + LoadFun);
    }

   
}
function test(count) {
    try{

    if(count!=CurrnectBlock+1){
  
        client.GetBlockByNumber(count, function (err, data) {
            ServiceCall.get(URL + data.hash, function (data, response) {
                var arrayOfObjects = { LastBlock: count };
                fs.writeFile('./data.json', JSON.stringify(arrayOfObjects), 'utf-8', function (err) {
                    if (err) throw err

                    console.log('Block No :'+count);
                    count++;
                   test(count);
                })
                
            });
        });
    }
    else{
        LoadFun();

    }
    
}
     catch (e) {
         console.log('Error : test' + e);
    }
}
LoadFun();

console.log("server now running on port", port);
server.listen(port);


