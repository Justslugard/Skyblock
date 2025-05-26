//===========================
// Global Variables and 
// Functions
//==========================
import { fetchData, saveStorage, loadStorage, showElement, hideElement, listButton, doneButton, resetList, askPrompt, createElement } from "./data/functions.js";
const idElements = ["cropList", "reset", "crops", "addCrop", "save", "cropsVariant", "variantLabel", "cropListDone"];
const classElements = [".hidden", ".done"];
const e = {};
const c = {};
let cropsVariant = {};
const cropsKey = {
  list: "crops",
  done: "cropsDone"
};

idElements.forEach(x => {
  const el = document.getElementById(x);
  if (el === null) {
    console.log("Element not found: " + x);
  } else {
    e[x] = el;
  }
})

classElements.forEach(x => {
  const el = document.querySelectorAll(x);
  if (el === null) {
    console.log("Classes not found: " + x);
  } else {
    c[x] = el;
  }
})

//==========================
// Event Section
//==========================
e.cropsVariant.addEventListener("change", () => {
  if (e.cropsVariant.value === "") {
    hideElement(e.addCrop);
    hideElement(e.reset);
    hideElement(e.save);
    return
  }
  showElement(e.addCrop);
  showElement(e.reset);
  showElement(e.save);
})


e.crops.addEventListener("change", () => {
  const data = e.crops.value;
  if (data === "") {
    hideElement(e.cropsVariant);
    hideElement(e.variantLabel);
    hideElement(e.addCrop);
    hideElement(e.reset);
    hideElement(e.save);
    return;
  }

  showElement(e.cropsVariant);
  showElement(e.variantLabel);
 
  while (e.cropsVariant.options.length > 1) {
    e.cropsVariant.remove(1);
  }
  cropsVariant[data].forEach(x => {;
    e.cropsVariant.appendChild(createElement(null, "option", {
      text: x,
      attrs: {
        value: x
      }
    }));
  })
})

e.addCrop.addEventListener("click", () => {
  const data = e.cropsVariant.value;
  if (data === "") {
    alert("Please select a crop variant");
    return;
  }
  const amount = askPrompt("Please enter the amount of " + data, e, data)
  if (amount === undefined || amount === null) return;
  const li = createElement(e.cropList, "list", {text: `${data}: x ${amount.toLocaleString()}`});
  li.dataset.crop = data;
  li.dataset.amount = amount;
  listButton(li, e, doneButton);
})

e.reset.addEventListener("click", () => {
  if (e.cropList.children.length === 0) {
    alert("There is no crop to reset");
    return;
  }
  const confirmReset = confirm("Are you sure you want to reset the crop list?");
  if (!confirmReset) return;
  resetList(e, cropsKey, hideElement);
  alert("Crop List Reset!");
})

e.save.addEventListener("click", () => {
  if (e.cropList.children.length === 0 && e.cropListDone.children.length === 0) {
    alert("Please add a crop before saving");
    return;
  }
  const confirmSave = confirm("Are you sure you want to save the crop list?");
  if (!confirmSave) return;
  saveStorage(e.cropList.children, cropsKey["list"]);
  saveStorage(e.cropListDone.children, cropsKey["done"]);
  alert("Crop Saved!");
})

window.addEventListener("load", async () => {
  e.cropList.innerHTML = "";
  e.cropListDone.innerHTML = "";
  e.crops.value = "";
  e.cropsVariant.value = "";
  const cropData = loadStorage(cropsKey["list"]);
  const cropDataDone = loadStorage(cropsKey["done"]);
  if (cropData) {
    cropData.forEach(x => {
      const li = createElement(e.cropList, "list", {text: x.text});
      li.dataset.crop = x.crop;
      li.dataset.amount = x.amount;
      listButton(li, e, doneButton);
    })
  }
  if (cropDataDone) {
    cropDataDone.forEach(x => {
      const li = createElement(e.cropListDone, "list", {text: x.text});
      li.dataset.crop = x.crop;
      li.dataset.amount = x.amount;
      li.classList.add("done");
      doneButton(li, e, listButton);
    })
  }
  try {
    const data = await fetchData();
    cropsVariant = data;
    console.log("Crop data loaded successfully");
  } catch (error) {
    console.error("Error fetching crop data:", error);
    alert("Failed to load crop data. Please try again later.");
  }
})
