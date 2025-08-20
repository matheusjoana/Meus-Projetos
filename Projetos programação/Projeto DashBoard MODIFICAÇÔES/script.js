document.addEventListener("DOMContentLoaded", () => {
  const tarefas = [
    { id: 1, titulo: "Técnico Emanuel", status: "Atrasado" },
    { id: 2, titulo: "Técnico Guilherme Volpe", status: "Programado" },
    { id: 3, titulo: "Técnico Matheus", status: "Pendente" },
    { id: 4, titulo: "Técnico Milena", status: "Em andamento" },
    { id: 5, titulo: "Técnico", status: "Finalizado" }
  ];

  tarefas.forEach(tarefa => criarCard(tarefa));
  atualizarContador();

  function criarCard(tarefa) {
    const card = document.createElement("div");
    card.classList.add("kanban-card");
    card.textContent = tarefa.titulo;
    card.setAttribute("draggable", "true");
    card.dataset.id = tarefa.id;
    card.dataset.status = tarefa.status;

    card.addEventListener("dragstart", () => card.classList.add("dragging"));
    card.addEventListener("dragend", () => card.classList.remove("dragging"));

    const coluna = document.getElementById(tarefa.status);
    if (coluna) coluna.appendChild(card);
  }

  document.querySelectorAll(".kanban-cards").forEach(coluna => {
    coluna.addEventListener("dragover", e => {
      e.preventDefault();
      coluna.classList.add("over");
    });

    coluna.addEventListener("dragleave", () => {
      coluna.classList.remove("over");
    });

    coluna.addEventListener("drop", e => {
      e.preventDefault();
      const draggingCard = document.querySelector(".dragging");
      coluna.appendChild(draggingCard);
      draggingCard.dataset.status = coluna.id;
      coluna.classList.remove("over");

      // Salvar alteração no backend
      fetch('/api/atualizar-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: draggingCard.dataset.id,
          status: coluna.id
        })
      })
      .then(res => {
        if (!res.ok) throw new Error("Falha ao salvar");
        return res.json();
      })
      .then(data => console.log("Atualização salva:", data))
      .catch(err => console.error("Erro:", err));

      atualizarContador();
    });
  });

  function atualizarContador() {
    const total = document.querySelectorAll(".kanban-card").length;
    document.getElementById("contador-total").textContent = total;
  }
});
