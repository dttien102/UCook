// Example using Express (Node.js)
const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');
const multer = require('multer');
const bodyParser = require('body-parser');
app.use(bodyParser.json());
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
  { id: 1, name: "Cà chua" }, { id: 2, name: "Hành lá" }, { id: 3, name: "Tỏi" }, { id: 4, name: "Mỳ ý" }, { id: 5, name: "Thịt bò" },
  { id: 6, name: "Hành tây" }, { id: 7, name: "Cà rốt" }, { id: 8, name: "Muối" }, { id: 9, name: "Hạt nêm" }, { id: 10, name: "Sốt cà chua" },
  { id: 11, name: "Bơ" }, { id: 12, name: "Hạt tiêu" }, { id: 13, name: "Húng quế" }, { id: 14, name: "Cá hồi" }, { id: 15, name: "Nước dừa" },
  { id: 16, name: "Hành tím" }, { id: 17, name: "Ớt" }, { id: 18, name: "Rau ngò" }, { id: 19, name: "Chanh" }, { id: 20, name: "Nước mắm" },
  { id: 21, name: "Cá lóc đồng" }, { id: 22, name: "Đậu bắp" }, { id: 23, name: "Thơm" }, { id: 24, name: "Bạc hà" }, { id: 25, name: "Me" },
  { id: 26, name: "Giá đỗ" }, { id: 27, name: "Ớt sừng" }, { id: 28, name: "Ơt hiểm" }, { id: 29, name: "Ngò gai" }, { id: 30, name: "Ngò om" },
  { id: 31, name: "Đường" }, { id: 32, name: "Trứng" }, { id: 33, name: "Bột ngọt" }, { id: 34, name: "Dầu ăn" }
]

function getIngredientIdFromUserInput(userInput) {
  /// Process user Input here
  const index = ingredients.findIndex(i => i.name.toLowerCase() === userInput.toLowerCase());
  if (index === -1) return -1;
  console.log(ingredients[index]);
  return ingredients[index].id;
}

async function getIngredientIdFromImage(req) {
  /// Process the image here


  /// Delete after processing
  fs.unlink(req.file.path, (err) => {
    if (err) {
      console.error(err); // Handle errors during deletion
    } else {
      console.log('Image deleted successfully');
    }
  });
  return 1;
}

// GET endpoints
app.post('/api/dishList/userInput', (req, res) => {
  // Code to fetch dish list based on ingredientID
  console.log(req.body);
  const id = getIngredientIdFromUserInput(req.body.userinput);
  const matchDishes = dishes.filter(dish=>dish.ingredients.includes(id));
  res.json({dishes: matchDishes});
});

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
app.listen(port, () => console.log(`Server listening on port ${port}`));