// const fs = require('fs');
// const path = require('path');

// const pathToFolder = './data_lab1,2';
// const pathToFile = pathToFolder + '/25/exp.txt';


// if(fs.existsSync(pathToFile)) {
//     console.log('yes');

//     const data = fs.readFileSync(pathToFile, {encoding: 'utf8', flsg: 'r'})
//     let dataArr = data.split('\r\n');
//     dataArr = dataArr.filter(row => row.trim() !== '');
//     console.log(dataArr);
// }
// else {
//     console.log('no');
// }
//-------------------------------------------
const http = require('http');
const fs = require('fs');

const PORT = 3500;

http.createServer((request, response) => {
    const url = request.url;
    console.log(url);

    switch(url) {
        case '/': {
            response.write('<h1>Main</h1>');
            break;
        }
        case '/contact': {
            let data = fs.readFileSync('./contact.html', {encoding: 'utf8', flag: 'r'});
            response.write(data);
            break;
        }
        default: {
            response.write('<h1>404</h1>');
        }
    }

    // response.setHeader('Content-Type', 'text/html; charset=utf-8');
    // response.write('<h2>Hello world!!!</h2>');
    response.end();
}).listen(PORT);
//-------------------------------------------