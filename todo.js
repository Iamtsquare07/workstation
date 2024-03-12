document.addEventListener("DOMContentLoaded", function () {
    const taskDateInput = document.getElementById("taskDate");
    const submitButton = document.getElementById("smbtn");
    const message = document.getElementById("message");
    const listsContainer = document.getElementById("lists");
    const completedContainer = document.getElementById("completedList");
    const completedHeader = document.getElementById("completedHeader");
    const clearBtn = document.getElementById("clear");
    const taskHeader = document.querySelector(".taskHeader");
  
    submitButton.addEventListener("click", addTask);
    document.getElementById("toDo").addEventListener("keypress", function (e) {
      if (e.key === "Enter") addTask();
    });
  
    // Set the value of the date input to the current date (formatted as "YYYY-MM-DD")
    function renderDate() {
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().split("T")[0];
      taskDateInput.value = formattedDate;
    }
  
    renderDate();
  
    function addTask() {
      const input = document.getElementById("toDo");
      const taskDate = taskDateInput.value;
      if (input.value.length === 0 || taskDate === "") {
        alert("Please enter a task");
        input.focus();
        return;
      }
      // Parse the selected date and the current date
      const selectedDate = new Date(taskDate);
      const currentDate = new Date();
      selectedDate.setHours(0, 0, 0, 0); // Set time part to midnight
      currentDate.setHours(0, 0, 0, 0);
  
      // Compare the selected date with the current date
      if (selectedDate < currentDate && selectedDate !== currentDate) {
        alert(
          "Oops! It seems like you've discovered the secret to time travel, but our services are strictly for the present and future. Best of luck with your journey to the past! 🕰️🚀😍"
        );
        return;
      }
  
      clearBtn.style.display = "block";
      taskHeader.textContent = "";
      const taskText = input.value.trim();
  
      const listItem = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "taskCheckbox";
  
      listItem.innerHTML = `
              <span class="taskText">${taskText}</span>
              <button class="editToDo"><i class="fas fa-pen-square"></i> Edit</button>
              <button class="deleteToDo"><i class="fas fa-trash-alt"></i> Delete</button>
          `;
  
      listItem.insertBefore(checkbox, listItem.firstChild);
  
      const taskList = getOrCreateTaskList(taskDate); // Get or create the task list
      taskList.appendChild(listItem);
  
      input.value = "";
      taskDateInput.value = "";
      message.textContent = "Added!";
      setTimeout(() => {
        message.textContent = "";
      }, 2000);
  
      listItem.querySelector(".deleteToDo").addEventListener("click", () => {
        listItem.remove();
      });
  
      listItem.querySelector(".editToDo").addEventListener("click", () => {
        const taskSpan = listItem.querySelector(".taskText");
        const editedText = prompt("Edit the task:", taskSpan.textContent);
        if (editedText !== null) {
          taskSpan.textContent = editedText;
        }
      });
  
      checkbox.addEventListener("change", () => {
        if (checkbox.checked) {
          listItem.querySelector(".taskText").style.textDecoration =
            "line-through";
          taskList.removeChild(listItem);
          addToCompleted(listItem); // Move to completed list
          completedHeader.style.display = "block";
        } else {
          listItem.querySelector(".taskText").style.textDecoration = "none";
          removeFromCompleted(listItem); // Move back to main list
          taskList.appendChild(listItem);
          if (completedContainer.childElementCount === 0) {
            completedHeader.style.display = "none";
          }
        }
      });
  
      renderDate();
    }
  
    function clearList() {
      listsContainer.innerHTML = ""; // Clear all lists
      completedContainer.innerHTML = ""; // Clear completed tasks
      taskHeader.textContent = "Add to your tasklist";
      completedHeader.style.display = "none";
      clearBtn.style.display = "none";
    }
  
    clearBtn.addEventListener("click", clearList);
  
    // Get or create a task list based on the date
    function getOrCreateTaskList(dateString) {
      const formattedDate = formatDate(dateString);
      const listId = `list-${formattedDate}`;
  
      // Check if a list with this date already exists
      let taskList = document.getElementById(listId);
  
      if (!taskList) {
        // Create a new list if it doesn't exist
        taskList = document.createElement("ul");
        taskList.id = listId;
        taskList.className = "taskList";
  
        // Create a heading for the list with the selected date
        const listHeading = document.createElement("h2");
        listHeading.textContent = formattedDate;
        taskList.appendChild(listHeading);
  
        // Append the list to the lists container
        listsContainer.appendChild(taskList);
      }
  
      return taskList;
    }
  
    // Function to format the date
    function formatDate(dateString) {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, options);
    }
  
    // Function to add completed task to the completed list
    function addToCompleted(taskItem) {
      completedContainer.appendChild(taskItem);
    }
  
    // Function to remove completed task from the completed list
    function removeFromCompleted(taskItem) {
      completedContainer.removeChild(taskItem);
    }
  });
  