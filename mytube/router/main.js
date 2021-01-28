const { debug } = require('console');

module.exports = function(app)
{
    const fs = require('fs')
    const youtubedl = require('youtube-dl')

    app.get('/',function(req,res){
        res.render('index.html');
    });

    app.get('/loading', (req,res)=>{

        var url = req.query.url;
        const ext = req.query.ver;

        const regexr = /((?<=(v|V|e))|(?<=be)|(?<=(\?|\&)v=)|(?<=embed))([\w-]+)/;
        const ans = url.match(regexr);
        if(ans == null) {
            res.send('잘못된 url');
            res.redirect('/');
        }
        else {
            var id = ans[0];
        }

        if(fs.existsSync(`./tmp/${ext}/${id}`)){
            res.redirect('/download?id=' + id + '&ext=' + ext);
        }

        else{
            var url = 'https://www.youtube.com/watch?v=' + id;
            var format = '';
            if(ext == 'mp3') format = 'bestaudio';
            else format = '(bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4)[filesize<50M]';  
    
            var outpath = `./tmp/${ext}/${id}/%(title)s.%(ext)s`;
    
            youtubedl.exec(url, ['-f', format, '-o', outpath], {},(err, data) => {
                if(err)return console.error(err);
                else {
                    res.redirect('/download?id=' + id + '&ext=' + ext+'&url='+url);
                }
            });
        }
        
    });

    app.get('/download', (req,res)=>{
        var id = req.query.id;
        var ext = req.query.ext;
        var url = req.query.url
        var path = `./tmp/${ext}/${id}`;
        fs.readdir(path, function(error, file_list){
            outfile = file_list[0];
            res.download(path + '/' + outfile);
        })
    });
}