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

  // script.js
'use strict';

/* variables globales (utilisées par la section admissibilité) */
let montantPretGlobal = 0;
let paiementMensuelGlobal = 0; // paiement converti en équivalent mensuel

/* --- utilitaires --- */
function ratePerPeriod_from_formula(rAnnual, k) {
  // i = ( (1 + r/2)^2 )^(1/k) - 1
  const factor = Math.pow(1 + rAnnual / 2, 2);
  return Math.pow(factor, 1 / k) - 1;
}

function paymentFromPV(P, i, n) {
  // M = P * i (1+i)^n / ((1+i)^n - 1)
  if (!isFinite(P) || !isFinite(i) || !isFinite(n) || n <= 0) return NaN;
  if (Math.abs(i) < 1e-12) return P / n;
  const pow = Math.pow(1 + i, n);
  return P * (i * pow) / (pow - 1);
}

/* --- fonction principale : calcul hypothèque --- */
// --- calculerHypotheque : version corrigée ---
function calculerHypotheque() {
  try {
    const prix = parseFloat(document.getElementById("prix").value) || 0;
    const mise = parseFloat(document.getElementById("mise").value) || 0;
    const miseType = document.getElementById("miseType").value;
    const tauxAnnuel = parseFloat(document.getElementById("taux").value) / 100 || 0;
    const frequence = document.getElementById("frequence").value;
    const annees = parseInt(document.getElementById("amortissement").value) || 0;

    if (prix <= 0 || annees <= 0) {
      alert("Vérifie le prix et la durée d'amortissement.");
      return;
    }

    const freqMap = {
      mensuel: 12,
      bihebdo: 26,
      bihebdo_accelere: 26,
      hebdo: 52,
      hebdo_accelere: 52
    };
    const paiementsParAn = freqMap[frequence];
    const miseFonds = (miseType === "pourcentage") ? prix * (mise / 100) : mise;
    const montantPret = Math.max(0, prix - miseFonds);
    const nbPaiements = paiementsParAn * annees;

    // --- CAS ACCELERE : on calcule d'abord le paiement mensuel (k = 12),
    // puis on divise (mensual/2 pour bihebdo_accelere, mensual/4 pour hebdo_accelere)
    let paiementParPeriode;
    if (frequence === 'bihebdo_accelere' || frequence === 'hebdo_accelere') {
      // taux par mois (k = 12)
      const iMensuel = ratePerPeriod_from_formula(tauxAnnuel, 12); // helper : ( (1+r/2)^2 )^(1/12) - 1
      const nMensuel = 12 * annees;
      const paiementMensuel = paymentFromPV(montantPret, iMensuel, nMensuel);
      paiementParPeriode = (frequence === 'bihebdo_accelere') ? paiementMensuel / 2 : paiementMensuel / 4;
    } else {
      // calcul direct pour la fréquence choisie (k = paiementsParAn)
      const iPeriod = ratePerPeriod_from_formula(tauxAnnuel, paiementsParAn);
      paiementParPeriode = paymentFromPV(montantPret, iPeriod, nbPaiements);
    }

    if (!isFinite(paiementParPeriode)) {
      document.getElementById("resultats").innerHTML = `<p>Impossible de calculer — vérifie les valeurs.</p>`;
      console.error("paiementParPeriode non-fini", paiementParPeriode);
      return;
    }

    // coût total
    const coutTotal = paiementParPeriode * nbPaiements;

    // équivalent paiement mensuel pour la section admissibilité
    paiementMensuelGlobal = paiementParPeriode * (12 / paiementsParAn);
    montantPretGlobal = montantPret;

    // affichage résumé
    document.getElementById("resultats").innerHTML = `
      <p><strong>Montant du prêt :</strong> ${montantPret.toLocaleString()} $</p>
      <p><strong>Paiement (${frequence}) :</strong> ${paiementParPeriode.toFixed(2)} $</p>
      <p><strong>Équivalent paiement mensuel :</strong> ${paiementMensuelGlobal.toFixed(2)} $</p>
      <p><strong>Coût total du prêt sur ${annees} ans :</strong> ${coutTotal.toLocaleString(undefined,{maximumFractionDigits:2})} $</p>
    `;

    // --- Amortissement / graphique ---
    const i_period_for_amort = ratePerPeriod_from_formula(tauxAnnuel, paiementsParAn);
    // simuler et afficher solde par année
    let solde = montantPret;
    const valeurs = [], labels = [];
    for (let p = 0; p <= nbPaiements; p++) {
      if (p % paiementsParAn === 0) {
        valeurs.push(solde);
        labels.push(`Année ${p / paiementsParAn}`);
      }
      if (p === nbPaiements) break;
      const interet = solde * i_period_for_amort;
      const capital = paiementParPeriode - interet;
      solde = Math.max(0, solde - capital);
    }

    const ctx = document.getElementById("graphique").getContext("2d");
    if (window.graph) window.graph.destroy();
    window.graph = new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label:'Solde du prêt', data:valeurs, borderColor:'#16a34a', fill:true, backgroundColor:'rgba(16,163,74,0.08)', tension:0.3 }] },
      options: { responsive:true, scales:{ y:{ beginAtZero:true } } }
    });

    // tableau amortissement 5 premières années (par période)
    solde = montantPret;
    let rows = '';
    const periodesTable = Math.min(nbPaiements, paiementsParAn * 5);
    for (let p = 1; p <= periodesTable; p++) {
      const interet = solde * i_period_for_amort;
      const capital = paiementParPeriode - interet;
      solde = Math.max(0, solde - capital);
      rows += `<tr><td>${p}</td><td>${paiementParPeriode.toFixed(2)}</td><td>${interet.toFixed(2)}</td><td>${capital.toFixed(2)}</td><td>${solde.toFixed(2)}</td></tr>`;
    }
    document.getElementById("tableau").innerHTML = `<table><thead><tr><th>Période</th><th>Paiement</th><th>Intérêts</th><th>Capital</th><th>Solde</th></tr></thead><tbody>${rows}</tbody></table>`;

    console.log("calculerHypotheque ->", { montantPret, paiementParPeriode, paiementMensuelGlobal, paiementsParAn, nbPaiements });

  } catch (err) {
    console.error("Erreur calculerHypotheque:", err);
    document.getElementById("resultats").innerHTML = `<p>Erreur: ${err.message}</p>`;
  }
}


/* --- admissibilité --- */
// --- Admissibilité hypothécaire (2 salaires) ---
function verifierAdmissibilite() {
  try {
    const salaire1 = Number(document.getElementById("salaire1")?.value) || 0;
    const salaire2 = Number(document.getElementById("salaire2")?.value) || 0;
    const chauffage = Number(document.getElementById("chauffage")?.value) || 0;
    const taxes     = Number(document.getElementById("taxes")?.value) || 0;
    const dettes    = Number(document.getElementById("dettes")?.value) || 0;

    const tauxUtilisateur = (Number(document.getElementById("taux")?.value) || 0) / 100;
    const annees = parseInt(document.getElementById("amortissement")?.value, 10) || 25;

    const resDiv = document.getElementById("resultats-admissibilite");
    if (!resDiv) return;

    // On a besoin du montant du prêt -> l’utilisateur doit cliquer "Calculer" d’abord
    if (!Number.isFinite(montantPretGlobal) || montantPretGlobal <= 0) {
      resDiv.innerHTML = `<p>👉 Commence par cliquer sur <strong>Calculer</strong> pour déterminer le montant du prêt.</p>`;
      return;
    }

    // Taux de stress (max +2% ou 5.25%)
    const tauxStress = Math.max(tauxUtilisateur + 0.02, 0.0525);

    // Paiement mensuel à taux stress (formule standard)
    const iMensuelPeriod = Math.pow(Math.pow(1 + tauxStress / 2, 2), 1 / 12) - 1;
    const n = 12 * annees;
    if (iMensuelPeriod <= 0 || n <= 0) {
      resDiv.innerHTML = `<p>Vérifie le taux et la durée d'amortissement.</p>`;
      return;
    }
    const pow = Math.pow(1 + iMensuelPeriod, n);
    const paiementStress = montantPretGlobal * (iMensuelPeriod * pow) / (pow - 1);

    // Revenu brut mensuel combiné
    const revenuMensuel = (salaire1 + salaire2) / 12;
    if (revenuMensuel <= 0) {
      resDiv.innerHTML = `<p>Entre au moins un salaire brut annuel &gt; 0.</p>`;
      return;
    }

    // Ratios
    const ABD = ((paiementStress + taxes + chauffage) / revenuMensuel) * 100;
    const ATD = ((paiementStress + taxes + chauffage + dettes) / revenuMensuel) * 100;

    const conformeABD = ABD <= 39 ? "✅ Conforme" : "❌ Non conforme";
    const conformeATD = ATD <= 44 ? "✅ Conforme" : "❌ Non conforme";

    resDiv.innerHTML = `
      <p><strong>Taux utilisé pour le test de stress :</strong> ${(tauxStress * 100).toFixed(2)} %</p>
      <p><strong>Paiement mensuel stressé :</strong> ${paiementStress.toFixed(2)} $</p>
      <p><strong>ABD (GDS) :</strong> ${ABD.toFixed(2)} % — ${conformeABD}</p>
      <p><strong>ATD (TDS) :</strong> ${ATD.toFixed(2)} % — ${conformeATD}</p>
    `;
  } catch (e) {
    console.error(e);
    document.getElementById("resultats-admissibilite").innerHTML = `<p>Erreur : ${e.message}</p>`;
  }
}

// IMPORTANT : exposer les fonctions si tu utilises onclick="..."
// (mets ces lignes APRÈS la définition des fonctions)
window.verifierAdmissibilite = verifierAdmissibilite;



const paliersFed=[{min:0,max:16128.99,taux:0},{min:16129,max:57374.99,taux:0.1211},{min:57375,max:114749.99,taux:0.1712},{min:114750,max:177881.99,taux:0.2171},{min:177882,max:253413.99,taux:0.2422},{min:253414,max:Infinity,taux:0.2756}];
const paliersQc=[{min:0,max:18570.99,taux:0},{min:18571,max:53254.99,taux:0.14},{min:53255,max:106494.99,taux:0.19},{min:106495,max:129589.99,taux:0.24},{min:129590,max:Infinity,taux:0.2575}];

function impotProgressif(r,paliers){let imp=0;for(const pl of paliers){if(r>pl.min){const tx=Math.min(r,pl.max)-pl.min;if(tx>0)imp+=tx*pl.taux}}return imp;}
function tauxMarginalCombine(r){return paliersFed.find(p=>r<=p.max).taux+paliersQc.find(p=>r<=p.max).taux;}
const settings={det:{grossUp:1.38,fedCredit:0.1502,qcCredit:0.1170}};

function tauxDividendeTMI(r){const cfg=settings.det,d=1000,gross=d*cfg.grossUp;
  let fB=impotProgressif(r,paliersFed),fA=impotProgressif(r+gross,paliersFed),fNet=Math.max(0,(fA-fB)-gross*cfg.fedCredit);
  let qB=impotProgressif(r,paliersQc),qA=impotProgressif(r+gross,paliersQc),qNet=Math.max(0,(qA-qB)-gross*cfg.qcCredit);
  return((fNet+qNet)/d)*100;
}
function tauxGainEnCapital(r){const d=1000,taxable=d*0.5,b=impotProgressif(r,paliersFed)+impotProgressif(r,paliersQc),
  a=impotProgressif(r+taxable,paliersFed)+impotProgressif(r+taxable,paliersQc);
  return((a-b)/d)*100;
}

function calculerImpots(){
  const r=Number(document.getElementById('revenu').value)||0;
  const f=impotProgressif(r,paliersFed),q=impotProgressif(r,paliersQc),tot=f+q,net=r-tot;
  document.getElementById('impot-total').textContent=tot.toLocaleString(undefined,{maximumFractionDigits:2})+' $';
  document.getElementById('revenu-net').textContent=net.toLocaleString(undefined,{maximumFractionDigits:2})+' $';
  document.getElementById('taux-moyen').textContent=((tot/r)*100).toFixed(2)+' %';
  document.getElementById('taux-marginal').textContent=(tauxMarginalCombine(r)*100).toFixed(2)+' %';
  document.getElementById('taux-div-det').textContent=tauxDividendeTMI(r).toFixed(2)+' %';
  document.getElementById('taux-gc').textContent=tauxGainEnCapital(r).toFixed(2)+' %';
}

function remplirTableauPaliers() {
  const tableau = document.getElementById('table-paliers-combine').querySelector('tbody');
  const valeurs = [0]; // Commence par 0

  // Ajouter toutes les valeurs min arrondies
  [...paliersFed, ...paliersQc].forEach(p => {
    const minEntier = Math.round(p.min);
    if (!valeurs.includes(minEntier)) valeurs.push(minEntier);
  });

  valeurs.sort((a, b) => a - b);

  tableau.innerHTML = '';

  valeurs.forEach(revenu => {
    // Trouver le taux fédéral applicable
    let tauxFed = paliersFed.find(p => revenu >= p.min && revenu <= p.max)?.taux || 0;
    // Trouver le taux provincial applicable
    let tauxQc = paliersQc.find(p => revenu >= p.min && revenu <= p.max)?.taux || 0;
    // Total
    let tauxTotal = tauxFed + tauxQc;

    const tr = document.createElement('tr');

    const tdRevenu = document.createElement('td');
    tdRevenu.textContent = revenu.toLocaleString();
    tr.appendChild(tdRevenu);

    const tdFed = document.createElement('td');
    tdFed.textContent = (tauxFed * 100).toFixed(2) + " %";
    tr.appendChild(tdFed);

    const tdQc = document.createElement('td');
    tdQc.textContent = (tauxQc * 100).toFixed(2) + " %";
    tr.appendChild(tdQc);

    const tdTotal = document.createElement('td');
    tdTotal.textContent = (tauxTotal * 100).toFixed(2) + " %";
    tr.appendChild(tdTotal);

    tableau.appendChild(tr);
  });
}

// Appel de la fonction pour remplir le tableau
remplirTableauPaliers();



function revenuNetAnnuel(revenu) {
  const impots = impotProgressif(revenu, paliersFed) + impotProgressif(revenu, paliersQc);
  return revenu - impots;
}

function verifierBudget() {
  const salaire1 = parseFloat(document.getElementById("salaire1").value) || 0;
  const salaire2 = parseFloat(document.getElementById("salaire2").value) || 0;
  const chauffage = parseFloat(document.getElementById("chauffage").value) || 0;
  const taxes = parseFloat(document.getElementById("taxes").value) || 0;

  // Revenu net après impôt pour chaque personne
  const net1 = revenuNetAnnuel(salaire1);
  const net2 = revenuNetAnnuel(salaire2);
  const netTotal = net1 + net2;

  // Paiement hypothécaire normal (pas stressé)
  const tauxUtilisateur = parseFloat(document.getElementById("taux").value) / 100;
  const nbPaiementsMensuels = 12 * parseInt(document.getElementById("amortissement").value);

  const iMensuel = Math.pow(1 + tauxUtilisateur / 2, 2);
  const iMensuelPeriod = Math.pow(iMensuel, 1 / 12) - 1;

  const paiementNormal = montantPretGlobal * (iMensuelPeriod * Math.pow(1 + iMensuelPeriod, nbPaiementsMensuels)) / (Math.pow(1 + iMensuelPeriod, nbPaiementsMensuels) - 1);

  // Coût total mensuel (hypothèque + chauffage + taxes)
  const coutMensuel = paiementNormal + chauffage + taxes;

  // Ratio coût / revenu net mensuel
  const ratio = (coutMensuel / (netTotal / 12)) * 100;

  // Conformité
  const conformebudget = ratio <= 35 ? "✅ Conforme" : "❌ Non conforme";

  // Affichage
  document.getElementById("resultats-budget").innerHTML = `
    <p><strong>Revenu net annuel Personne 1 :</strong> ${net1.toLocaleString(undefined,{maximumFractionDigits:2})} $</p>
    <p><strong>Revenu net annuel Personne 2 :</strong> ${net2.toLocaleString(undefined,{maximumFractionDigits:2})} $</p>
    <p><strong>Revenu net annuel total :</strong> ${netTotal.toLocaleString(undefined,{maximumFractionDigits:2})} $</p>
    <p><strong>Coût mensuel de la propriété :</strong> ${coutMensuel.toFixed(2)} $</p>
    <p><strong>Ratio coût / revenu net :</strong> ${ratio.toFixed(2)} % — ${conformebudget}</p>
  `;
}


//let celi = 0, reer = 0, difference = 0, pertePar100 = 0, pvMistake = 0;

function comparerReerCeli() {
  const S = parseFloat(document.getElementById('montant').value);
  const r = parseFloat(document.getElementById('taux').value) / 100;
  const N = parseInt(document.getElementById('annees').value);
  const t1 = parseFloat(document.getElementById('t1').value) / 100;
  const t2 = parseFloat(document.getElementById('t2').value) / 100;

  // Valeurs finales
  celi = S * Math.pow(1 + r, N);
  reer = (celi / (1 - t1)) * (1 - t2);
  difference = reer - celi;

  // PV of mistake avec valeur absolue
  pvMistake = S * Math.abs((t2 - t1) / (1 - t1));

  // Texte explicatif avant résultats
  const explication = `
    <div class="explication">
      <p>💡 <strong>Explication :</strong></p>
      <p>Si vous investissez ${S.toLocaleString()}$ dans un CELI, il faudrait investir ${(S/(1-t1)).toFixed(2)}$ dans un REER pour obtenir un montant net équivalent après impôts, compte tenu du remboursement d’impôt basé sur le taux marginal de ${(t1*100).toFixed(2)}%.</p>
      <p>Les deux montants sont ensuite investis à un taux de rendement annuel de ${(r*100).toFixed(2)}% pendant ${N} années.</p>
      <p>À la sortie, le REER est imposé sur le total retiré au taux de ${(t2*100).toFixed(2)}%, tandis que le CELI reste entièrement exempt d’impôt.</p>
    </div>
  `;

  const resultats = `
    ${explication}
    <div class="result-box">
      <p>📈 <strong>Valeur finale net CELI :</strong> ${celi.toFixed(2)} $</p>
      <p>📊 <strong>Valeur finale net REER :</strong> ${reer.toFixed(2)} $</p>
      <p>🔍 <strong>Différence :</strong> ${Math.abs(difference.toFixed(2))} $</p>
      <p>⚠️ <strong>PV de l'erreur :</strong> ${pvMistake.toFixed(2)} $</p>
    </div>
  `;

  document.getElementById('resultats').innerHTML = resultats;

  const ctx = document.getElementById('chart').getContext('2d');
  if (window.barChart) window.barChart.destroy();
  window.barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['CELI', 'REER'],
      datasets: [{
        label: 'Valeur finale ($)',
        data: [celi, reer],
        backgroundColor: ['#8884d8', '#82ca9d']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Comparaison de la valeur finale' }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: value => `$${value}` }
        }
      }
    }
  });
}


function comparerReerCeliFixe() {

  // Utilise les mêmes paramètres que comparerReerCeli()
  const S = parseFloat(document.getElementById('montant').value);
  const r = parseFloat(document.getElementById('taux').value) / 100;
  const N = parseInt(document.getElementById('annees').value);
  const t1 = parseFloat(document.getElementById('t1').value) / 100;
  const t2 = parseFloat(document.getElementById('t2').value) / 100;

  // Calcul CELI et REER pour montant fixe
  const celiFixe = S * Math.pow(1 + r, N);
  const reerFixe = (S * (1 + t1)) * Math.pow(1 + r, N) * (1 - t2);
  const differenceFixe = reerFixe - celiFixe;
  pvMistakefixe = Math.abs((S + S * t1) * (1 - t2) - S);

  // Texte explicatif
  const explicationFixe = `
    <div class="explication">
      <p>💡 <strong>Explication :</strong></p>
      <p>Si vous avez ${S.toLocaleString()}$ à investir, vous pouvez choisir de le placer dans un CELI ou dans un REER.</p>
      <p>Dans le CELI, le montant est investi et croît entièrement à l'abri de l'impôt pendant ${N} années à un taux de rendement annuel de ${(r*100).toFixed(2)}%.</p>
      <p>Dans le REER, le même montant de ${S.toLocaleString()}$ est investi. Vous bénéficiez d’un remboursement d’impôt basé sur votre taux marginal de ${(t1*100).toFixed(2)}%, donc vous investissez ${(S*(1+t1)).toFixed(2)}$ .</p>
      <p>À la sortie, le REER est imposé sur le total retiré au taux de ${(t2*100).toFixed(2)}%, tandis que le CELI reste entièrement exempt d’impôt.</p>
    </div>
  `;

  // Résultats
  const resultatsFixe = `
    ${explicationFixe}
    <div class="result-box">
      <p>📈 <strong>Valeur finale CELI :</strong> ${celiFixe.toFixed(2)} $</p>
      <p>📊 <strong>Valeur finale REER :</strong> ${reerFixe.toFixed(2)} $</p>
      <p>🔍 <strong>Différence :</strong> ${Math.abs(differenceFixe.toFixed(2))} $</p>
      <p>⚠️ <strong>PV de l'erreur :</strong> ${pvMistakefixe.toFixed(2)} $</p>
    </div>
  `;

  // Affiche les résultats
  document.getElementById('resultats-fixe').innerHTML = resultatsFixe;

  // Graphique
  const ctx = document.getElementById('chart-fixe').getContext('2d');
  if (window.barChartFixe) window.barChartFixe.destroy();
  window.barChartFixe = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['CELI', 'REER'],
      datasets: [{
        label: 'Valeur finale ($)',
        data: [celiFixe, reerFixe],
        backgroundColor: ['#8884d8', '#82ca9d']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: { display: true, text: 'Comparaison de la valeur finale (montant fixe)' }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { callback: value => `$${value}` }
        }
      }
    }
  });
}


