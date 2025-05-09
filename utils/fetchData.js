import 'dotenv/config';
import fetch from 'node-fetch';

async function fetchData(url, html = false) {
  try {
    const response = await fetch(url, {
      withCredentials: true,
      headers: {
        Cookie: "pdhUser=" + process.env.PDH_USER + ";"
      }
    });
    const data = html ? response.text() : response.json();
    return data;
  } catch (e) {}
}

export default fetchData;
