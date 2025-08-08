function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Dashboard Canada", 10, 10);
    doc.save("dashboard.pdf");
}
async function genererPDF() {
    const nom = document.getElementById("client").value;
    const chartCanvas = document.getElementById("chart");
    const chartImage = await html2canvas(chartCanvas).then(canvas => canvas.toDataURL("image/png"));
  
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  
    // En-tête stylisé
    doc.setFillColor(66, 133, 244);
    doc.rect(0, 0, 210, 20, 'F');
    doc.setFontSize(18);
    doc.setTextColor(255);
    doc.text("📊 Rapport personnalisé - REER vs CELI", 105, 13, { align: 'center' });
  
    doc.setTextColor(0);
    doc.setFontSize(12);
  
    // Tableau avec les paramètres
    const tableStartY = 30;
    const rowHeight = 10;
    const colX1 = 10;
    const colX2 = 90;
  
    doc.setFont(undefined, 'bold');
    doc.text("Informations du client", 10, tableStartY - 5);
    doc.setFont(undefined, 'normal');
  
    const data = [
      ["👤 Nom du client", nom],
      ["💵 Montant investi", `${params.S.toFixed(2)} $`],
      ["📈 Taux de rendement", `${(params.r * 100).toFixed(2)} %`],
      ["📅 Durée (années)", `${params.N}`],
      ["🔹 Taux d’impôt à la cotisation (t1)", `${(params.t1 * 100).toFixed(2)} %`],
      ["🔸 Taux d’impôt à la retraite (t2)", `${(params.t2 * 100).toFixed(2)} %`],
    ];
  
    data.forEach(([label, value], i) => {
      const y = tableStartY + i * rowHeight;
      doc.setFont(undefined, 'bold');
      doc.text(label, colX1, y);
      doc.setFont(undefined, 'normal');
      doc.text(value, colX2, y);
    });
  
    let y = tableStartY + data.length * rowHeight + 10;
    doc.setFont(undefined, 'bold');
    doc.text("Résultats de la simulation", 10, y);
    y += 10;
    doc.setFont(undefined, 'normal');
    doc.text(`CELI : ${celi.toFixed(2)} $`, 10, y); y += 8;
    doc.text(`REER : ${reer.toFixed(2)} $`, 10, y); y += 8;
    doc.text(`Différence : ${difference.toFixed(2)} $`, 10, y); y += 12;
  
    // Graphique
    doc.setFont(undefined, 'bold');
    doc.text("Comparaison graphique", 10, y);
    doc.addImage(chartImage, 'PNG', 15, y + 5, 180, 60);
  
    // Signature
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Préparé par Clement Markus", 10, 290);
  
    doc.save(`reer-vs-celi-${nom}.pdf`);
  }
  

function calculateInvestment() {
    const monthly = parseFloat(document.getElementById("monthly").value);
    const years = parseFloat(document.getElementById("years").value);
    const annualReturn = parseFloat(document.getElementById("return").value) / 100;
    const months = years * 12;
    const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1;
  
    let total = 0;
    for (let i = 0; i < months; i++) {
      total = (total + monthly) * (1 + monthlyReturn);
    }
  
    total = total.toFixed(2);
    document.getElementById("result").innerText = `Valeur future estimée : ${total} $`;
    return total;
  }
  
  function generateInvestmentPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const monthly = document.getElementById("monthly").value;
    const years = document.getElementById("years").value;
    const returnRate = document.getElementById("return").value;
    const result = document.getElementById("result").innerText;
  
    doc.setFontSize(14);
    doc.text("Simulation d’investissement", 10, 10);
    doc.text(`Montant mensuel : ${monthly} $`, 10, 20);
    doc.text(`Durée : ${years} ans`, 10, 30);
    doc.text(`Rendement annuel : ${returnRate} %`, 10, 40);
    doc.text(result, 10, 60);
  
    doc.save("simulation_investissement.pdf");
  }
  