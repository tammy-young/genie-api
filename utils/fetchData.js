import 'dotenv/config';
import fetch from 'node-fetch';

async function fetchData(url, html = false, purpose = "") {
  try {
    const pdhUser = purpose === "search" ? process.env.PDH_USER_SEARCH : purpose === "username" ? process.env.PDH_USER_USERNAME : purpose === "wishes" ? process.env.PDH_USER_WISHES : process.env.PDH_USER;
    const response = await fetch(url, {
      withCredentials: true,
      headers: {
        Cookie: "pdhUser=" + pdhUser + ";"
      }
    });
    const data = html ? response.text() : response.json();
    return data;
  } catch (e) { }
}

export default fetchData;
