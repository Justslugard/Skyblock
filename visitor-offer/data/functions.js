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

export function createOption(text) {
  const option = document.createElement("option");
  option.value = text;
  option.textContent = text;
  return option;
}

export function createList (element, text) {
  const li = document.createElement("li");
  li.textContent = text;
  element.appendChild(li);
  return li;
}

export function createButton (element, text) {
  const button = document.createElement("button");
  button.textContent = text;
  element.appendChild(button);
  return button;
}

export function hideElement (element) {
  element.classList.add("hidden");
}
export function showElement (element) {
  element.classList.remove("hidden");
}

export function listButton (element, e, doneButton) {
  createButton(element, "✔").addEventListener("click", () => {
    element.classList.add("done");
    e.cropListDone.appendChild(element);
    if (element.classList.contains("done")) {
      doneButton(element, e, listButton);
    }
  })
  createButton(element, "✎").addEventListener("click", () => {
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
  createButton(element, "❌").addEventListener("click", () => {
    element.remove();
  })
  createButton(element, "↺").addEventListener("click", () => {
    element.classList.remove("done");
    element.querySelectorAll("button").forEach(x => {
      if (!(x.textContent === "✔" || x.textContent === "✎")) {
        x.remove();
      }
    })
    element.querySelectorAll("button").forEach(x => {
      x.classList.remove("hidden");
    });
    e.cropList.appendChild(element);
    listButton(element, e, doneButton);
  })
}

export function resetList (e, cropsKey, hideElement) {
  e.cropList.innerHTML = "";
  e.cropListDone.innerHTML = "";
  e.crops.value = "";
  e.cropsVariant.value = "";
  hideElement(e.cropsVariant);
  hideElement(e.variantLabel);
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
        sameCrop.dataset.amount = newAmount;
        sameCrop.textContent = `${data}: x ${newAmount.toLocaleString()}`;
        listButton(sameCrop, e, doneButton);
        return;
      }
      return Number(amount);
    }
    alert("Please enter a valid number!");
  }
}