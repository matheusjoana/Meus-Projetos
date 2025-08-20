
    //Dados de checklist por template (espelhados dos PDFs)
    const CHECKLIST_GAS = [
      "Estanqueidade",
      "Passagens de gás (mangueiras, conexões)",
      "Sucção da bomba principal",
      "Sucção da bomba de rinse/diluição",
      "Anéis de vedação em geral",
      "Comunicação via USB",
      "Válvula de ar limpo",
      "Válvula de diluição",
      "Medição de oxigênio (O2)",
      "Medição de monóxido de carbono (CO)",
      "Medição de óxido nítrico (NO)",
      "Medição de dióxido de nitrogênio (NO2)",
      "Medição de dióxido de enxofre (SO2)",
      "Código de erro das Célula (Via Service Software)",
      "Expectativa de utilização do filtro de H2 (Célula CO)",
      "Medição de temperatura (FT, AT)",
      "Medição de pressão (Δp, draught, Δp-CU)",
      "Estado geral das placas",
      "Estado geral da carcaça",
      "Display, teclas",
      "Bateria",
      "Sonda",
      "Impressora",
    ];

    const CHECKLIST_DATALOGGER = [
      "Bateria",
      "Interface",
      "Comunicação com o software de operação",
      "Comunicação com a sonda",
      "Geração de registro de medição",
      "Estado geral da carcaça",
      "Inspeção visual do sensor de umidade",
      "Medições coerentes (simples comparação)",
    ];

    //Carrega checklist conforme modelo
    const equipSel = document.getElementById("equipment");
    const testListEl = document.getElementById("test-list");
    const templateTag = document.getElementById("templateTag");
    const dlExtra = document.getElementById("dl-extra");
    const gaSensors = document.getElementById("ga-sensors");

    equipSel.addEventListener("change", () => {
      const v = equipSel.value;
      let items = [];
      if (v === "datalogger") {
        items = CHECKLIST_DATALOGGER;
       // templateTag.textContent = "Template: Datalogger";
        dlExtra.style.display = "";
        gaSensors.style.display = "none";
      } else if (v === "analisador310" || v === "analisador340") {
        items = CHECKLIST_GAS;
       // templateTag.textContent = "Template: Analisador de gases (340-like)";
        dlExtra.style.display = "none";
        gaSensors.style.display = "";
      } else {
        testListEl.innerHTML = "<li>Selecione um modelo para carregar os testes.</li>";
        templateTag.textContent = "—";
        dlExtra.style.display = "none";
        gaSensors.style.display = "none";
        return;
      }
      // Renderiza lista
      testListEl.innerHTML = "";
      items.forEach((label,i)=>{
        const li = document.createElement("li");

        const left = document.createElement("div");
        left.style.flex = "1";
        left.textContent = `${i+1}. ${label}`;

        const right = document.createElement("div");
        ["Ok","Not Ok","N/A"].forEach(opt=>{
          const w = document.createElement("label");
          w.style.marginLeft = "8px";
          const r = document.createElement("input");
          r.type = "radio";
          r.name = `t-${i}`;
          r.value = opt;
          r.style.marginRight = "4px";
          w.appendChild(r);
          w.append(opt);
          right.appendChild(w);
        });

        const details = document.createElement("input");
        details.placeholder = "Detalhes adicionais";
        details.style.minWidth = "220px";
        details.id = `td-${i}`;

        const rightWrap = document.createElement("div");
        rightWrap.style.display = "flex";
        rightWrap.style.alignItems = "center";
        rightWrap.style.gap = "8px";
        rightWrap.append(right, details);

        li.append(left, rightWrap);
        testListEl.appendChild(li);
      });
    });

    // Utilidades
    async function fileToDataURL(fileInput) {
      const file = fileInput?.files?.[0];
      if (!file) return null;
      return new Promise((resolve,reject)=>{
        const fr = new FileReader();
        fr.onload = ()=>resolve(fr.result);
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
    }

    function getChecked(name){
      const radios = document.querySelectorAll(`input[name="${name}"]`);
      for (const r of radios) if (r.checked) return r.value;
      return "";
    }

    function buildChecklistRows(items){
      return items.map((label,i)=>{
        const evalVal = getChecked(`t-${i}`) || "—";
        const details = document.getElementById(`td-${i}`)?.value || "";
        return [i+1, label, evalVal, details];
      });
    }

    // ---  Função para pegar a data atual do computador --- //

    const hoje = new Date();
    
    // Converte para o formato YYYY-MM-DD (que é o aceito pelo input type="date")
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    const dataFormatada = `${ano}-${mes}-${dia}`;
    
    // Coloca a data no campo
    document.getElementById("data").value = dataFormatada;

    // ---- Função para colocar mascara no campo CPF / CNPJ ----
    function mascaraCpfCnpj(input) {
      let valor = input.value.replace(/\D/g, ""); // Remove tudo que não for número

      if (valor.length <= 11) {
        // CPF -> 000.000.000-00
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d)/, "$1.$2");
        valor = valor.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      } else {
        // CNPJ -> 00.000.000/0000-00
        valor = valor.replace(/^(\d{2})(\d)/, "$1.$2");
        valor = valor.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3");
        valor = valor.replace(/\.(\d{3})(\d)/, ".$1/$2");
        valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
      }
      input.value = valor;
    }



    // --- Geração de PDF (duas rotas) ---
    async function generateReport(){
      const type = equipSel.value;
      if(!type){ alert("Selecione um modelo de equipamento."); return; }

      const logoDataUrl = await fileToDataURL(document.getElementById("logoFile"));
      if (type === "datalogger") {
        await generateDataLoggerReport(logoDataUrl);
      } else {
        await generateGasAnalyzerReport(logoDataUrl);
      }
    }

    function baseHeader(doc, logoDataUrl, titleSub){
      const pageW = doc.internal.pageSize.getWidth();
      const centerX = pageW/2;

      if (logoDataUrl){
        try{ doc.addImage(logoDataUrl, "PNG", 15, 8, 28, 12); }catch(e){}
      }

      doc.setFont("helvetica","bold");
      doc.setFontSize(14);
      doc.text("Laudo técnico  /  Technical report", centerX, 16, {align:"center"});

      doc.setFont("helvetica","normal");
      doc.setFontSize(10);
      doc.text(titleSub || "", centerX, 22, {align:"center"});

      doc.setDrawColor(0,120,215);
      doc.line(15, 26, pageW-15, 26);
    }

    function baseFooter(doc){
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text("Condições de garantia / Warranty conditions — resumo no verso do modelo original.", doc.internal.pageSize.getWidth()/2, pageH-8, {align:"center"});
      doc.setTextColor(0);
    }

    function fillIdentificationBlock(doc, startY){
      const v = id => document.getElementById(id).value.trim();
      const rows = [
        ["Cliente / Customer", v("cli"), "Pessoa de contato / Contact", v("contact")],
        ["CNPJ", v("cnpj"), "Nota fiscal / Invoice", v("nf")],
        ["Ordem de Serviço / Work order", v("os"), "Solicitação do cliente / Request", v("req")],
        ["Data de emissão / Emission date", v("data") || new Date().toISOString().slice(0,10), "", ""],
      ];
      doc.autoTable({
        startY,
        body: rows,
        theme: "grid",
        styles:{fontSize:9, cellPadding:2},
        columnStyles: {0:{fontStyle:"bold"},2:{fontStyle:"bold"}},
        didDrawPage: ()=>{}
      });
      return doc.lastAutoTable.finalY + 4;
    }

    function fillEquipmentBlock(doc, startY, {modelLabel}){
      const v = id => document.getElementById(id).value.trim();
      const rows = [
        ["Equipamento / Equipment", modelLabel],
        ["Modelo / Model", v("equipment") ? equipSel.options[equipSel.selectedIndex].text : ""],
        ["Número de série / Serial number", v("sn")],
        ["Sonda / Probe", v("probe")],
        ["Descrição breve / Brief description", v("brief")],
      ];
      doc.autoTable({
        startY,
        body: rows,
        theme:"grid",
        styles:{fontSize:9, cellPadding:2},
        columnStyles: {0:{fontStyle:"bold"}},
      });
      return doc.lastAutoTable.finalY + 4;
    }

    async function generateGasAnalyzerReport(logoDataUrl){
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF("p","mm","a4");

      baseHeader(doc, logoDataUrl, "Analisador de gases — Gas analyzer");

      // Identificação
      let y = fillIdentificationBlock(doc, 30);

      // Equipamento
      const equipText = equipSel.value==="analisador340" ? "340" : "310";
      y = fillEquipmentBlock(doc, y, {modelLabel:`Analisador de gases ${equipText}`});

      // Informação dos sensores (se fornecido)
      const sensorsRaw = document.getElementById("sensorRows").value.trim();
      if (sensorsRaw){
        const rows = sensorsRaw.split("\n").map(line=>{
          const [sensor, pn, sn, pd, life] = line.split(";").map(s=> (s||"").trim());
          return [sensor||"", pn||"", sn||"", pd||"", life||""];
        });
        doc.setFont("helvetica","bold"); doc.setFontSize(11);
        doc.text("Informação dos sensores / Sensor information", 15, y);
        doc.autoTable({
          startY: y+2,
          head:[["Sensor","Part number","Serial","Production date","Life expectancy"]],
          body: rows,
          styles:{fontSize:9, cellPadding:2},
          headStyles:{fillColor:[0,120,215]},
        });
        y = doc.lastAutoTable.finalY + 4;
      }

      // Checklist
      const chkRows = buildChecklistRows(CHECKLIST_GAS);
      doc.setFont("helvetica","bold"); doc.setFontSize(11);
      doc.text("Lista de Verificação / Checklist", 15, y);
      doc.autoTable({
        startY: y+2,
        head:[["#","Descrição / Description","Avaliação / Evaluation","Detalhes"]],
        body: chkRows,
        styles:{fontSize:9, cellPadding:2},
        headStyles:{fillColor:[0,120,215]},
        columnStyles:{0:{halign:"center",cellWidth:8},2:{cellWidth:32}}
      });
      y = doc.lastAutoTable.finalY + 4;

      // Peças/Serviços
      const partsRaw = document.getElementById("parts").value.trim();
      if (partsRaw){
        const prows = partsRaw.split("\n").map(line=>{
          const [code, qty, desc, mandatory] = line.split(";").map(s=> (s||"").trim());
          return [code||"", qty||"", desc||"", (mandatory||"").toUpperCase().startsWith("Y")?"Yes":"No"];
        });
        doc.setFont("helvetica","bold"); doc.setFontSize(11);
        doc.text("Lista de peças de reposição e serviços necessários / Spare parts & services", 15, y);
        doc.autoTable({
          startY: y+2,
          head:[["Código / Part number","Qtd / Quantity","Descrição / Description","Mandatório"]],
          body: prows,
          styles:{fontSize:9, cellPadding:2},
          headStyles:{fillColor:[0,120,215]},
          columnStyles:{1:{halign:"center",cellWidth:18},3:{halign:"center",cellWidth:28}}
        });
      }

      baseFooter(doc);
      doc.save("laudo_analisador.pdf");
    }

    async function generateDataLoggerReport(logoDataUrl){
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF("p","mm","a4");

      baseHeader(doc, logoDataUrl, "Data logger de temperatura e umidade");

      // Identificação
      let y = fillIdentificationBlock(doc, 30);

      // Equipamento + ranges
      const v = id => document.getElementById(id).value.trim();
      const modelLabel = "Data logger (174/175/177)";
      y = fillEquipmentBlock(doc, y, {modelLabel});

      // Ranges
      doc.setFont("helvetica","bold"); doc.setFontSize(11);
      doc.text("Especificações / Specifications", 15, y);
      doc.autoTable({
        startY: y+2,
        body: [
          ["Range Temperatura","Range Umidade","Sonda externa"],
          [v("dl-range-temp")||"-20 à 55 °C", v("dl-range-umid")||"0 à 100 %", v("dl-probe-ext")||"—"]
        ],
        theme:"grid",
        styles:{fontSize:9, cellPadding:2},
        columnStyles:{0:{fontStyle:"bold"},1:{fontStyle:"bold"}}
      });
      y = doc.lastAutoTable.finalY + 4;

      // Checklist
      const chkRows = buildChecklistRows(CHECKLIST_DATALOGGER);
      doc.setFont("helvetica","bold"); doc.setFontSize(11);
      doc.text("Lista de Verificação / Checklist", 15, y);
      doc.autoTable({
        startY: y+2,
        head:[["#","Descrição / Description","Avaliação / Evaluation","Detalhes"]],
        body: chkRows,
        styles:{fontSize:9, cellPadding:2},
        headStyles:{fillColor:[0,120,215]},
        columnStyles:{0:{halign:"center",cellWidth:8},2:{cellWidth:32}}
      });
      y = doc.lastAutoTable.finalY + 4;

      // Peças/Serviços (se houver)
      const partsRaw = document.getElementById("parts").value.trim();
      if (partsRaw){
        const prows = partsRaw.split("\n").map(line=>{
          const [code, qty, desc, mandatory] = line.split(";").map(s=> (s||"").trim());
          return [code||"", qty||"", desc||"", (mandatory||"").toUpperCase().startsWith("Y")?"Yes":"No"];
        });
        doc.setFont("helvetica","bold"); doc.setFontSize(11);
        doc.text("Lista de peças de reposição e serviços necessários / Spare parts & services", 15, y);
        doc.autoTable({
          startY: y+2,
          head:[["Código / Part number","Qtd / Quantity","Descrição / Description","Mandatório"]],
          body: prows,
          styles:{fontSize:9, cellPadding:2},
          headStyles:{fillColor:[0,120,215]},
          columnStyles:{1:{halign:"center",cellWidth:18},3:{halign:"center",cellWidth:28}}
        });
      }

      baseFooter(doc);
      doc.save("laudo_datalogger.pdf");
    }
