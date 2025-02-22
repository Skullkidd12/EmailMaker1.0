const express = require("express");
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const nunjucks = require("nunjucks");
const path = require("path");
const templatesDir = path.join(__dirname, "views");
const cron = require('node-cron');
app.use(cors());
app.use(express.text());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use((req,res,next)=>{
   console.log(`${req.method}:${req.url}`);
   next();
})
nunjucks.configure(templatesDir, {
    autoescape: true,
    express: app,
    watch: true,
});

cron.schedule('*/8 * * * *', async function() {
    fetch('https://emailmaker-server-ohio.onrender.com/wake',)
    .catch(err =>{console.log(err)});
 });

app.get("/wake",(req,res)=>{
   console.log('recebido wake')
   res.sendStatus(200)
})

//escreve o arquivo template njk baseado nos inputs do forms
app.post("/MakeHTML", (req, res) => {
    const content = req.body.componente;
    let lineColor = '#EFEFEF';
    if(content.includes('')){
      console.log('array invalido');
      res.send('');
    } 
   switch (content[0]) {
   case 'coop_header_super':
      lineColor = '#FA6e50'
      break;
   case 'coop_header_super_site':
      lineColor = '#FA6e50'
      break;
   case 'coop_header_droga':
      lineColor = '#3cc86e'
      break;
   case 'coop_header_droga_site':
      lineColor = '#3cc86e'
      break;
   case 'coop_header_atacarejo':
      lineColor = '#C83C46'
      break;
   case 'coop_header_institucional':
      lineColor = '#C83C46'
      break;
   case 'coop_header_emporio':
      lineColor = '#ADA08A'
      break;
   default:
      lineColor = '#EFEFEF'
      break
   }

    //aqui eu escrevo a primeira parte do HTML, e pego o input do HEX da cor do background
    const escreveHTMLbody1 = () => {
        let bgcolor = "";
        if (req.body.background) {
            bgcolor = req.body.background;
        } else{
            bgcolor = "#002747";
        }

        if(content[0]=='zonasul_header') {
         bgcolor="#ffffff"
         fs.writeFileSync(
            path.join(__dirname, "views", "template.njk"),
            `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">\n<meta name="generator" content="plusoft-tpl">\n<title>Zona Sul</title>\n<style>\nbody{margin:0; padding:0}\nimg{margin:0; padding:0; }\na[href^=tel]{ color:#666666; text-decoration:none;}\na[href^=date]{ color:#666666; text-decoration:none;}\nhr {margin:0 !important}\ndiv, p, a, li, td {-webkit-text-size-adjust:none;}\n\n</style>\n</head>\n<body>\n<div style="font-size:0px;line-height:1px;mso-line-height-rule:exactly;display:none;max-width:0px;max-height:0px;opacity:0;overflow:hidden;mso-hide:all;">\nINSERIR PREHEADER AQUI\n</div>\n<div style="margin:0; padding:0;" bgcolor="#ffffff">\n\n\n<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="table-layout: fixed" bgcolor="#F4F4F4"><tr><td align="center" valign="top">\n\n<!--[if mso]><table width="680" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" valign="top"><![endif]-->\n<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:680px" bgcolor="${bgcolor}">\n`);
         }else{
         fs.writeFileSync(
            path.join(__dirname, "views", "template.njk"),
            `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">\n<meta name="generator" content="plusoft-tpl">\n<title>HTML</title>\n<style>\nbody{margin:0; padding:0}\nimg{margin:0; padding:0; }\na[href^=tel]{ color:#666666; text-decoration:none;}\na[href^=date]{ color:#666666; text-decoration:none;}\nhr {margin:0 !important}\ndiv, p, a, li, td {-webkit-text-size-adjust:none;}\n\n</style>\n</head>\n<body>\n<div style="margin:0; padding:0;" bgcolor="#EFEFEF">\n<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="table-layout: fixed; border-top: 9px solid ${lineColor}; border-bottom: 9px solid ${lineColor}" bgcolor="#EFEFEF"><tr><td align="center" valign="top">\n<!--[if mso]><table width="680" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" valign="top"><![endif]-->\n<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:680px" bgcolor="${bgcolor}">\n`);
        };

        }

    
    //aqui eu pego o nome dos componentes e coloco no corpo do arquivo template.njk 
    const escreveContent = () => {
        for (let i = 0; i < content.length; i++) {
            const element = content[i];
            fs.appendFileSync(
                path.join(__dirname, "views", "template.njk"),
                `\n{% include "./${element}.njk" %}`
            );
        }
    };

    //aqui eu escrevo a ultima parte do html lá no arquivo template.njk
    const criaTemplate = () => {
        escreveHTMLbody1();
        escreveContent();
        fs.appendFileSync(
            path.join(__dirname, "views", "template.njk"),
            `</table>\n<!--[if mso]></td></tr></table><![endif]-->\n</td></tr></table>\n</div>\n</body>\n</html>`
        );
    };


    criaTemplate();
    console.log('terminou de escrever .njk');
    res.redirect("https://emailmaker-server-ohio.onrender.com/download");
});

//essa rota aqui compila o arquivo .njk num arquivo .html e disponibiliza download
app.get("/download", (req, res) => {
    var html = nunjucks.render("template.njk");
    fs.writeFileSync(path.join(__dirname, "output.html"), html);
    console.log('renderizou html');
    res.download(
        path.join(__dirname, "output.html"),
        "template.html",
        (err) => {
            if (err) {
                console.log(err);
            } else {
                fs.unlinkSync(path.join(__dirname, "output.html"));
            }
        }
    );
    console.log('disponibilizou download');
});

//escreve o arquivo template njk baseado nos inputs do forms e joga pro preview
app.post("/MakePreview", (req, res) => {
   const content = req.body.componente;
   let lineColor = '#EFEFEF';
   if(content.includes('')){
     console.log('array invalido');
     res.send('');
   } 
     switch (content[0]) {
     case 'coop_header_super':
        lineColor = '#FA6e50'
        break;
     case 'coop_header_super_site':
        lineColor = '#FA6e50'
        break;
     case 'coop_header_droga':
        lineColor = '#3cc86e'
        break;
     case 'coop_header_droga_site':
        lineColor = '#3cc86e'
        break;
     case 'coop_header_atacarejo':
        lineColor = '#C83C46'
        break;
     case 'coop_header_institucional':
        lineColor = '#C83C46'
        break;
     case 'coop_header_emporio':
        lineColor = '#ADA08A'
        break;
     default:
        lineColor = '#EFEFEF'
        break
     }

   //aqui eu escrevo a primeira parte do HTML, e pego o input do HEX da cor do background
   const escreveHTMLbody1 = () => {
       let bgcolor = "";
       if (req.body.background) {
           bgcolor = req.body.background;
       } else {
           bgcolor = "#002747";
       }
       if(content[0]=='zonasul_header') {
         bgcolor= "#ffffff";
         fs.writeFileSync(
            path.join(__dirname, "views", "template.njk"),
            `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">\n<meta name="generator" content="plusoft-tpl">\n<title>Zona Sul</title>\n<style>\nbody{margin:0; padding:0}\nimg{margin:0; padding:0; }\na[href^=tel]{ color:#666666; text-decoration:none;}\na[href^=date]{ color:#666666; text-decoration:none;}\nhr {margin:0 !important}\ndiv, p, a, li, td {-webkit-text-size-adjust:none;}\n\n</style>\n</head>\n<body>\n<div style="font-size:0px;line-height:1px;mso-line-height-rule:exactly;display:none;max-width:0px;max-height:0px;opacity:0;overflow:hidden;mso-hide:all;">\nINSERIR PREHEADER AQUI\n</div>\n<div style="margin:0; padding:0;" bgcolor="#ffffff">\n\n\n<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="table-layout: fixed" bgcolor="#F4F4F4"><tr><td align="center" valign="top">\n\n<!--[if mso]><table width="680" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" valign="top"><![endif]-->\n<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:680px" bgcolor="${bgcolor}">\n`);
         }else{
         fs.writeFileSync(
            path.join(__dirname, "views", "template.njk"),
            `<!doctype html>\n<html>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1, maximum-scale=1">\n<meta name="generator" content="plusoft-tpl">\n<title>HTML</title>\n<style>\nbody{margin:0; padding:0}\nimg{margin:0; padding:0; }\na[href^=tel]{ color:#666666; text-decoration:none;}\na[href^=date]{ color:#666666; text-decoration:none;}\nhr {margin:0 !important}\ndiv, p, a, li, td {-webkit-text-size-adjust:none;}\n\n</style>\n</head>\n<body>\n<div style="margin:0; padding:0;" bgcolor="#EFEFEF">\n<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="table-layout: fixed; border-top: 9px solid ${lineColor}; border-bottom: 9px solid ${lineColor}" bgcolor="#EFEFEF"><tr><td align="center" valign="top">\n<!--[if mso]><table width="680" cellpadding="0" cellspacing="0" border="0" align="center"><tr><td align="center" valign="top"><![endif]-->\n<table width="100%" cellpadding="0" cellspacing="0" border="0" align="center" style="max-width:680px" bgcolor="${bgcolor}">\n`);
        };
   };


   //aqui eu pego o nome dos componentes e coloco no corpo do arquivo template.njk 
   const escreveContent = () => {
       for (let i = 0; i < content.length; i++) {
           const element = content[i];
           fs.appendFileSync(
               path.join(__dirname, "views", "template.njk"),
               `\n{% include "./${element}.njk" %}`
           );
       }
   };

   //aqui eu escrevo a ultima parte do html lá no arquivo template.njk
   const criaTemplate = () => {
       escreveHTMLbody1();
       escreveContent();
       fs.appendFileSync(
           path.join(__dirname, "views", "template.njk"),
           `\n</table>\n<!--[if mso]></td></tr></table><![endif]-->\n<tr><td align="center" valign="top" bgcolor="${lineColor}" style="padding: 5px"></td></tr>\n</td></tr></table>\n</div>\n</body>\n</html>`
       );
   };


   criaTemplate();
   console.log('terminou de escrever .njk');
   res.redirect("https://emailmaker-server-ohio.onrender.com/preview");
});

//compila o HTML e disponibiliza o preview
app.get("/preview", (req, res) => {
   var html = nunjucks.render("template.njk");
   fs.writeFileSync(path.join(__dirname, "output.html"), html);
   console.log('renderizou html e liberou preview');
   res.sendFile(
       path.join(__dirname, "output.html"),
       "template.html",
       (err) => {
           if (err) {
               console.log(err);
           } else {
               fs.unlinkSync(path.join(__dirname, "output.html"));
           }
       }
   );
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});

