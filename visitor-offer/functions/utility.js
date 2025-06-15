//Tools and utility for DOM
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
  if (obj === undefined) return false;
  if (Object.keys(obj).length !== 0 && typeof obj === "object" && obj && !Array.isArray(obj)) return true;
  return false;
}

export function setVisibility (display, ...elements) {
  elements.forEach(x => x.classList[display === "hide" ? "add" : "remove"]("hidden"));
}

export function family (els) {
  let newEls = {}
  
  for (const el of els) {
    const name = el.id || Array.from(els).indexOf(el);
    if (el.children.length > 0 && el.children) {
      const mm = family(el.children);
      newEls[name] = {
        parent: el,
        children: Object.values(mm).flat(Infinity)
      }
    } else {
      newEls[name] = newEls[name] || []
      newEls[name].push(el);
    }
  }
  return newEls;
}

export function targetCh (arr, loop, co = 1) {
  // console.log(co, arr)
  if ((Array.isArray(arr) ? isObj(...arr) : isObj(arr)) && co < loop) {
    co++;
    const v = isObj(arr) ? targetCh(arr.children, loop, co) : arr.map(x => targetCh(x.children, loop, co));
    return v?.flat();
  } else if (arr instanceof Object) {
    if ((Array.isArray(arr) ? !isObj(...arr) : !isObj(arr))) {
      return arr;
    } else {
      return isObj(arr) ? arr.parent : arr.map(x => x.parent);
    }
  } else {
    console.error("Ts Pmo")
    return arr;
  }
}

export function hasUndefined(data) {
if (data === undefined) return true;
  if (Array.isArray(data)) {
    return data.some(item => hasUndefined(item));
  } else if (typeof data === 'object' && data !== null) {
    return Object.values(data).some(item => hasUndefined(item));
  }
  return false;
}


export function deepMap (arr, fn) {
  const newArr = arr.map(a => {
    if (a === undefined || a === null) return a;
    return Array.isArray(a) ? deepMap(a, fn) : fn(a);
  })
  return newArr;
}

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
