//===========================
// Global Variables and 
// Functions
//==========================
import { listButton, doneButton, resetList, askPrompt } from "./functions/mainFn.js";
import { setVisibility, fetchData, isObj, storageFn, createElement } from "./functions/utility.js";
const idElements = ["cropList", "reset", "crops", "addCrop", "save", "cropsVariant", "variantLabel", "cropListDone"];
const e = {};
let cropsVariant = {};

idElements.forEach(x => {
  const el = document.querySelector(`#${x}`);
  if (el === null) return console.error("Element not found:", x);
  e[x] = el;
})

//==========================
// Event Section
//==========================
e.cropsVariant.addEventListener("change", () => {
  if (e.cropsVariant.value === "") {
    setVisibility("hide", e.addCrop, e.save);
    return
  }
  setVisibility("show", e.addCrop, e.save);
})

e.crops.addEventListener("change", () => {
  setVisibility("hide", e.cropsVariant, e.variantLabel, e.addCrop, e.save)
  if (e.crops.value !== "") {
    setVisibility("show", e.cropsVariant, e.variantLabel);
  } else if (e.cropsVariant.value !== "") {
    setVisibility("show", e.addCrop, e.save);
  }
  e.cropsVariant.innerHTML = `<option value="">-- Select Variant --</option>`;

  cropsVariant[e.crops.value].forEach(x => {;
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
  const amount = askPrompt("Please enter the amount of " + data, e, data)
  if (amount === undefined || amount === null) return;
  const li = createElement(e.cropList, "li", {text: `${data}: x ${amount.toLocaleString()}`, dataset:{
    crop: data,
    amount: amount
  }});
  listButton(li, e, doneButton);
})

e.reset.addEventListener("click", () => {
  const confirmReset = confirm("Are you sure you want to reset the crop list?");
  if (!confirmReset) return;
  resetList(e);
  alert("Crop List Reset!");
})

e.save.addEventListener("click", () => {
  if (e.cropList.children.length === 0 && e.cropListDone.children.length === 0) {
    alert("There is no crop to save");
    return;
  }
  const confirmSave = confirm("Are you sure you want to save the crop list?");
  if (!confirmSave) return;
  storageFn("set", x => ({
    text: x.firstChild?.textContent,
    ...(isObj(x.dataset) && {
      dataset: {
        crop: x.dataset?.crop,
        amount: x.dataset?.amount
      }
    }),
    ...(x.className === "done" && {class: x.className})
  }), e.cropList, e.cropListDone)
  alert("Crop Saved!");
})

window.addEventListener("load", async () => {
  try {
    const data = await fetchData();
    cropsVariant = data;
    console.log("Crop data loaded successfully");
  } catch (error) {
    console.error("Error fetching crop data:", error);
    alert("Failed to load crop data. Please try again later.");
  }
  setVisibility("hide", e.addCrop, e.save, e.reset);
  e.cropList.innerHTML = "";
  e.cropListDone.innerHTML = "";
  e.crops.value = "";
  e.cropsVariant.value = "";
  const cropData = storageFn("get", e.cropList, e.cropListDone);
  if (cropData !== null) {
    setVisibility("show", e.reset);
    for (const key in cropData) {
        cropData[key].forEach(x => {
          const li = createElement(e[key], "li", {
          text: x.text,
          ...(x.class !== "" && {class: x.class}),
          dataset: {
            crop: x.dataset.crop,
            amount: x.dataset.amount
          }
        }) 
        if (li.className === "done") {
          doneButton(li, e, listButton);
        } else if (li.className === "") {
          listButton(li, e, doneButton);
        }
      })
    }
  }
})