Sindhu Agencies Portal (MERN Stack)

Sindhu Agencies Portal is a full-stack MERN application designed to manage wholesale FMCG product distribution and bulk order placement. The system allows retailers to browse products, place bulk orders, and manage order details through a structured interface.
The application connects a React frontend with a Node.js and Express backend, powered by MongoDB Atlas for cloud database storage.
Live Backend
Backend API is deployed on Render:
https://sindhu-agencies-backend.onrender.com/
Example endpoints:
https://sindhu-agencies-backend.onrender.com/api/products�
https://sindhu-agencies-backend.onrender.com/api/orders�
Project Overview
Sindhu Agencies is a wholesale distributor serving retailers around Kaveripattinam, Krishnagiri District.
The portal provides:
Product listing with agency details
Bulk order placement
Order editing and deletion
Agency and product relationship management
Backend API integration with MongoDB Atlas
Cloud deployment using Render
Tech Stack
Frontend:
React
JavaScript (ES6+)
CSS
Fetch API
Backend:
Node.js
Express.js
MongoDB Atlas
Mongoose
Express Validator
Deployment:
Backend hosted on Render
Frontend hosted separately
Database hosted on MongoDB Atlas
Folder Structure
Agencies-Portal-Using-Mern-Stack/
frontend/
src/
package.json
backend/
src/
server.mjs
Models/
Routes/
package.json
.env
Features
Product Management
Fetch products from MongoDB
Populate agency details
Display categorized wholesale items
Order Management
Create new bulk orders
Update existing orders
Delete orders
Fetch all orders with populated product and agency details
Database Relationships
Product references Agency using ObjectId
Order references Product
Double populate for full order details
REST API Endpoints
Products:
GET /api/products
GET /api/products/:id
Orders:
GET /api/orders
GET /api/orders/:id
POST /api/orders
PATCH /api/orders/:id
DELETE /api/orders/delete/:id
Agencies:
GET /api/agencies
Environment Variables
Create a .env file inside the backend folder:
MONGO_URL=your_mongodb_atlas_connection_string
Make sure to configure environment variables in production hosting platforms like Render.
Installation (Local Development)
Clone the repository
git clone https://github.com/your-username/Agencies-Portal-Using-Mern-Stack.git�
Install backend dependencies
cd backend
npm install
Install frontend dependencies
cd ../frontend
npm install
Start backend
cd backend
node src/server.mjs
Start frontend
cd frontend
npm run dev   (or npm start depending on setup)
Deployment
Backend:
Hosted on Render
Environment variable configured for MongoDB connection
Database:
MongoDB Atlas cloud database
Learning Outcomes
Through this project:
Implemented REST API architecture
Designed MongoDB schema relationships using references
Used populate for relational data retrieval
Managed asynchronous operations using async/await
Integrated deployed backend with frontend
Handled production environment variables
