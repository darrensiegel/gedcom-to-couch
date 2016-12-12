

var fs = require('fs')
var parseGedcom = require('parse-gedcom')

var http = require('http')

var insert = function(record) {
    var options = {
        "host": "localhost",
        "port": 5984,
        "path": "/ancestry/" + record._id,
        "method": "PUT",
        "headers": { 
            "Content-Type" : "application/json"
        }
    }

    var callback = function(response) {
        var str = ''
        response.on('data', function(chunk){
            str += chunk
        })

        response.on('end', function(){
            console.log(str)
        })
    }

    var body = JSON.stringify(record);
    http.request(options, callback).end(body);
}



var toJSON = function(file) {
    return new Promise(function(resolve, reject) {
        fs.readFile(file, 'utf8', function (err, data) {
            if (err) throw err;

            resolve(parseGedcom.parse(data))
        });        
    })
}

var transform = function(record) {

let root = {};

    if (record.tree.length === 0) {
        return record.data;
    }
    if (record.pointer !== '') {
        root._id = record.pointer;
        root.TYPE = record.tag; 
    }
    
   if (record.tree !== undefined) {

       if (record.data !== '') {
           return record.data; 
           
       } else {
       
        record.tree.forEach(t => {
            let obj = transform(t);

            if (t.tag === "_APID") {
              root.APID = obj;
            } else {
              root[t.tag] = obj;
            }
        })
       }
    }
    return root;
}

toJSON('sample.ged')
    .then(records => {
        records.map(record => transform(record))
            .forEach(transformed => console.log(transformed));
    })
    


    

