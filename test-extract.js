const editFormLink = "https://docs.google.com/forms/d/1X-xxxxxx/edit";
let formId = "";
const match = editFormLink?.match(/\/d\/([a-zA-Z0-9-_]+)\//);
if (match && match[1]) {
  formId = match[1];
}
console.log(formId);
