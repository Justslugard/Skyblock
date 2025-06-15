import { setVisibility, createElement, isObj, family, deepMap, targetCh, hasUndefined } from "./utility.js";

// Main functions for crop list management
export function listButton (element, e, doneButton) {
  createElement(element, "button", {text: "✔"} ).addEventListener("click", () => {
    element.classList.add("done");
    e.cropListDone.appendChild(element);
    if (element.classList.contains("done")) {
      doneButton(element, e, listButton);
    }
  })
  createElement(element, "button", {text: "✎"} ).addEventListener("click", () => {
    const crop = element.dataset.crop;
    const amount = element.dataset.amount;
    const newAmount = askPrompt(`Please enter the new amount of ${crop}`, e, element, amount);
    if (newAmount === undefined) return;
    element.dataset.amount = newAmount;
    element.textContent = `${crop}: x ${newAmount.toLocaleString()}`;
    listButton(element, e, doneButton);
  })
}

export function doneButton (element, e, listButton) {
  element.querySelectorAll("button").forEach(x => {
    x.remove();
  });
  createElement(element, "button", {text: "❌"} ).addEventListener("click", () => {
    element.remove();
  })
  createElement(element, "button", {text: "↺"} ).addEventListener("click", () => {
    element.classList.remove("done");
    element.querySelectorAll("button").forEach(x => {
      if (!(x.textContent === "✔" || x.textContent === "✎")) {
        x.remove();
      }
    })
    element.querySelectorAll("button").forEach(x => {
      setVisibility("show", x);
    });
    e.cropList.appendChild(element);
    listButton(element, e, doneButton);
  })
}

export function resetList (e) {
  e.cropList.innerHTML = "";
  e.cropListDone.innerHTML = "";
  e.crops.value = "";
  e.cropsVariant.value = "";
  setVisibility("hide", e.cropsVariant, e.variantLabel, e.addCrop, e.save, e.reset);
  localStorage.clear();
}

export function askPrompt (message, e, data, x = "") {
  const sameCrop = Array.from(e.cropList.children).find(x => x.dataset.crop === data);
  let amount;
  while (true) {
    amount = prompt(message, x);
    if (amount === null) return;
    amount = amount.trim();
    if (!isNaN(amount) && amount > 0) {
      if (sameCrop) {
        const newAmount = parseInt(sameCrop.dataset.amount) + parseInt(amount);
        sameCrop.textContent = `${data}: x ${newAmount.toLocaleString()}`;
        listButton(sameCrop, e, doneButton, setVisibility, createElement);
        sameCrop.dataset.amount = newAmount;
        return null
      }
      return Number(amount);
    }
    alert("Please enter a valid number!");
  }
}

export function storageFn (method, ...save) {
  let data;
  // console.info(save); //debugging
  if (save.length === 0) return console.error("Elements can't be empty!");
  if (typeof save[0] === "function") {
    [data = null, ...save] = save 
  }
  if (Array.from(save).some(x => typeof x !== "object")) return console.error("Invalid elements!");
  const els = family(save);
  switch (method) {
    case "set":
      if (data === null || typeof data !== "function") return console.error("Invalid data!");
      for (const key in els) {
        const storage = targetCh(els[key], 2).map(data);
        console.log(storage)
        if (!hasUndefined(storage)) {
          localStorage.setItem(key, JSON.stringify(storage));
        }
      }
      break;
    case "get":
      let storage = {};
      for (const key in els) {
        const dats = JSON.parse(localStorage.getItem(key)) ?? [];
        if (dats.length !== 0) storage[key] = dats;
      }
      return isObj(storage) ? storage : null; 
    case "remove":
      for (const key in els) {
        if (localStorage.getItem(key) !== null) {
          localStorage.removeItem(key);
          console.log(`Successfully remove ${key}!`)
        } else console.error(`No storage with the name ${key}!`);
      }
      break;
    case "clear":
      if (localStorage.length !== 0) {
        localStorage.clear();
        console.log("Successfully clear all storage!")
      } else console.error("There aren't any storage!")
  }
}