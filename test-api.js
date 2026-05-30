const fs = require('fs');
const dotenv = require('dotenv');
const envConfig = dotenv.parse(fs.readFileSync('.env.local'))
for (const k in envConfig) {
  process.env[k] = envConfig[k]
}
const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;

async function test() {
  const url = new URL(APPS_SCRIPT_URL);
  url.searchParams.set("action", "update");
  url.searchParams.set("formId", "dummy-id");
  url.searchParams.set("description", "Testing 123");

  console.log("Fetching URL length:", url.toString().length);
  const response = await fetch(url.toString(), {
    method: "GET",
    redirect: "follow",
  });
  console.log(await response.text());
}
test();
