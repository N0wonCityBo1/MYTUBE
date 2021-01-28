const express = require('express')
const http = require('http')
const app = express();
const server = http.createServer(app)
const fs = require('fs')
var ejs = require('ejs');

var Youtube = require('youtube-node');
var youtube = new Youtube();
const youtubedl = require('youtube-dl')


youtube.setKey('AIzaSyAsCuGQcXVJy2qhmthT8GbNHdVvE4uSFhE');//api키 입력

app.use('/css',express.static('./static/css'))
app.use('/js',express.static('./static/js'))
app.use('/help',express.static('./static/help'))

app.get('/',function(req,res){
    fs.readFile('./static/index.html',(err,data)=>{
        if(err){
            res.send('에러')
        }else{
            res.writeHead(200,{'content-Type':'text/html'})
            res.write(data)
            res.end()
        }
    })
})


app.get('/loading',function(req,res){
   var url = req.query.url
   youtube.search(url, 1, function (err, result) { // 검색 실행
    if (err) { console.log(err); return; } // 에러일 경우 에러공지하고 빠져나감



    var items = result["items"]; // 결과 중 items 항목만 가져옴
        var it = items[0];            
        console.log(it.snippet.thumbnails.medium.url)

        var title = it["snippet"]["title"];
        var photo = it.snippet.thumbnails.medium.url;
        var ext = req.query.ver
        var id = it["id"]["videoId"];
        if(fs.existsSync(`./tmp/${ext}/${id}`)){
            res.redirect('/download?id=' + id + '&ext=' + ext);
        }

        else{
            var url = 'https://www.youtube.com/watch?v=' + id;
            var format = '';            
            var outpath = `./tmp/${ext}/${id}/%(title)s.%(ext)s`;

            if(ext == 'mp3'){format = 'bestaudio'
            youtubedl.exec(url, ['-f', format, '-o', outpath], {},(err, data) => {
                if(err)return console.error(err);
                else {
                    res.redirect('/download?id=' + id + '&ext=' + ext);
                }
            });
        
            }else{format = 'best[filesize<48M]'  
            youtubedl.exec(url, ['-f', format, '-o', outpath,'-x'], {},(err, data) => {
                if(err)return console.error(err);
                else {
                    res.redirect('/download?id=' + id + '&ext=' + ext);
                }
            });}
        }
        fs.readFile('./static/download.ejs', 'utf8', function(err, data) {
             res.writeHead(200, { 'Content-Type' : 'text/html' }
             ); 
          res.end(ejs.render(data, {title : title, photo : photo, id: url,ver:ext })); });


        
       
        
        
    
});
  

})

app.get('/download',function(req,res){
    var id = req.query.id;
        var ext = req.query.ext;
        var path = `./tmp/${ext}/${id}`;
        fs.readdir(path, function(error, file_list){
            outfile = file_list;
            res.download(path + '/' + outfile);
        })
        setTimeout(res.redirect('/'), 3000);
    });


server.listen(3000,()=>{
    console.log("서버 실행중!")
})