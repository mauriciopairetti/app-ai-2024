document.addEventListener("DOMContentLoaded", () => {
    const SpeechRecognitionuser = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognitionuser = new SpeechRecognitionuser();
    const micButton = document.querySelector("#mic-btn-user");
    let recognizinguser = false;
    let currentStep = 0;

    // Elementos para los datos del usuario
    const usuarioInput = document.getElementById("usuario");
    const pesoInput = document.getElementById("peso");
    const alturaInput = document.getElementById("altura");
    const ipcSpan = document.getElementById("ipc");
    const rutinaInput = document.getElementById("rutina");
    const planillaDiv = document.getElementById("planilla");




    // Datos del usuario
    let userData = {
        usuario: "",
        peso: 0,
        altura: 0,
        rutina: 0,
        ipc: 0
    };

    recognitionuser.lang = "es";
    recognitionuser.continuous = false;

    micButton.addEventListener("click", () => {
        if (recognizinguser) {
            recognitionuser.stop();
            recognizinguser = false;
            micButton.innerHTML = "<i class='bx bx-microphone'></i> Iniciar comando por voz";
        } else {
            startStep();
        }
    });



    recognitionuser.onresult = (event) => {
        const result = event.results[0][0].transcript.trim();
        switch (currentStep) {
            case 1:
                userData.usuario = result;
                usuarioInput.value = result;
                //confirmStep("Usuario", result);
                break;
            case 2:
                // Asegúrate de que el valor recibido sea numérico
                const peso = parseFloat(result);
                if (!isNaN(peso)) {
                    userData.peso = peso;
                    pesoInput.value = peso;
                    //calculateIPC();
                    //confirmStep("Peso", result);
                } else {
                    alert("Por favor, diga un peso válido.");
                }
                break;

            case 3:
                const altura = parseFloat(result);
                if (!isNaN(altura)) {
                    userData.altura = altura;
                    alturaInput.value = altura;
                    calculateIMC();
                } else {
                    alert("Por favor, diga una altura válida.");
                }
                break

            case 4:
                userData.rutina = result;
                rutinaInput.value = result;
                //confirmStep("Rutina", result);
                break;
            default:
                console.log("Paso no reconocido");
        }
    };




    function startStep() {
        switch (currentStep) {
            case 0:
                askFor("nombre del usuario");
                currentStep = 1;
                break;
            case 1:
                askFor("peso en kilogramos");
                currentStep = 2;
                break;
            case 2:
                askFor("altura en centimetros");
                currentStep = 3;
                break;
            case 3:
                askFor("número de rutina");
                currentStep = 4;
                break;
            case 4:
                showplanillaSection();
                break;
        }
    }

    function askFor(data) {
        recognizinguser = true;
        micButton.innerHTML = `<i class='bx bx-loader bx-spin'></i> Diga su ${data}`;
        recognitionuser.start();
    }

    // function confirmStep(stepName, value) {
    //     if (confirm(`¿Confirma ${stepName}: ${value}?`)) {
    //         currentStep++;
    //         recognition.stop();
    //         startStep();
    //     } else {
    //         recognition.start(); // Repetir el paso si cancela
    //     }
    // }

    // function calculateIMC() {
    //     const peso = userData.peso;
    //     const altura = userData.altura / 100;  // Convertir altura de cm a metros
    //     if (peso > 0 && altura > 0) {
    //         const ipc = (peso / (altura * altura)).toFixed(2);
    //         ipcSpan.value = ipc;
    //         userData.ipc = ipc;
    //         console.log("ipc");
    //     }
    // }

    function calculateIMC() {
        const peso = userData.peso;
        const altura = userData.altura / 100;  // Convertir altura de cm a metros
        if (peso > 0 && altura > 0) {
            const ipc = (peso / (altura * altura)).toFixed(2);
            ipcSpan.innerText = ipc;  // Mostrar el IMC en el span
            userData.ipc = ipc;
        }
    }

    function showplanillaSection() {
        recognitionuser.stop();
        recognizinguser = false;
        micButton.innerHTML = "<i class='bx bx-microphone'></i> Iniciar comando por voz";
        planillaDiv.style.display = "block"; // Mostrar la sección de rutinas
    }

    recognitionuser.onend = () => {
        if (recognizinguser) recognitionuser.start();
    };

    recognitionuser.onspeechend = () => {
        recognitionuser.stop(); // Detiene el reconocimiento después de que se termine de hablar
    };
    recognitionuser.onerror = (event) => console.error("Error en el reconocimiento:", event.error);
    // tasks = JSON.parse(localStorage.getItem("tasks")) || [];
    document.getElementById("calculate-btn").addEventListener("click", () => {
        userData.peso = parseFloat(pesoInput.value);  // Obtener el peso ingresado manualmente
        userData.altura = parseFloat(alturaInput.value);  // Obtener la altura ingresada manualmente
        calculateIMC();  // Llamar la función para calcular el IMC
    });


});
