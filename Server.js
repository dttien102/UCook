// Example using Express (Node.js)
const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
const { ImageAnnotatorClient } = require('@google-cloud/vision')



app.use(bodyParser.json());

const visionClient = new ImageAnnotatorClient({
  keyFilename: 'ucook-409913-2eb813ef2042.json', // Replace with the path to your JSON key file
});
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
  { name: 'Cà chua sốt Cá hồi', id: 1, ingredients: [14, 15, 1, 16, 17, 18, 19, 9, 20], time: 30 },
  { name: 'Cà chua sốt mì Ý thịt bò', id: 2, ingredients: [5, 1, 6, 7, 8, 9, 3, 10, 11, 12, 13], time: 40 },
  { name: 'Canh cà chua trứng', id: 3, ingredients: [32, 1, 16, 2, 20, 12, 33, 34], time: 15 },
  { name: 'Canh chua cá lóc', id: 4, ingredients: [21, 22, 23, 1, 24, 25, 26, 3, 27, 28, 29, 30, 9, 8, 31, 20], time: 30 }
];

const ingredients = [
  { id: 1, names: ["Cà chua","tomato"] }, { id: 2, names: ["Hành lá", "scalion"] }, { id: 3, names: ["Tỏi","garlic"] }, { id: 4, names: ["Mỳ ý","pasta","spaghetti"] }, { id: 5, names: ["Thịt bò", "beef"] },
  { id: 6, names: ["Hành tây","onion"] }, { id: 7, names: ["Cà rốt","carrot"] }, { id: 8, names: ["Muối","salt"] }, { id: 9, names: ["Hạt nêm","broth mix","seasoning powder"] }, { id: 10, names: ["Sốt cà chua","ketchup"] },
  { id: 11, names: ["Bơ","butter"] }, { id: 12, names: ["Hạt tiêu","pepper","pepper corn","black pepper"] }, { id: 13, names: ["Húng quế","basil"] }, { id: 14, names: ["Cá hồi","salmon"] }, { id: 15, names: ["Nước dừa","coconut water"] },
  { id: 16, names: ["Hành tím","shallot"] }, { id: 17, names: ["Ớt","chilli"] }, { id: 18, names: ["Rau ngò","cilantro"] }, { id: 19, names: ["Chanh","lemon","lime"] }, { id: 20, names: ["Nước mắm","fish sauce"] },
  { id: 21, names: ["Cá lóc đồng","snake head"] }, { id: 22, names: ["Đậu bắp","okra"] }, { id: 23, names: ["Thơm","pineapple","pine-apple"] }, { id: 24, names: ["Bạc hà","mint"] }, { id: 25, names: ["Me","tamarind"] },
  { id: 26, names: ["Giá đỗ","bean sprout"] }, { id: 27, names: ["Ớt sừng","goat horn pepper","horn pepper"] }, { id: 28, names: ["Ơt hiểm","Bird's eye chili"] }, { id: 29, names: ["Ngò gai","Sawleaf","culantro"] }, { id: 30, names: ["Ngò om","rice paddy herb"] },
  { id: 31, names: ["Đường","sugar"] }, { id: 32, names: ["Trứng","egg","eggs"] }, { id: 33, names: ["Bột ngọt","msg","Monosodium glutamate"] }, { id: 34, names: ["Dầu ăn","oil","cooking oil"] }
]

function findElementIndexByString(data, searchString) {
  console.log(searchString);
  for (let i = 0; i < data.length; i++) {
    const namesArray = data[i].names;
    
    if (namesArray) {
      const index = namesArray.findIndex(name => name.toLowerCase() === searchString.toLowerCase());
      if(index== -1) continue;
      return i; // Return the index if the names array contains the search string
    }
  }

  return -1; // Return -1 if no match is found
}

function getIngredientIdFromUserInput(userInput) {
  /// Process user Input here
  const index = findElementIndexByString(ingredients,userInput);
  if (index === -1) return -1;
  console.log(ingredients[index]);
  return ingredients[index].id;
}

async function getIngredientIdFromImage(req) {
  /// Process the image here
  const [result] = await visionClient.labelDetection(req.file.path);
  const labels = result.labelAnnotations;
  let index = -1;
  for(let i = 0; i < labels.length; i++){
    const findResult = findElementIndexByString(ingredients,labels[i].description);
    if(findResult == -1) continue;
    index = findResult;
    break;
  }
  /// Delete after processing
  fs.unlink(req.file.path, (err) => {
    if (err) {
      console.error(err); // Handle errors during deletion
    } else {
      console.log('Image deleted successfully');
    }
  });
  if(index == -1) return -1;
  return ingredients[index].id;
}

//base API
app.get('/api/', function (req, res) {
  res.send({ message: 'ucook API v1.0' });
});

//GET all dish
app.get('/api/dishlist/', function (req, res) {
  res.status(200).json({ dishes: dishes });
});

// GET endpoint
app.get('/api/recipe/:dishId', (req, res) => {
  // Code to fetch recipe text based on dishId
  const recipeId = req.params.dishId;
  const recipePath = path.join(__dirname, 'assets', recipeId + '.txt');
  if (fs.existsSync) {
    const recipeBuffer = fs.readFileSync(recipePath).toString();
    console.log(recipeBuffer);
    res.json({ id: req.params.dishId, recipe: recipeBuffer })
  } else {
    res.status(404).json({ recipe: 'No Recipe Found' });
  }

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

// POST endpoint
app.post('/api/dishList', upload.single('image'), async (req, res) => {
  // Code to handle encrypted image and identify ingredientID

  // Process the image thru 'req.file'
  const id = await getIngredientIdFromImage(req);
  console.log(id)
  ////


  const matchDishes = dishes.filter(dish => dish.ingredients.includes(id));

  res.status(200).json({ ingredientId: id, dishes: matchDishes });
});


app.post('/api/dishList/userInput', (req, res) => {
  // Code to fetch dish list based on ingredientID
  console.log(req.body);
  const id = getIngredientIdFromUserInput(req.body.userinput);
  const matchDishes = dishes.filter(dish=>dish.ingredients.includes(id));
  res.json({dishes: matchDishes});
});
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server listening on port ${port}`));