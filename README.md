🥔 Potato Services

Potato Services offers a broad set of features designed to enhance the volunteer matching experience for both individuals and organizations.

Users can create personalized profiles, enabling them to log in, manage their activities, and track their posts and applications easily.
The Home Page acts as a central hub, displaying all available volunteer opportunities categorized and timestamped for quick browsing.

Users can create and delete posts to seek volunteers, specifying titles, content, categories, and locations with Google Maps integration.
The platform also supports comments, likes, and reports, promoting interaction and community trust.

Advanced search filters allow sorting by time, category, or keywords, while the application feature makes it easy to apply directly to volunteer posts — simplifying communication between volunteers and organizations.

🚀 Deployment Instructions (For Administrator)

1. Download the React App

Download the ZIP file of the repository and extract it.

You’ll get a folder named final-project-potato-services.

2. Open the Project in an IDE

Open the extracted folder in an IDE such as Visual Studio Code (VSC).

3. Update the IP Address

Find your current IP address on Mac:
Settings → Wi-Fi → [Your Connected Network] → IP Address

In VSC, use Find and Replace (Cmd + Shift + F) to replace the existing IP address across all files:

CreatePost.js

Home.js

Login.js

Profile.js

Signup.js

App.js

Replace the old IP with your current one.

4. Start the Backend Server

Open two terminal windows in your IDE.

Terminal 1:
cd src
node server.js

If you see output confirming that database tables were successfully created, the server is running correctly and connected to the database.

5. Start the Frontend
   Terminal 2:
   npm start

The app will automatically open in your browser at:
👉 http://localhost:3000

To access it from other devices on your network, use the "On Your Network" link that appears in the terminal after running npm start.

6. Accessing the App on Other Devices

Use the "On Your Network" link to open the app on other devices connected to the same Wi-Fi network.

Share this link with other users or testers.

🛠️ Troubleshooting
🔹 IP Address Configuration

Ensure the IP address in your code matches your current device’s IP.
This is essential for connecting from other devices.

🔹 node_sqlite3 Permission

If you see an error while running node server.js:

Click OK on the error dialog.

Go to Settings → Privacy & Security.

Scroll to the security alert for node_sqlite3 and click Allow Anyway.

Re-run:

node server.js

The server should now run and connect to the database successfully.

🗃️ Database Access (For Administrator)

1. Navigate to the Project Directory
   cd ~/Documents/final-project-potato-services/src

2. Open the SQLite Database
   sqlite3 db.sqlite

If you don’t have SQLite installed:

brew install sqlite

3. Common Database Commands

List all tables:

.tables

View all rows in a table (example: comments):

SELECT \* FROM comments;

Exit the SQLite console:

.exit

⚙️ Tech Stack

Frontend: React.js

Backend: Node.js (Express)

Database: SQLite

Map Integration: Google Maps API
