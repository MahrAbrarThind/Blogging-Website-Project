
// CONNECTING AND MAKING A DATABASE
const mongoose = require('mongoose');
// mongoose.connect('mongodb://127.0.0.1:27017/BlogsWebsite');
mongoose.connect('mongodb+srv://user_abrar:abrarpassword123@ecommerececluster.x22nxlc.mongodb.net/BlogsWebsite');
const schema = mongoose.Schema({
    titleOfBlog: String,
    contentOfBlog: String,
});
const Blog = mongoose.model('Blog', schema);





//INCLUDING ALL PACKAGES.

const express = require("express");
const app = express();
const ejs = require("ejs");
const path = require("path");
const bodyParser = require("body-parser");
const { error } = require('console');

let viewsPath = path.join(__dirname, "../views");


app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", 'ejs');
app.set("views", viewsPath);



let array = [];

//  FUNCTION TO LOAD DATA FROM DATABASE TO MY ARRAY 

async function loadDataFromDatabase() {
    try {
        const blogs = await Blog.find();
        if (blogs.length > 0) {
            array = blogs.map(blog => ({
                title: blog.titleOfBlog,
                content: blog.contentOfBlog
            }));
            console.log("Data loaded from database:", array);
            console.log("i am the array after ", array[0].title);
        }
    } catch (error) {
        console.error("Error loading data from database:", error);
    }
}
loadDataFromDatabase();


// MANGING ROUTES


app.get("/", (req, res) => {
    res.render("home",
        {
            array: array
        }
    );
});
app.get("/home", (req, res) => {
    res.render("home",
        {
            array: array
        });
});
app.get("/about", (req, res) => {
    res.render("about");
});
app.get("/compose", (req, res) => {
    res.render("compose");
});
app.get("/find", (req, res) => {
    let findFlag = true;
    res.render("find",
        {
            flag: findFlag
        }
    );
})
app.get("/blogs", (req, res) => {
    res.render("blogs",
        {
            array: array
        });
});
app.get("/delete", (req, res) => {
    let delFlag = true;
    res.render("delete",
        {
            flag: delFlag
        });
})
app.get("/blogs/:id", (req, res) => {
    flag = false;
    const id = req.params.id;
    array.forEach(function (object) {
        if (object.title == id) {
            flag = true;
            res.render("ReadMore",
                {
                    title: object.title,
                    content: object.content,
                    flag: flag
                });
        }
    })
    if (flag == false) {
        res.render("ReadMore",
            {
                title: "",
                content: "",
                flag: flag
            });
    }
})



// ACTIVITIES WHEN FORM IS SUBMITTED

app.post("/compose", async (req, res) => {
    let title = req.body.title.toLowerCase();
    let content = req.body.content;


    // SAVING TO DATABASE
    const blog = new Blog({
        titleOfBlog: title,
        contentOfBlog: content
    });

    try {
        await blog.save();

        let object = {
            title: title,
            content: content
        };

        array.push(object);

        console.log("New blog saved:", blog);

        res.render("home", {
            array: array
        });
    } catch (error) {
        console.error("Error saving blog:", error);
    }
});

app.post("/find", (req, res) => {
    let title = req.body.title.toLowerCase();

    let array1 = [];
    findFlag = false;


    array.forEach((object) => {
        if (object.title == title) {
            findFlag = true;
            let object1 =
            {
                title: object.title,
                content: object.content
            }
            array1.push(object1);
            res.render("blogs",
                {
                    array: array1
                });
        }
    });
    if (findFlag == false) {
        res.render("find",
            {
                flag: findFlag
            })
    }
});

app.post("/delete", async (req, res) => {
    let title = req.body.title.toLowerCase();;
    let delFlag = false;

    try {
        const result = await Blog.deleteOne({ titleOfBlog: title });

        if (result.deletedCount > 0) {
            delFlag = true;
            await deleteFromArray(title);
            res.render("blogs", {
                array: array
            });
        }
        else {
            res.render("delete", {
                flag: delFlag
            });
        }
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.render("delete", {
            flag: delFlag
        });
        return;
    }
});

async function deleteFromArray(titleToDelete) {
    array = array.filter(blog => blog.title !== titleToDelete);
    console.log("this is the array after deletion", array);
}


// IN CASE WRONG URL IS ENTERED

app.get("*", (req, res) => {
    res.render("404Page");
});


// LISTENING TO THE PORT HERE

app.listen(4000, () => {
    console.log("i am running at 4000");
})