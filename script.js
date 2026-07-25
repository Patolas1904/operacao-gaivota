const CONFIG = {
  nome: "", // Ex.: "Marta". Deixa vazio para mostrar apenas "Olá."
  respostaCopiada: "A tua mensagem de ontem foi péssima, mas admito que este site teve piada 😂",
};

const stepNames = {
  1: "Introdução",
  2: "Contexto",
  3: "Julgamento",
  4: "Sentença",
  5: "Conclusão",
};

const state = {
  currentStep: 1,
  selectedResponse: "",
  verdicts: [],
};

const steps = [...document.querySelectorAll(".step")];
const progressText = document.getElementById("progressText");
const progressCount = document.getElementById("progressCount");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");
const nameGreeting = document.getElementById("nameGreeting");

if (CONFIG.nome.trim()) {
  nameGreeting.textContent = `, ${CONFIG.nome.trim()}.`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function goToStep(target) {
  steps.forEach((step) => step.classList.remove("active"));
  const nextStep = document.querySelector(`[data-step="${target}"]`);
  if (!nextStep) return;

  nextStep.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (target === "exit") {
    progressText.textContent = "Processo encerrado";
    progressCount.textContent = "—";
    progressBar.style.width = "100%";
    return;
  }

  state.currentStep = Number(target);
  progressText.textContent = stepNames[state.currentStep];
  progressCount.textContent = `${state.currentStep} / 5`;
  progressBar.style.width = `${state.currentStep * 20}%`;
}

document.addEventListener("click", (event) => {
  const nextButton = event.target.closest("[data-next]");
  if (nextButton) {
    if (state.currentStep === 3) {
      state.verdicts = [...document.querySelectorAll('#verdictGrid input:checked')].map((input) => input.value);
    }
    goToStep(nextButton.dataset.next);
    return;
  }

  const exitButton = event.target.closest("[data-exit]");
  if (exitButton) goToStep("exit");
});

document.querySelector(".evidence-btn").addEventListener("click", () => {
  const response = document.getElementById("evidenceResponse");
  response.hidden = false;
  showToast("Prova documental indisponível");
});

document.querySelectorAll(".choice-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".choice-btn").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    state.selectedResponse = button.dataset.response;
    document.getElementById("finalContinue").disabled = false;
  });
});

document.getElementById("copyButton").addEventListener("click", async () => {
  const message = CONFIG.respostaCopiada;
  try {
    await navigator.clipboard.writeText(message);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = message;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  document.getElementById("copiedMessage").textContent = `“${message}”`;
  document.getElementById("copyResult").hidden = false;
  document.getElementById("copyButton").textContent = "Resposta copiada ✓";
  showToast("Resposta copiada");
});

document.getElementById("restartButton").addEventListener("click", () => {
  document.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.checked = false; });
  document.querySelectorAll(".choice-btn").forEach((item) => item.classList.remove("selected"));
  document.getElementById("finalContinue").disabled = true;
  document.getElementById("copyResult").hidden = true;
  document.getElementById("evidenceResponse").hidden = true;
  state.selectedResponse = "";
  state.verdicts = [];
  goToStep(1);
});
