// Example using Express (Node.js)
const express = require('express');
const path = require('path');
const app = express();
const fs = require('fs');

const dishes = [
    { name: 'Cà chua sốt Cá hồi', id: 1 },
    { name: 'Cà chua sốt mì Ý thịt bò', id: 2 },
    { name: 'Canh cà chua', id: 3 },
    { name: 'Canh chua cá lóc', id: 4}
  ];
const recipe = "Cà chua sôt mỳ ý thịt bò\n  * Nguyên liệu: \n  100g mỳ ý\n  1 miếng thịt bò\n  2 quả cà chua\n  1/4 hành tây\n  nửa củ cà rốt\n  1/2 muỗng muối\n  hạt nêm\n  2 tép tỏi\n  2 thìa to sốt cà chua\n  15g bơ\n  hạt tiêu\n  lá húng quế\n  \n  * Cách làm:\n  - Xay thịt bò (thịt lợn đều được), tỏi, hành tây, cà rốt.\n  - Thái miếng cà chua.\n  - Bật chảo nóng rồi thả bơ vào, rồi thả tỏi và hành tây đã xay vào xào cho thơm đến khi ngả vàng.\n  - Thả thịt đã xay vào xào chín.\n  - Thả cà rốt, cà chua vào xào tiếp.\n  - Đổ sốt cà chua vào, xào đến khi vừa chín tới thì thả thêm húng quế, hạt tiêu, muối, hạt nêm.\n  - Vặn lửa nhỏ đun chín tương cà chua thịt bò.\n  - Dùng một nồi nước khác đun nước sôi, rồi thả mỳ vào, cho chút muối đun khoảng 7 – 8 phút là được.\n  - Gắp mỳ ra đĩa, rồi đổ sốt cà chua đã chưng lên trên là xong.";
// GET endpoints
app.get('/api/dishList/:ingredientID', (req, res) => {
  // Code to fetch dish list based on ingredientID
  const dishesWithImages = dishes.map(dish => ({
    ...dish,
    imageUrl: path.join(__dirname, 'assets', `${dish.id}.jpg`) // Assuming image filenames match dish IDs
  }));
  console.log("signal Get Dishes");
  res.json({dishes: dishes});
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
app.post('/api/ingredient', (req, res) => {
  // Code to handle encrypted image and identify ingredientID
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