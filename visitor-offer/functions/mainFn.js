import { setVisibility, createElement } from "./utility.js";

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
