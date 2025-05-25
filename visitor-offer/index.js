//===========================
// Global Variables and 
// Functions
//==========================
import { createOption, createList, fetchData, saveStorage, loadStorage, showElement, hideElement, listButton, doneButton, resetList } from "./data/functions.js";
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
e.crops.addEventListener("change", () => {
  const data = e.crops.value;
  if (data === "") {
    hideElement(e.cropsVariant);
    hideElement(e.variantLabel);
    return;
  }

  showElement(e.cropsVariant);
  showElement(e.variantLabel);

  while (e.cropsVariant.options.length > 1) {
    e.cropsVariant.remove(1);
  }
  cropsVariant[data].forEach(x => {;
    e.cropsVariant.appendChild(createOption(x));
  })
})

e.addCrop.addEventListener("click", () => {
  const data = e.cropsVariant.value;
  const sameCrop = Array.from(e.cropList.children).find(x => x.dataset.crop === data);
  if (data === "") {
    alert("Please select a crop variant");
    return;
  }
  let amount;
  while (true) {
    amount = prompt(`Please enter the amount of ${data}`);
    if (amount === null) return;
    amount = amount.trim();
    if (!isNaN(amount) && amount > 0) {
      if (sameCrop) {
        const newAmount = parseInt(sameCrop.dataset.amount) + parseInt(amount);
        sameCrop.dataset.amount = newAmount;
        sameCrop.textContent = `${data}: x ${newAmount.toLocaleString()}`;
        listButton(sameCrop, e, doneButton);
        return;
      }
      console.log(`User have selected ${amount} of ${data}`);
      amount = Number(amount);
      const li = createList(e.cropList ,`${data}: x ${amount.toLocaleString()}`);
      li.dataset.crop = data;
      li.dataset.amount = amount;
      listButton(li, e, doneButton);
      return
    }
    alert("Please enter a valid number!");
  }
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
  const cropData = loadStorage(cropsKey["list"]);
  const cropDataDone = loadStorage(cropsKey["done"]);
  const data = await fetchData();
  if (cropData) {
    cropData.forEach(x => {
      const li = createList(e.cropList, x.text);
      li.dataset.crop = x.crop;
      li.dataset.amount = x.amount;
      listButton(li, e, doneButton);
    })
  }
  if (cropDataDone) {
    cropDataDone.forEach(x => {
      const li = createList(e.cropListDone, x.text);
      li.dataset.crop = x.crop;
      li.dataset.amount = x.amount;
      li.classList.add("done");
      doneButton(li, e, listButton);
    })
  }
  if (!data) {
    alert("Error loading data");
    return;
  }
  cropsVariant = data;
  console.log("Crops Variant loaded successfully!");
})
