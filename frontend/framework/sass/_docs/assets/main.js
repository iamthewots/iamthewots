let data;

try {
  const response = await fetch("./assets/data.json");
  data = await response.json();
} catch (error) {
  console.log(error);
}

const classNamesSelectElement = document.getElementById("class-names-select");
const addClassButton = document.getElementById("add-class-button");
const targetElement = document.getElementById("target-element");

data.classNames.forEach((className) => {
  const optionElement = document.createElement("option");
  let mainClassName = "";

  if (Array.isArray(className)) {
    mainClassName = className[0];
  } else {
    mainClassName = className;
  }

  mainClassName = mainClassName.slice(1);
  optionElement.value = mainClassName;
  optionElement.innerText = className;
  classNamesSelectElement.appendChild(optionElement);
});

addClassButton.addEventListener("click", updateTargetElementClassList);

function updateTargetElementClassList() {
  const newClassName = classNamesSelectElement.value;

  if (!newClassName) {
    return;
  }

  targetElement.classList.add(newClassName);
}
