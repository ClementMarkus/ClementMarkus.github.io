function generatePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    doc.text("Dashboard Canada", 10, 10);
    doc.save("dashboard.pdf");
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
  