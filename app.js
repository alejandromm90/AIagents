const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

const state = {
  step: 0,
  rent: null,
  income: null,
  contract: null,
};

const prompts = [
  "¡Hola! Soy tu asistente de evaluación de alquiler. ¿Cuál es el precio mensual del alquiler (€)?",
  "Perfecto. ¿Cuáles son tus ingresos mensuales netos (€)?",
  "Gracias. ¿Tienes contrato indefinido? (sí/no)",
];

function addMessage(text, role = "bot") {
  const message = document.createElement("p");
  message.className = `message ${role}`;
  message.textContent = text;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function parseAmount(value) {
  const normalized = value.replace("€", "").replace(",", ".").trim();
  const amount = Number.parseFloat(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

function isYes(value) {
  return ["si", "sí", "s", "yes", "y"].includes(value.toLowerCase().trim());
}

function evaluateApplicant() {
  const incomeLimit = state.rent * 0.3;
  const meetsIncome = state.income <= incomeLimit;
  const meetsContract = state.contract === true;

  if (meetsIncome && meetsContract) {
    return {
      passed: true,
      message: `✅ Apta/o para alquilar. Ingresos: €${state.income.toFixed(
        2
      )}; límite permitido (30% del alquiler): €${incomeLimit.toFixed(2)}.`,
    };
  }

  const reasons = [];
  if (!meetsIncome) {
    reasons.push(
      `los ingresos (€${state.income.toFixed(
        2
      )}) superan el 30% del alquiler (€${incomeLimit.toFixed(2)})`
    );
  }
  if (!meetsContract) {
    reasons.push("no tiene contrato indefinido");
  }

  return {
    passed: false,
    message: `❌ No apta/o para alquilar porque ${reasons.join(" y ")}.`,
  };
}

function resetConversation() {
  state.step = 0;
  state.rent = null;
  state.income = null;
  state.contract = null;

  setTimeout(() => {
    addMessage("¿Quieres evaluar otro perfil? Indica el precio de alquiler (€).");
  }, 450);
}

function handleInput(input) {
  if (state.step === 0) {
    const rent = parseAmount(input);
    if (!rent) {
      addMessage("Por favor, introduce un alquiler válido (por ejemplo: 950).", "bot");
      return;
    }
    state.rent = rent;
    state.step = 1;
    addMessage(prompts[state.step]);
    return;
  }

  if (state.step === 1) {
    const income = parseAmount(input);
    if (!income) {
      addMessage("Necesito una cantidad de ingresos válida (por ejemplo: 1600).", "bot");
      return;
    }
    state.income = income;
    state.step = 2;
    addMessage(prompts[state.step]);
    return;
  }

  if (state.step === 2) {
    const answer = input.trim().toLowerCase();
    if (!["si", "sí", "s", "yes", "y", "no", "n"].includes(answer)) {
      addMessage("Responde con “sí” o “no” para el tipo de contrato.", "bot");
      return;
    }

    state.contract = isYes(answer);
    const result = evaluateApplicant();
    addMessage(result.message);
    resetConversation();
  }
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = userInput.value.trim();

  if (!value) {
    return;
  }

  addMessage(value, "user");
  userInput.value = "";
  handleInput(value);
});

addMessage(prompts[0]);
