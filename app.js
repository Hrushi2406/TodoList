//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchemea = {
  name: String
};

const Item = mongoose.model("Item", itemsSchemea);


const item1 = new Item ({name: "Welcome To DO list"});
const item2 = new Item ({name: "Add your To Dos"});
const item3 = new Item ({name: "Just Do It!"});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemsSchemea]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {


  Item.find({}, function(err, foundItems){

  if(defaultItems.length === 0){
    Item.insertMany(defaultItems, function(err){
      if(err){
        console.log(err);
      }
      else {
        console.log("Success Fully saved to Database");
      }
    });
    res.redirect("/");
  }else {
    res.render("list", {listTitle: "Today", newListItems: foundItems });
  }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

 const item = new Item ({name: itemName});

  if(listName == "Today")
  {

      item.save();
      res.redirect("/");
  }else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }


});


app.post("/delete" ,function(req, res) {
  const checkedItemID = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today")
  {
    Item.findByIdAndRemove(checkedItemID, function (err) {
      if(!err){
        console.log("Removed Successfully");
        res.redirect("/");
      }
      });
  }
  else {
      List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemID}}}, function (err, foundList){
          if(!err){
            res.redirect("/" + listName);
          }
      });
  }



});

app.get("/:customListName",function(req, res){

const customListName = req.params.customListName;

  List.findOne({name:customListName}, function(err, foundList) {
    if(!err){
      if(!foundList){
        //Create List
        const list = new List ({name:customListName,items: defaultItems});
        list.save();
        res.redirect("/" + customListName);
      }else {
        //Show List
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });


});




app.listen(3000, function() {
  console.log("Server started on port 3000");
});
