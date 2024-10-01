document.addEventListener("DOMContentLoaded", () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    const startListeningButton = document.querySelector("#mic-btn-day");
    const tasksList = document.querySelector("#task-list");
    const addDayButton = document.querySelector(".add-day");
    const addDaysButton = document.querySelector(".plus-day");
    const daysContainer = document.getElementById("days-container");


    const maxVisibleDays = 2;
    let visibleDaysCount = 0;



    let tasks = [];
    let recognizing = false;
    let editTaskId = null;
    let dayCount = 1; // Inicializamos un contador de días
    let selectedDayNumber = 1; // Inicia en 1 por defecto
    let tasksByDay = {};

    recognition.continuous = true; // Para que la grabación no se detenga después de una pausa
    recognition.lang = "es"; // Idioma en español

    startListeningButton.addEventListener("click", () => toggleSpeechRecognition(selectedDayNumber));

    function toggleSpeechRecognition(dayNumber) {
        if (recognizing) {
            recognizing = false;
            document.querySelector(`#mic-btn-day-${dayNumber}`).innerHTML = "<i class='bx bx-microphone'></i>";
            recognition.stop();
        } else {
            recognizing = true;
            document.querySelector(`#mic-btn-day-${dayNumber}`).innerHTML = "<i class='bx bx-loader bx-spin'></i>";
            recognition.start();
        }
    }

    recognition.onresult = (event) => {
        const taskText = event.results[event.results.length - 1][0].transcript.trim();
        if (editTaskId) {
            const task = tasksByDay[selectedDayNumber].find(t => t.id === editTaskId);
            if (task) {
                task.text = taskText;
                saveTasksToLocalStorage();
                editTaskId = null;
            }
        } else {
            addTaskToDay(taskText, selectedDayNumber);
        }
    };


    // Función para agregar una tarea a un día específico
    function addTaskToDay(taskText, dayNumber) {
        const task = {
            id: crypto.randomUUID(),
            text: taskText.charAt(0).toUpperCase() + taskText.slice(1),
            done: false,
            kilos: 0
        };

        if (!tasksByDay[dayNumber]) {
            tasksByDay[dayNumber] = [];
        }

        tasksByDay[dayNumber].push(task);
        saveTasksToLocalStorage();
        renderTasksForDay(dayNumber);


    }

    // Función para renderizar las tareas de un día
    function renderTasksForDay(dayNumber) {
        const taskList = document.getElementById(`task-list-day-${dayNumber}`);
        taskList.innerHTML = "";

        if (tasksByDay[dayNumber]) {
            tasksByDay[dayNumber].forEach(task => {
                const taskItem = document.createElement("li");
                taskItem.innerHTML = `
                <div class="action-boton-voice">
                    <i class='bx bx-user-voice'></i> 
                </div>
                <input type="checkbox" ${task.done ? "checked" : ""} class="task-checkbox">
                <input type="text" value="${task.text}" readonly>
                <div class="kilos">
                    <label for="kilos-${task.id}"> </label>
                    <button class="minus-btn" id="minus-btn-${task.id}">-</button>
                    <input type="number" id="kilos-${task.id}" class="kilos-input" value="${task.kilos}" min="0" step="5">
                    <button class="plus-btn" id="plus-btn-${task.id}">+</button>
                </div>
                <div class="action-boton">
                    <i class='bx bx-link-alt'></i>
                    <i class='bx bx-edit'></i>
                    <i class='bx bx-trash'></i>
                </div>
            `;
                taskList.appendChild(taskItem);

                // Asignar eventos a los botones

                // Asignar el evento para leer la tarea en voz alta
                const readButton = taskItem.querySelector(".bx-user-voice");
                readButton.addEventListener("click", () => {
                    leerTarea(task.text); // Llama a la función que lee la tarea
                });

                taskItem.querySelector(`#minus-btn-${task.id}`).addEventListener("click", () => updateKilos(task.id, dayNumber, -5));
                taskItem.querySelector(`#plus-btn-${task.id}`).addEventListener("click", () => updateKilos(task.id, dayNumber, +5));
                // Editar tarea
                taskItem.querySelector(".bx-edit").addEventListener("click", () => {
                    const checkbox = taskItem.querySelector(".task-checkbox");
                    if (checkbox.checked) {
                        editTaskId = task.id;

                        recognition.start(); // Edición por voz

                        // Permitir edición manual
                        const input = taskItem.querySelector("input[type='text']");
                        input.readOnly = false; // Habilitar edición manual
                        input.focus(); // Coloca el cursor en el campo de texto para editar

                        // Manejar edición por voz o manual
                        input.addEventListener("blur", () => {
                            task.text = input.value;
                            saveTasksToLocalStorage();
                            input.readOnly = true; // Desactivar edición manual
                            editTaskId = null; // Restablecer el ID de edición
                            recognition.stop(); // Detener reconocimiento si estaba activo
                        });

                        // Si se detecta una entrada de voz, actualiza el texto de la tarea
                        recognition.onresult = (event) => {
                            const taskText = event.results[event.results.length - 1][0].transcript.trim();
                            task.text = taskText;
                            input.value = taskText; // Actualizar el input con el nuevo valor
                            saveTasksToLocalStorage();
                            editTaskId = null; // Restablecer el ID de edición
                            input.readOnly = true; // Desactivar edición manual
                        };
                    } else {
                        alert("Debes marcar la tarea como hecha antes de editarla.");
                    }
                });
                // Añadir hipervínculo a YouTube
                taskItem.querySelector(".bx-link-alt").addEventListener("click", () => {
                    const videoURL = prompt("Introduce el enlace de YouTube:");
                    if (videoURL) {
                        task.videoURL = videoURL;
                        saveTasksToLocalStorage();
                        taskItem.querySelector("input[type='text']").style.color = "blue"; // Indicar que hay un enlace
                        taskItem.querySelector("input[type='text']").addEventListener("click", () => {
                            window.open(task.videoURL, "_blank");
                        });
                    }


                });
            });
        }
    }
    // Función para actualizar los kilos de una tarea
    function updateKilos(taskId, dayNumber, increment) {
        const task = tasksByDay[dayNumber].find(t => t.id === taskId);
        if (task) {
            task.kilos = Math.max(0, task.kilos + increment);
            saveTasksToLocalStorage();
            renderTasksForDay(dayNumber);
        }
    }

    // function editTask(taskId, dayNumber) {
    //     const task = tasksByDay[dayNumber].find(t => t.id === taskId);
    //     if (task) {
    //         editTaskId = taskId;
    //         recognition.start();
    //     } else {
    //         alert("La tarea no se encontró.");
    //     }
    // }

    function saveTasksToLocalStorage() {
        localStorage.setItem("tasksByDay", JSON.stringify(tasksByDay));
    }

    function loadTasksFromLocalStorage() {
        tasksByDay = JSON.parse(localStorage.getItem("tasksByDay")) || {};
        renderTasks();
        renderAllDays();
    }
    // Renderizar todas las tareas de todos los días
    function renderAllDays() {
        for (let day in tasksByDay) {
            renderTasksForDay(day);
        }
    }
    function renderTasks() {
        tasksList.innerHTML = "";
        tasks.forEach(task => {
            const tasksList = document.getElementById(`task-list-day-${selectedDayNumber}`);
            const taskItem = document.createElement("li");
            console.log(dayNumber);

            taskItem.innerHTML = `
                <div class="action-boton-voice">
                    <i class='bx bx-user-voice'></i>
                </div>
                <input type="checkbox" ${task.done ? "checked" : ""} class="task-checkbox">
                <input type="text" value="${task.text}" readonly>
                <div class="kilos">
                    <label for="kilos-${task.id}"> </label>
                    <button class="minus-btn" id="minus-btn-${task.id}">-</button>
                    <input type="number" id="kilos-${task.id}" class="kilos-input" value="${task.kilos}" min="0" step="5">
                    <button class="plus-btn" id="plus-btn-${task.id}">+</button>
                </div>
                <div class="action-boton">
                    <i class='bx bx-link-alt'></i>
                    <i class='bx bx-edit'></i>
                    <i class='bx bx-trash'></i>
                </div>
            `;

            tasksList.appendChild(taskItem);

            const editButton = taskItem.querySelector(".bx-edit");
            const deleteButton = taskItem.querySelector(".bx-trash");
            const readButton = taskItem.querySelector(".bx-user-voice");
            const checkbox = taskItem.querySelector(".task-checkbox");
            const kilosInput = taskItem.querySelector(`#kilos-${task.id}`);
            const minusButton = taskItem.querySelector(`#minus-btn-${task.id}`);
            const plusButton = taskItem.querySelector(`#plus-btn-${task.id}`);
            // Actualizar kilos con botones + y -
            minusButton.addEventListener("click", () => {
                let currentKilos = parseInt(kilosInput.value);
                if (currentKilos > 0) {
                    task.kilos = Math.max(0, currentKilos - 5);
                    kilosInput.value = task.kilos;
                    saveTasksToLocalStorage();
                }
            });

            //Minimizar o expandir el día
            // daysContainer.addEventListener("click", function (e) {
            //     if (e.target.closet(".add-day")) {

            //         const dayDiv = e.target.closet(".day");
            //         dayDiv.classList.toggle("minimized");
            //     }
            // })

            plusButton.addEventListener("click", () => {
                let currentKilos = parseInt(kilosInput.value);
                task.kilos = currentKilos + 5;
                kilosInput.value = task.kilos;
                saveTasksToLocalStorage();
            });
            // Permitir edición manual del valor de kilos
            kilosInput.addEventListener("change", () => {
                task.kilos = Math.max(0, parseInt(kilosInput.value) || 0);
                saveTasksToLocalStorage();
            });
            // Acción de editar
            editButton.addEventListener("click", () => {
                if (checkbox.checked) {
                    editTaskId = task.id;
                    recognition.start();
                } else {
                    alert("Debes marcar la tarea como hecha antes de editarla.");
                }
            });
            // Acción de eliminar
            deleteButton.addEventListener("click", () => {
                if (checkbox.checked) {
                    tasks = tasks.filter(t => t.id !== task.id);
                    saveTasksToLocalStorage();
                } else {
                    alert("Debes marcar la tarea como hecha antes de eliminarla.");
                }
            });
            // Acción de leer en voz alta
            readButton.addEventListener("click", () => {
                leerTarea(task.text);
            });
            //tasksList.appendChild(taskItem);
        });
    }

    addDaysButton.addEventListener("click", () => {
        addNewDay();// Aquí agregamos un nuevo día al presionar el botón
    });
    // Función para agregar un nuevo día
    function addNewDay() {
        dayCount++;
        const newDay = document.createElement("div");
        newDay.classList.add("day");
        newDay.setAttribute("data-day-number", dayCount);

        newDay.innerHTML = `
            <button id="add-day-${dayCount}" class="add-day">DIA ${dayCount}
            </button>
                <div class="plus-and-trash-day-posteriores">
                   <button id="plus-day" class="plus-day">
                       <i class='bx bx-plus-medical'></i>
                   </button>
                   <button class="trash-day">
                      <i class='bx bxs-trash'></i>
                   </button>
                    <div class="voice-command">
                      <button id="mic-btn-day-${dayCount}">
                       <i class='bx bx-microphone'></i>
                      </button>
                    </div>
                </div>
        <ul class="task-list" id="task-list-day-${dayCount}"></ul>
        `;
        // Agregar el nuevo día al contenedor
        daysContainer.appendChild(newDay);

        // Lógica para minimizar el día
        const dayButton = newDay.querySelector(`#add-day-${dayCount}`);
        dayButton.addEventListener("click", () => {
            newDay.classList.toggle("minimized");
            checkVisibleDays();
        });

        // Si hay más de 2 días, minimizar automáticamente
        checkVisibleDays();

        // Actualiza los eventos dinámicamente para los nuevos días
        const micButton = document.getElementById(`mic-btn-day-${dayCount}`);
        micButton.addEventListener("click", () => {
            selectedDayNumber = dayCount;
            toggleSpeechRecognition(selectedDayNumber);
        });
        // Asignar evento de eliminación al botón de borrar (trash-day)
        const deleteButton = newDay.querySelector(".trash-day");
        deleteButton.addEventListener("click", () => deleteDay(newDay));

        renderTasksForDay(dayCount);



    }


    // Función para verificar cuántos días están visibles
    function checkVisibleDays() {
        const allDays = document.querySelectorAll(".day");
        visibleDaysCount = 0;

        allDays.forEach((day, index) => {
            if (!day.classList.contains("minimized")) {
                visibleDaysCount++;
            }

            if (visibleDaysCount > maxVisibleDays) {
                day.classList.add("minimized");
            }
        });
    }
    // Función para verificar cuántos días están visibles



    // Función para eliminar un día y reorganizar los días restantes
    function deleteDay(dayElement) {
        dayElement.remove();
        // Actualizar la numeración de los días restantes
        const allDays = document.querySelectorAll(".day");
        dayCount = 0;
        allDays.forEach((day, index) => {
            dayCount = index + 1;// Recalcular el número del día
            // Actualizar el número del día visualmente y en los atributos
            const dayButton = day.querySelector(".add-day");
            dayButton.textContent = `DIA ${dayCount}`;
            day.setAttribute("data-day-number", dayCount);
            // Actualizar IDs y referencias a micrófonos
            const micButton = day.querySelector("button[id^='mic-btn-day']");
            micButton.id = `mic-btn-day-${dayCount}`;
        });
    }

    function leerTarea(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "es";
        window.speechSynthesis.speak(utterance);
    }

    // window.onload = loadTasksFromLocalStorage;
    loadTasksFromLocalStorage();
    recognition.onerror = (event) => console.error("Error en el reconocimiento:", event.error);
    // tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    //renderTasks();
    //addDaysButton();
    // Llamamos inicialmente a la función para agregar el primer día
    addNewDay();
});
