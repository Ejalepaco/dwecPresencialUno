let url =
  "https://opentdb.com/api.php?amount=10&category=9&difficulty=medium&type=multiple";
let timerInterval; // Para la cuenta atrás
let tiempoRespuesta = 10000; // 10 segundos para responder
let currentQuestionIndex = 0; // Para llevar el control de la pregunta actual
let questions = []; // Array para almacenar las preguntas

async function consultaPreguntas() {
  try {
    let respuesta = await fetch(url);
    let respuestaJSON = await respuesta.json();

    // Comprobar si la respuesta tiene datos y la propiedad 'results' existe
    if (
      respuestaJSON &&
      respuestaJSON.results &&
      Array.isArray(respuestaJSON.results)
    ) {
      questions = respuestaJSON.results; // Guardar todas las preguntas

      // Pintar la primera pregunta
      if (questions.length > 0) {
        pintarPregunta(questions[currentQuestionIndex]);
      } else {
        console.error("No se encontraron preguntas en la respuesta de la API.");
      }
    } else {
      console.error("La respuesta de la API no contiene resultados.");
    }
  } catch (error) {
    console.error("Hubo un error al obtener las preguntas: ", error);
  }
}

function pintarPregunta(pregunta) {
  let divPregunta = document.getElementById("pregunta");
  let divRespuestas = document.getElementById("respuestas");
  let divTiempo = document.getElementById("tiempoRespuesta"); // temporizador

  // Limpiar los divs antes de cargar la nueva pregunta
  divPregunta.innerHTML = `<h2>${pregunta.question}</h2>`;
  divRespuestas.innerHTML = ""; 
  divTiempo.innerHTML = `Remaining time: ${tiempoRespuesta / 1000} seconds`;

  // Mezclar las respuestas
  let respuestas = [...pregunta.incorrect_answers, pregunta.correct_answer];
  respuestas = respuestas.sort(() => Math.random() - 0.5); 

  // Crear botones para las respuestas
  respuestas.forEach((respuesta) => {
    let boton = document.createElement("button");
    boton.textContent = respuesta;
    boton.onclick = () =>
      verificarRespuesta(respuesta, pregunta.correct_answer); // Asociar el evento aquí
    divRespuestas.appendChild(boton);
    boton.style.backgroundColor = "#f0f0f0";
    boton.style.margin = "15px";
    boton.style.padding = "5px";
    boton.style.cursor = "pointer";
  });

  
  iniciarCuentaAtras(pregunta);
}

function iniciarCuentaAtras(pregunta) {
  let tiempoRestante = tiempoRespuesta / 1000; // Convertir a segundos
  let divTiempo = document.getElementById("tiempoRespuesta");

  // Mostrar cuenta atrás
  timerInterval = setInterval(() => {
    tiempoRestante--;
    divTiempo.innerHTML = `Remaining time: ${tiempoRestante} segundos`;
    divTiempo.style.color = "red";
    if (tiempoRestante <= 0) {
      clearInterval(timerInterval); // Detener el temporizador
      // Si el tiempo se acaba, forzamos una respuesta incorrecta
      Swal.fire({
        title: "Time is up!",
        text: `You did not answer in time. The correct answer was: ${pregunta.correct_answer}`,
        icon: "error",
      }).then(() => {
        mostrarBotonSiguiente();
      });
    }
  }, 1000);
}

function verificarRespuesta(respuesta, correcta) {
  clearInterval(timerInterval); // Detener la cuenta atrás cuando el usuario responde

  let mensaje = "";
  let tipo = "";

  if (respuesta === correcta) {
    mensaje = "¡Correct!";
    tipo = "success";
  } else {
    mensaje = `Wrong! , the correct answer was: ${correcta}`;
    tipo = "error";
  }

  // SweetAlert2
  Swal.fire({
    title: mensaje,
    icon: tipo,
  }).then(() => {
    mostrarBotonSiguiente();
  });
}

function mostrarBotonSiguiente() {
  // Mostrar el botón "Siguiente pregunta"
  let divSiguiente = document.getElementById("botonSiguiente");
  
  divSiguiente.innerHTML = `<button onclick="siguientePregunta()" class="btn btn-primary">Next question</button>`;
}

function siguientePregunta() {
  let divPregunta = document.getElementById("pregunta");
  let divRespuestas = document.getElementById("respuestas");

  // Limpiar los divs antes de cargar la siguiente pregunta
  divPregunta.innerHTML = "";
  divRespuestas.innerHTML = "";

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++; // Avanzar a la siguiente pregunta
    pintarPregunta(questions[currentQuestionIndex]); // Pintar la siguiente pregunta
  } else {
    Swal.fire({
      title: "¡Has terminado el cuestionario!",
      text: "No hay más preguntas.",
      icon: "info",
    });
  }

  // Limpiar el botón "Siguiente pregunta"
  document.getElementById("botonSiguiente").innerHTML = "";
}

document.addEventListener("DOMContentLoaded", () => {
  consultaPreguntas();
});


