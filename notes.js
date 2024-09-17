import { saveDataToDB } from "./saveData.js";

const editor = document.getElementById("editor");
const save = document.getElementById("save");
const bold = document.getElementById("bold-text");
const italic = document.getElementById("italic-text");
const underline = document.getElementById("underline-text");
const orderedList = document.getElementById("ordered-list");
const unorderedList = document.getElementById("unordered-list");
const fontSize = document.getElementById("font-size");
const heading = document.getElementById("heading");
const subscript = document.getElementById("subscript");
const superscript = document.getElementById("superscript");
const strikeThrough = document.getElementById("strike-through");
const alignLeft = document.getElementById("align-left");
const alignCenter = document.getElementById("align-center");
const alignRight = document.getElementById("align-right");
const emojiButton = document.getElementById("emoji-button");
let selectedText = "";

function execCommandDependencies() {
  if (!document.execCommand) {
    displayFlashMessage(
      `You're fucked! Your browser decided to choose voilence, so it stopped supporting the only API that enable almost all the features of this app. If anything work, thank your God.`,
      "red",
      7000
    );
  }

  fontSize.addEventListener("change", (e) => {
    document.execCommand("fontSize", false, e.target.value);
  });

  bold.addEventListener("click", () => {
    document.execCommand("bold", false, null);
    if (!bold.classList.contains("active")) {
      bold.classList.add("active");
    } else {
      bold.classList.remove("active");
    }
  });

  italic.addEventListener("click", () => {
    document.execCommand("italic", false, null);
    if (!italic.classList.contains("active")) {
      italic.classList.add("active");
    } else {
      italic.classList.remove("active");
    }
  });

  underline.addEventListener("click", () => {
    document.execCommand("underline", false, null);
    if (!underline.classList.contains("active")) {
      underline.classList.add("active");
    } else {
      underline.classList.remove("active");
    }
  });

  orderedList.addEventListener("click", () => {
    document.execCommand("insertOrderedList", false, null);
    if (!orderedList.classList.contains("active")) {
      orderedList.classList.add("active");
    } else {
      orderedList.classList.remove("active");
    }
  });

  unorderedList.addEventListener("click", () => {
    document.execCommand("insertUnorderedList", false, null);
    if (!unorderedList.classList.contains("active")) {
      unorderedList.classList.add("active");
    } else {
      unorderedList.classList.remove("active");
    }
  });

  subscript.addEventListener("click", function () {
    document.execCommand("subscript", false, null);

    if (!subscript.classList.contains("active")) {
      subscript.classList.add("active");
    } else {
      subscript.classList.remove("active");
    }
  });

  superscript.addEventListener("click", function () {
    document.execCommand("superscript", false, null);

    if (!superscript.classList.contains("active")) {
      superscript.classList.add("active");
    } else {
      superscript.classList.remove("active");
    }
  });

  strikeThrough.addEventListener("click", function () {
    document.execCommand("strikeThrough", false, null);
    if (!strikeThrough.classList.contains("active")) {
      strikeThrough.classList.add("active");
    } else {
      strikeThrough.classList.remove("active");
    }
  });

  alignLeft.addEventListener("click", function () {
    document.execCommand("justifyLeft", false, null);

    if (!alignLeft.classList.contains("active")) {
      alignLeft.classList.add("active");
      alignCenter.classList.remove("active");
      alignRight.classList.remove("active");
    }
  });

  alignCenter.addEventListener("click", function () {
    document.execCommand("justifyCenter", false, null);

    if (!alignCenter.classList.contains("active")) {
      alignCenter.classList.add("active");
      alignRight.classList.remove("active");
      alignLeft.classList.remove("active");
    }
  });

  alignRight.addEventListener("click", function () {
    document.execCommand("justifyRight", false, null);

    if (!alignRight.classList.contains("active")) {
      alignRight.classList.add("active");
      alignCenter.classList.remove("active");
      alignLeft.classList.remove("active");
    }
  });

  document.getElementById("undo").addEventListener("click", () => {
    document.execCommand("undo");
  });

  document.getElementById("redo").addEventListener("click", () => {
    document.execCommand("redo");
  });
}

execCommandDependencies();

document.getElementById("exit-button").addEventListener("click", function () {
  try {
    // Close the browser tab
    window.close();

    setTimeout(() => {
      if (!window.close()) {
        displayFlashMessage(
          "Your browser decline the exit request. Please close the tab to exit.",
          "red",
          4000
        );
      }
    }, 500);
  } catch (e) {
    console.log(e);
  }
});

emojiButton.addEventListener("click", function () {
  editor.focus();
});

const toggleMenu = document.getElementById("file-menu");
const dropDown = document.getElementById("drop-down-menu");
const editToggle = document.getElementById("edit");
const editDropDown = document.getElementById("edit-menu");

toggleMenu.addEventListener("click", () => {
  if (dropDown.style.display === "none" || dropDown.style.display === "") {
    dropDown.style.display = "block";
  } else {
    dropDown.style.display = "none";
  }
});

editToggle.addEventListener("click", () => {
  if (
    editDropDown.style.display === "none" ||
    editDropDown.style.display === ""
  ) {
    editDropDown.style.display = "block";
  } else {
    editDropDown.style.display = "none";
  }
});

toggleMenu.addEventListener("mouseenter", function () {
  dropDown.style.display = "block";
  if ((editDropDown.style.display = "block")) {
    editDropDown.style.display = "none";
  }
});

editToggle.addEventListener("mouseenter", function () {
  editDropDown.style.display = "block";
  if ((dropDown.style.display = "block")) {
    dropDown.style.display = "none";
  }

  selectedText = getSelectedText();
});

document.addEventListener("click", (e) => {
  // Check if the click target is not inside the targetDiv
  if (!dropDown.contains(e.target) && e.target !== toggleMenu) {
    dropDown.style.display = "none";
  }

  if (!editDropDown.contains(e.target) && e.target !== editToggle) {
    editDropDown.style.display = "none";
  }
});

function addBeforeUnloadWarning() {
  // Add the beforeunload event listener
  window.addEventListener("beforeunload", beforeUnloadHandler);
}

function removeBeforeUnloadWarning() {
  // Remove the beforeunload event listener
  window.removeEventListener("beforeunload", beforeUnloadHandler);
}

function beforeUnloadHandler(e) {
  e.preventDefault();
  e.returnValue =
    "You have unsaved changes. Are you sure you want to leave this page?";
}

document.addEventListener("DOMContentLoaded", function () {
  heading.addEventListener("click", function () {
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const startContainer = range.startContainer;
    const parentElement = startContainer.parentElement;
    if (editor.textContent.length < 1) {
      displayFlashMessage("Enter some text first", "#04aa12", 2000);
      return;
    }
    if (parentElement === editor) {
      // If the parent element is the editor itself, create a new H1 element
      const h1Element = document.createElement("h1");
      h1Element.textContent = "New Heading"; // You can set a default heading text
      editor.insertBefore(h1Element, editor.firstChild);
    } else if (parentElement.tagName === "H1") {
      // Remove the H1 tag
      const textNode = document.createTextNode(parentElement.textContent);
      parentElement.parentNode.replaceChild(textNode, parentElement);
    } else {
      // Convert the current line to H1
      const h1Element = document.createElement("h1");
      h1Element.textContent = parentElement.textContent;
      parentElement.parentNode.replaceChild(h1Element, parentElement);
    }
  });
});

const autoSaveCheckbox = document.getElementById("auto-save");
document.getElementById("auto").addEventListener("click", () => {
  if (!autoSaveCheckbox.checked) {
    autoSaveCheckbox.checked = true;
  } else {
    autoSaveCheckbox.checked = false;
  }
});
let saved = false;

// Load the editor content from localStorage, if available
const savedContent = localStorage.getItem("editorContent");
if (savedContent) {
  editor.innerHTML = savedContent;
}

// Event listener to handle manual save
save.addEventListener("click", function () {
  saveEditorContent();
  displayFlashMessage(
    "Content has been saved to your browsers' storage. You can use auto save to automatically save progress. Use Save As to download to your device.",
    "#04aa12",
    5000
  );
});

editor.addEventListener("input", function () {
  if (!saved) {
    addBeforeUnloadWarning();
  }

  if (autoSaveCheckbox.checked) {
    setTimeout(() => {
      saveEditorContent();
    }, 500);
  }
});

let saveTimeout = null;
// Function to save the editor content to localStorage
function saveEditorContent() {
  const editorContent = editor.innerHTML;
  localStorage.setItem("editorContent", editorContent);

  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  // Set a new timeout for 30 seconds to save data to the database
  saveTimeout = setTimeout(() => {
    saveDataToDB("Your notes entries have been saved to the database.");
  }, 30000);

  dropDown.style.display = "none";
  removeBeforeUnloadWarning();
  saved = true;
}

const copy = document.getElementById("copy");

function copyToClipboard() {
  const text = selectedText;
  console.log(text);
  if (!text) {
    displayFlashMessage("You have not selected any text", "red", 3000);
    return;
  }
  navigator.clipboard.writeText(text);
  copy.textContent = "Copied!";

  setTimeout(() => {
    copy.textContent = "Copy";
  }, 1000);
}

copy.addEventListener("click", copyToClipboard);

function getSelectedText() {
  if (window.getSelection) {
    selectedText = window.getSelection().toString();
  } else if (document.selection && document.selection.type != "Control") {
    selectedText = document.selection.createRange().text;
  }
  return selectedText;
}

const downloadPlainLink = document.getElementById("download-link-plain");
const downloadTextLink = document.getElementById("download-link-html");

downloadPlainLink.addEventListener("click", savePlainFile);
downloadTextLink.addEventListener("click", saveTextFile);

document.getElementById("export").addEventListener("click", () => {
  savePlainFile();
  displayFlashMessage(
    "Your file has been exported successfully, click 'Save As' to download to your device.",
    "#04aa12",
    5000
  );
  downloadPlainLink.style.fontWeight = "bold";
});

function savePlainFile() {
  // Text content to be exported
  const textToExport = editor.textContent;

  const blob = new Blob([textToExport], { type: "text/plain" });
  downloadPlainLink.download = fileName("text-editor-file-js-plain");

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Set the download link's href attribute to the Blob URL
  downloadPlainLink.href = url;
}

function saveTextFile() {
  // Text content to be exported
  const textToExport = editor.innerHTML;

  // Create a Blob containing the text
  const blob = new Blob([textToExport], { type: "text/html" });
  downloadTextLink.download = fileName("text-editor-file-js");
  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Set the download link's href attribute to the Blob URL
  downloadTextLink.href = url;
}

function fileName(defaultValue) {
  let userFileName = prompt("File name:", defaultValue);
  if (!userFileName) {
    userFileName = prompt("File name:", defaultValue);
  }

  userFileName = removeNonLettersAndHyphens(userFileName).toLowerCase();
  return `${userFileName}.txt`;
}

function removeNonLettersAndHyphens(inputString) {
  //Regular expression to remove anything other than letters and hyphens
  const cleanedString = inputString.replace(/[^a-zA-Z-]/g, "");
  return cleanedString;
}

let codeInitiated = false;
const codeButton = document.getElementById("code");
codeButton.addEventListener("click", () => {
  if (!codeButton.classList.contains("active")) {
    codeButton.classList.add("active");
  } else {
    codeButton.classList.remove("active");
  }
  if (!codeInitiated) {
    let code = formatHTMLWithLineBreaks(editor.innerHTML);
    editor.textContent = code;
    codeInitiated = true;
  } else {
    let text = editor.textContent;
    editor.innerHTML = text;
    codeInitiated = false;
  }
});

function formatHTMLWithLineBreaks(html) {
  // Use regular expressions to insert a newline character before each opening tag
  const formattedHTML = html.replace(/<[^>]+>/g, "\n$&");

  return formattedHTML;
}

const notesScreen = document.querySelector(".notes-container");

document.getElementById("notes").addEventListener("click", () => {
  notesScreen.style.display = "block";
  showLoader();

  setTimeout(() => {
    closeMenu();
    hideLoader();
    document.getElementById("editor").focus();
  }, 400);
});

document.getElementById("close-notes").addEventListener("click", () => {
  notesScreen.style.display = "none";
});
