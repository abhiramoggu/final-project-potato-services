## 🥔 **Potato Services**

**Potato Services** offers a broad set of features designed to enhance the volunteer matching experience for both individuals and organizations.

Users can create personalized profiles, enabling them to log in, manage their activities, and track their posts and applications easily.  
The **Home Page** acts as a central hub, displaying all available volunteer opportunities categorized and timestamped for quick browsing.

Users can **create and delete posts** to seek volunteers, specifying titles, content, categories, and locations with **Google Maps integration**.  
The platform also supports **comments, likes, and reports**, promoting interaction and community trust.

Advanced **search filters** allow sorting by time, category, or keywords, while the **application feature** makes it easy to apply directly to volunteer posts — simplifying communication between volunteers and organizations.

---

## **Steps to Deploy the App (for the Administrator)**

Follow the user tutorial provided

1. **Download the React App**:
   Download the ZIP file of the React app and extract it. This will give you
   a folder named final-project-potato-services.

2. **Open the Project in an IDE**:
   Open the extracted folder (final-project-potato-services) in an
   Integrated Development Environment (IDE) like Visual Studio Code
   (VSC).

3. **Update the IP Address**:
   Open the files you uploaded earlier in the IDE and update the IP
   address settings. You can find your current IP address on a MacBook
   by going to:

   > **Settings - Wi-Fi - [Your Connected Network] - IP Address**
   > Use the "Find and Replace" feature in your IDE to replace the existing
   > IP address in all the files including CreatePost.js, Home.js, Login.js,
   > Profile.js, Signup.js, App.js with your current IP address.

4. **Start the Backend Server**:
   Open two terminal windows in your IDE.
   In the first terminal, navigate to the src directory by running: `cd src`
   Start the server by running: `node server.js`
   If the terminal outputs messages indicating that tables were
   successfully created, then the server is set up correctly and running.
   The above result shows successful running of the server as well as
   connection with the database.

5. **Start the Frontend**
   In the second terminal, start project by running: `npm start`
   The above result shows successful rendering of the project on your
   browser.
   The React app will open in your default browser at
   http://localhost:3000. However, to allow accessing the application on
   your own network follow the next step.

6. **FINAL: Access the App on Your Network**:
   In the terminal where you ran the npm start, you will see an "On Your
   Network" link provided by React. This link allows you to access the app
   from other devices connected to the same network. Share this link to
   access the link on different devices for the users.

**Troubleshooting**

- Ensure that your IP address is correctly configured in the app to match
  your device's current IP address. This is crucial for accessing the app
  via the "On Your Network" link.

- If you encounter any issues with node_sqlite3, when you try to start the
  backend server as “node server.js” make sure to allow it through your
  system’s security settings, as described above:

1. Click “OK” and Go to **Settings - Privacy & Security** and allow the
   node_sqlite3 component to run by clicking "Allow Anyway."
2. Run node server.js on the same terminal again. The server should run
   , and the database connection will be established.

## **Steps to Access the Database (for the Administrator)**

1. **Navigate to the Project Directory**
   Open the terminal and navigate to the project directory by typing the
   follows: `cd /final-project-potato-services`
   The move into the source folder: `cd src`
2. **Access the Database**
   Enter the following to access the database:
   `sqlite3 db.sqlite`
   For first-timers (make the necessary installation):
   `brew install sqlite`
3. **View Tables and Information**
   To view all the existing tables: .tables
   To view all the rows in a specific table, say posts: `SELECT * from
comments`
4. **Exit Table View**
   To exit the tables: `.exit`
