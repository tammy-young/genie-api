<p align="center">
  <img src="https://github.com/tammy-young/genie/blob/main/public/genie-logo.png" />
</p>

# Genie API 🧞
Stardoll API Wrapper built with [Express.js](https://expressjs.com/).

# Frontend 🎨
Please see the [Genie UI](https://github.com/tammy-young/genie).

# Installation 🛠️
To run the Genie API locally, first clone the repository.
```bash
git clone https://github.com/tammy-young/genie-api.git
```
Open a terminal in the project and do a `npm i`. This will install all the required dependencies. Then, follow the instructions below for configuring your environment and running the app.

# Configuring Your Environment ⚙️
Create a `.env` file in the project directory that looks like this:
```dotenv
PDH_USER=YOUR_PDH_USER_COOKIE
ALLOWED_ORIGIN=http://localhost:3000
```
1. Login to [Stardoll](http://www.stardoll.com/en/)
2. Right click > inspect element
3. Find the cookies (usually under the `Application` or `Storage` tab)
4. Copy the value of `pdhUser`
5. Replace `YOUR_PDH_USER_COOKIE` in your `.env` file with the copied value

# Running Locally 💻
Run `make local` in your terminal to run the Genie API.

# Troubleshooting 🔍
The most common issue you will run into is infinitely long searching. The search function is designed to time out in 8 seconds, or when it finds 20 matching items. If your search is running for a long time, it's likely due to the `PDH_USER` cookie being expired. You will need to follow [the steps above](#configuring-your-environment-%EF%B8%8F) for configuring your environment to replace the `PDH_USER` value in `.env`.

# Security Concerns 🔒
Due to ongoing security concerns, here is a transparent explanation on how Genie works without you having to log in to your Stardoll account.

The [base debug search link](https://www.stardoll.com/en/com/user/getStarBazaar.php?search) requires you to be logged in to use it. After comparing the cookies for a logged in user and one that is logged out, I noticed that the `pdhUser` cookie is the one that tells Stardoll's backend that you're logged in.

By sending this cookie as a header with the `GET` request to the debug search page (see below for how that's done), we can simulate a logged in user. As part of setting up your environment with the `.env` file, you were required to provide this cookie. This cookie will be used to send requests to Stardoll.
```javascript
// utils/fetchData.js

const response = await fetch(url, {
  withCredentials: true,
  headers: {
    Cookie: "pdhUser=" + process.env.PDH_USER + ";"
  }
});
```
