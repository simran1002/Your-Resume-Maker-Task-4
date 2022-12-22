require("dotenv").config();
const express = require("express");
const ejs = require("ejs");
const path = require("path");
const passport = require("passport");
const cookieSession = require("cookie-session");
const { profile } = require("console");
var pdf = require("pdf-creator-node");
var fs = require("fs");
const { rmSync } = require("fs");
const app = express();

require("./middleware/passport-setup/passport");

const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../views");



app.set("view engine", "ejs");
app.set("views", views_path);

app.use(express.static(static_path));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(
  cookieSession({
    name: "interactive-session",
    keys: ["key1", "key2"],
  })
);

app.use(passport.session());

function loggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.redirect("/google");
  }
}

app.get("/", (req, res) => {
  try {
    res.render("landingpage");
  } catch (error) {
    console.log(error);
    res.render("notfound");
  }
});

app.get("/google",passport.authenticate("google", { scope: ["profile", "email"] }));


app.get("/google/callback",passport.authenticate("google", { failureRedirect: "/failed" }),
  (req, res) => {
    res.redirect("/tempelate");

  }
);

app.get("/tempelate",loggedIn,async(req,res,next)=>{
  try {
    res.render("resumetemplate");
  } catch (error) {
    res.status(400).json({message:"something went wrong"});
    
  }

})

app.get("/resume/:theme",loggedIn,(req,res,next)=>{
  try {
    let theme=req.params.theme;
    console.log(theme);
    res.render("form_details",{
      template:theme,
    })
  } catch (error) {
    console.log(error);
    
  }

});


app.post("/resume-maker",loggedIn,(req,res,next)=>{
  let theme_used=req.body.theme;
  let data=req.body;
  if(theme_used==="1"){
    var html = fs.readFileSync("index.html", "utf8");
    var options = {
      format: "A3",
      orientation: "portrait",
      border: "10mm",
      header: {
          height: "45mm",
          contents: '<div style="text-align: center;">Author:Simran</div>'
      },
      footer: {
          height: "28mm",
          contents: {
              first: 'Cover page',
              2: 'Second page', // Any page number is working. 1-based index
              default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
              last: 'Last Page'
          }
      }
  };
  var users =
    {
      name: req.body.U_name,
      phone: req.body.U_phone,
      email: req.body.U_email,
      city: req.body.city_name,
      applying: req.body.U_appling,
      shortDisc: req.body.Short_discription,
      post: req.body.post_1,
      tperiod: req.body.time_preiod_1,
      graduation: req.body.Graduation,
      seniorsec: req.body.senior_secondary,
      project1: req.body.project_1,
      project2: req.body.project_2,
      skill1: req.body.skill_1,
      skill2: req.body.skill_2,
    }
  
  let document = {
    html: html,
    data: users,
    path: `./${req.body.U_name}`+`${req.body.theme}.pdf`,
    type: "",
  };
  pdf
  .create(document, options)
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.error(error);
  });
  res.send("pdf-downloaded");
  }else{
    var html = fs.readFileSync("index2.html", "utf8");
    var options = {
      format: "A3",
      orientation: "portrait",
      border: "10mm",
      header: {
          height: "45mm",
          contents: '<div style="text-align: center;">Author:Simran</div>'
      },
      footer: {
          height: "28mm",
          contents: {
              first: 'Cover page',
              2: 'Second page', // Any page number is working. 1-based index
              default: '<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
              last: 'Last Page'
          }
      }
  };
  var users =
    {
      name: req.body.U_name,
      phone: req.body.U_phone,
      email: req.body.U_email,
      city: req.body.U_city,
      state: req.body.state_name,
      country: req.body.countrys_name,
      linkdin: req.body.linkedin_id,
      // applying: req.body.U_appling,
      shortDisc: req.body.Short_discription,
      post: req.body.post_1,
      tperiod: req.body.time_preiod_1,
      ecity: req.body.E_city,
      estate: req.body.E_state_name,
      edescription: req.body.discription_1,
      degree: req.body.U_degree,
      uinstitution: req.body.U_institution,
      institiaddress: req.body.institution_address,
      seniorsec: req.body.Education_2,
      project1: req.body.project_1,
      project2: req.body.project_2,
      skill1: req.body.skill_1,
      skill2: req.body.skill_2,
      skill3: req.body.skill_3,
      skill4: req.body.skill_4,
    }
  
  let document = {
    html: html,
    data: users,
    path: `./${req.body.U_name}`+`${req.body.theme}.pdf`,
    type: "",
  };
  pdf
  .create(document, options)
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.error(error);
  });
  res.send("Your resume is downloaded in pdf format");
  }
});


app.listen(3000 || process.env.PORT, () => {
  console.log("connection is successfull");
});
