const express = require('express');
const mongoose = require('mongoose');
var bodyParser = require('body-parser')

const path = require('path');

const app = express();

const Posts = require('./Posts.js');

const port = process.env.PORT || 3000;

mongoose.connect('mongodb+srv://root:SkBuwXk7YPsX15Rp@cluster0.6yhqhpx.mongodb.net/thallyson?retryWrites=true&w=majority',{useNewUrlParser: true, useUnifiedTopology: true}).then(function(){
    console.log('Conectado com sucesso');
}).catch(function(err){
    console.log(err.message);
})

app.use( bodyParser.json() );  
app.use( bodyParser.urlencoded({    
  extended: true
})); 

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));


app.get('/',(req,res)=>{
    
    if(req.query.busca == null){
        Posts.find({}).sort({'_id': -1}).exec(function(err,posts){
     
            posts = posts.map(function(val){
                    return {
                        titulo: val.titulo,
                        conteudo: val.conteudo,
                        descricaoCurta: val.conteudo.substr(0,200),
                        imagem: val.imagem,
                        slug: val.slug,
                        categoria: val.categoria
                        
                    }
            })
          
            Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
               
                 postsTop = postsTop.map(function(val){
                         return {
                             titulo: val.titulo,
                             conteudo: val.conteudo,
                             descricaoCurta: val.conteudo.substr(0,200),
                             imagem: val.imagem,
                             slug: val.slug,
                             categoria: val.categoria,
                             views: val.views
                             
                         }
                 })
                 
                res.render('home',{posts:posts,postsTop:postsTop});
                
             })
          
        })
        
    }else{

        Posts.find({titulo: {$regex: req.query.busca,$options:"i"}},function(err,posts){
            console.log(posts);
            posts = posts.map(function(val){
                return {
                    titulo: val.titulo,
                    conteudo: val.conteudo,
                    descricaoCurta: val.conteudo.substr(0,200),
                    imagem: val.imagem,
                    slug: val.slug,
                    categoria: val.categoria,
                    views: val.views
                    
                }
        })
            res.render('busca',{posts:posts,contagem:posts.length});
        })
        
    }
  
});

app.get('/:slug',(req,res)=>{
   
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views: 1}}, {new: true},function(err,resposta){
     
       if(resposta != null){

        Posts.find({}).sort({'views': -1}).limit(3).exec(function(err,postsTop){
            
             postsTop = postsTop.map(function(val){
                     return {
                         titulo: val.titulo,
                         conteudo: val.conteudo,
                         descricaoCurta: val.conteudo.substr(0,200),
                         imagem: val.imagem,
                         slug: val.slug,
                         categoria: val.categoria,
                         views: val.views
                         
                     }
             })

             res.render('single',{noticia:resposta,postsTop:postsTop});

            })
        
       }else{
           res.redirect('/');
       }
    })
    
})

app.listen(port,()=>{
    console.log('server rodando!');
})