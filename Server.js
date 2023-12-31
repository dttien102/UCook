// Example using Express (Node.js)
const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // Save images in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use original filename
  }
});

const upload = multer({ storage: storage });

const dishes = [
    { name: 'Cà chua sốt Cá hồi', id: 1, ingredients: [1,3,5] },
    { name: 'Cà chua sốt mì Ý thịt bò', id: 2, ingredients: [1,2,5] },
    { name: 'Canh cà chua', id: 3, ingredients: [1,2,3] },
    { name: 'Canh chua cá lóc', id: 4, ingredients: [1,3,4]}
  ];
// GET endpoints
app.get('/api/dishList/:ingredientID', (req, res) => {
  // Code to fetch dish list based on ingredientID
  const id = parseInt(req.params.ingredientID);
  const matchDishes = dishes.filter(dish=>dish.ingredients.includes(id));
  console.log("signal Get Dishes");
  res.json({dishes: matchDishes});
});

app.get('/api/recipe/:dishId', (req, res) => {
  // Code to fetch recipe text based on dishId
  const recipeId = req.params.dishId;
  const recipePath = path.join(__dirname,'assets',recipeId + '.txt');
  if(fs.existsSync){
    const recipeBuffer = fs.readFileSync(recipePath).toString();
    console.log(recipeBuffer);
    res.json({id: req.params.dishId, recipe: recipeBuffer})
  }else{
    res.status(404).json({recipe: 'No Recipe Found'});
  }
  
});

// POST endpoint
app.post('/api/dishList',upload.single('image'), (req, res) => {
  // Code to handle encrypted image and identify ingredientID
  
  // Process the image thru 'req.file'
  const id = 1;
  ////
  
  fs.unlink(req.file.path, (err) => {
    if (err) {
      console.error(err); // Handle errors during deletion
    } else {
      console.log('Image deleted successfully');
    }
  });
  res.status(200).json({id: id});
});

app.get('/api/dishImage/:dishId', (req, res) => {
    const imageName = req.params.dishId; // Access the dishId from the URL params
    const imagePath = path.join(__dirname, 'assets', imageName + '.jpg'); // Construct image path
  console.log(imagePath);
    if (fs.existsSync(imagePath)) { // Check if the image exists
      // Read image data
      const imageBuffer = fs.readFileSync(imagePath);
  
      // Send image in response
      res.set({
        'Content-Type': 'image/jpeg' // Adjust for your image format
      });
      res.send(imageBuffer);
    } else {
      res.status(404).send('Image not found'); // Handle missing image
    }
  });
  
const port = process.env.PORT || 3000;
app.listen(port,() => console.log(`Server listening on port ${port}`));