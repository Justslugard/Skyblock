//Loading data
export async function fetchData () {
  try {
    const res = await fetch("./data/cropsVariant.json");
    const data = await res.json();
    console.log("Data loaded successfully!");
    return data;
  } catch (error) {
    console.error("Error parsing JSON:", error);
    return null;
  }
}

export function saveStorage(save, key) {
  const storage = Array.from(save).map(x => ({
    crop: x.dataset.crop,
    amount: x.dataset.amount,
    text: x.firstChild.textContent
  }));
  localStorage.setItem(key, JSON.stringify(storage));
}

export function loadStorage(key) {
  const storage = JSON.parse(localStorage.getItem(key));
  if (!storage) return null;
  return storage;
}

//Create and manipulate HTML & CSS elements
export function createElement (element, tag, option = {}) {
  /*
  Creates an HTML element with text, value, class, id, dataset, and attributes. arg for option = (text, value, class, id, dataset(obj), attributes(obj))
   */
  const el = document.createElement(tag);
  if (option.text) el.textContent = option.text;
  if (option.class) el.classList.add(...option.class.split(" "));
  if (option.id) el.id = option.id;
  if (option.dataset) {
    Object.entries(option.dataset).forEach(([k, v]) => option.dataset[k] = v);
  }
  if (option.attrs) {
    Object.entries(option.attrs).forEach(([k, v]) => {
      el.setAttribute(k, v);
    });
  }
  if (element) element.appendChild(el);
  return el;
}

export function setVisibility (display, ...elements) {
  elements.forEach(x => x.classList[display === "hide" ? "add" : "remove"]("hidden"));
}

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

export function doneButton (element, e, listButton, visibilityFn) {
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
      visibilityFn("show", x);
    });
    e.cropList.appendChild(element);
    listButton(element, e, doneButton);
  })
}

export function resetList (e, cropsKey, visibilityFn) {
  e.cropList.innerHTML = "";
  e.cropListDone.innerHTML = "";
  e.crops.value = "";
  e.cropsVariant.value = "";
  visibilityFn("hide", e.cropsVariant, e.variantLabel, e.addCrop, e.save, e.reset);;
  localStorage.removeItem(cropsKey["list"]);
  localStorage.removeItem(cropsKey["done"]);
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
        listButton(sameCrop, e, doneButton);
        sameCrop.dataset.amount = newAmount;
        return null
      }
      return Number(amount);
    }
    alert("Please enter a valid number!");
  }
}