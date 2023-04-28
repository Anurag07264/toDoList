const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();
const _ = require("lodash");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.set('view engine','ejs');
mongoose.connect("mongodb+srv://anuragprashar07264:aman1234@cluster0.xwagfa1.mongodb.net/todolistDB",{useNewUrlParser : true});

const itemSchema = {
  name : String
};
const Item = mongoose.model('Item',itemSchema);

const item1 = new Item({
  name : "welcome to your toDolist"
});
const item2 = new Item({
  name : "hit the + button to add a new item"
});
const item3 = new Item({
  name : '<-- hit this to delete an item'
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name : String,
  items:[itemSchema]
};
const List = mongoose.model("List",listSchema);

app.get("/",async (req, res) => {
  try {
    const tasks = await Item.find({ });
    if(tasks.length === 0){
      Item.insertMany(defaultItems);
    }
    res.render("list",{listTitle:"Today",newTasks:tasks});
  } catch (err) {
    console.log(err);
  }
});

// app.get("/work",function(req,res){
//   res.render("list",{
//   listTitle:"Work List",
//   newTasks : workList
// });
// });
app.get("/:customListName",function(req,res){
    customListName = _.capitalize(req.params.customListName);
    //VVVVVVVVVVIP//
    List.findOne({name:customListName}).exec().then(foundList => {

          if(!foundList){
            //create a new lists//
            const list = new List({
              name :customListName,
              items : defaultItems
            });
            list.save();
            res.redirect("/" +customListName);
          }else{
            //show an exisiting list//
            res.render("list",{listTitle:foundList.name , newTasks:foundList.items});
          }

        });
});
app.get("/about",function(req,res){
  res.render("about");
});

app.post("/",function(req,res){
   const itemName = req.body.task;
   const listName = req.body.list;
   const item = new Item({name : itemName});

   if(listName == 'Today'){
     item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).exec().then(foundList => {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" +listName);
        });
  }

});
app.post("/delete",async ( req , res ) =>{
    const checkTask = req.body.checkbox;
    const listName = req.body.listName;
    if(listName === 'Today'){
      Item.findByIdAndRemove({ _id:checkTask}).exec().then(foundList =>{
            res.redirect("/");
      });
    }else{
      List.findOneAndUpdate({name : listName},{$pull:{items :{_id : checkTask}}}).exec().then(foundList =>{
        res.redirect("/" + listName);
      });
    }

});



app.listen(3000,console.log("Server started at port 3000"));
