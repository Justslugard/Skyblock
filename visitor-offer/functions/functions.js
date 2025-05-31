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

export function isObj (obj) {
  if (Object.keys(obj).length !== 0 && typeof obj === "object" && obj) return true;
  return false;
}

export function storageFn (method, ...save) {
  let data;
  //console.info(save); //debugging
  if (save.length === 0) return console.error("Elements can't be empty!");
  if (typeof save[0] === "function") {
    [data = null, ...save] = save 
  }
  if (Array.from(save).some(x => typeof x !== "object")) return console.error("Invalid elements!");
  //console.info(save); //debugging
  const el = Array.from(save).flat(Infinity).map(x => {
    if (x.children?.length > 0) {
      //console.info(x) //debugging
      return x.children;
    } else {
      //console.info(x) //debugging
      return x;
    }
  }).map(x => {
    if (x.length !== undefined) {
      return [...x];
    } else return x;
  }).flat(Infinity);
  //console.info(el); //debugging
  const comb = el.reduce((acc, curr) => {
    const name = (curr.id || curr.parentElement?.id) || (curr.className || curr.parentElement?.className);
    acc[name] = acc[name] || [];
    acc[name].push(curr);
    return acc;
  }, {})
  //console.info(comb); //debugging
  switch (method) {
    case "set":
      if (data === null || typeof data !== "function") return console.error("Invalid data!");
      for (const key in comb) {
        const storage = comb[key].map(data);
        localStorage.setItem(key, JSON.stringify(storage));
      }
      break;
    case "get":
      let storage = {};
      for (const key in comb) {
        const dats = JSON.parse(localStorage.getItem(key)) ?? [];
        if (dats.length !== 0) storage[key] = dats;
      }
      return isObj(storage) ? storage : null; 
    case "remove":
      for (const key in comb) {
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

//Create and manipulate HTML & CSS elements
export function createElement (element, tag, option = {}) {
  const el = document.createElement(tag);
  if (option.text) el.textContent = option.text;
  if (option.class) el.classList.add(...option.class.split(" "));
  if (option.id) el.id = option.id;
  if (option.dataset) {
    Object.entries(option.dataset).forEach(([k, v]) => el.dataset[k] = v);
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

export function resetList (e, visibilityFn) {
  e.cropList.innerHTML = "";
  e.cropListDone.innerHTML = "";
  e.crops.value = "";
  e.cropsVariant.value = "";
  visibilityFn("hide", e.cropsVariant, e.variantLabel, e.addCrop, e.save, e.reset);
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
        listButton(sameCrop, e, doneButton);
        sameCrop.dataset.amount = newAmount;
        return null
      }
      return Number(amount);
    }
    alert("Please enter a valid number!");
  }
}
