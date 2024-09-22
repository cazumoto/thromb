// Simulated database for patient data
let patients = {};

// Declare the chart variable in the global scope
let probabilityChart;

function registerPatient() {
    const patientID = document.getElementById('patient_id').value.trim();
    if (patientID === '') {
        alert('Please enter a valid Patient ID.');
        return;
    }

    if (patients[patientID]) {
        alert('Patient ID already exists. Please choose a different ID.');
        return;
    }

    // Initialize patient data
    patients[patientID] = {
        bleedingRiskFactors: [],
        ischemicRiskFactors: [],
        followUpEvents: []
    };

    // Update patient list
    updatePatientList();
    document.getElementById('patient_id').value = '';
    alert('Patient registered successfully!');
}

function updatePatientList() {
    const patientList = document.getElementById('patient_list');
    patientList.innerHTML = '<option value="">--Select Patient--</option>';
    for (let id in patients) {
        const option = document.createElement('option');
        option.value = id;
        option.textContent = id;
        patientList.appendChild(option);
    }

    document.getElementById('patient-registration').style.display = 'none';
    document.getElementById('patient-selection').style.display = 'block';
}

function loadPatientData() {
    const patientID = document.getElementById('patient_list').value;
    if (patientID === '') {
        document.getElementById('risk-assessment').style.display = 'none';
        document.getElementById('follow-up').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        return;
    }

    // Load existing data if any
    const patientData = patients[patientID];

    // Uncheck all checkboxes
    document.querySelectorAll('input[type="checkbox"]').forEach(el => el.checked = false);

    // Check bleeding risk factors
    patientData.bleedingRiskFactors.forEach(factor => {
        const checkbox = document.querySelector(`input[name="bleeding_risk"][value="${factor}"]`);
        if (checkbox) checkbox.checked = true;
    });

    // Check ischemic risk factors
    patientData.ischemicRiskFactors.forEach(factor => {
        const checkbox = document.querySelector(`input[name="ischemic_risk"][value="${factor}"]`);
        if (checkbox) checkbox.checked = true;
    });

    // Show sections
    document.getElementById('risk-assessment').style.display = 'block';
    document.getElementById('follow-up').style.display = 'block';
    document.getElementById('results').style.display = 'none';
}

function deletePatient() {
    const patientID = document.getElementById('patient_list').value;
    if (patientID === '') {
        alert('Please select a patient to delete.');
        return;
    }

    if (confirm(`Are you sure you want to delete patient ${patientID}?`)) {
        delete patients[patientID];
        updatePatientList();
        document.getElementById('risk-assessment').style.display = 'none';
        document.getElementById('follow-up').style.display = 'none';
        document.getElementById('results').style.display = 'none';
        alert('Patient deleted successfully.');
    }
}

function assessRisk() {
    const patientID = document.getElementById('patient_list').value;
    const patientData = patients[patientID];

    // Collect bleeding risk factors
    const bleedingRiskFactors = document.querySelectorAll('input[name="bleeding_risk"]:checked');
    const bleedingRiskList = Array.from(bleedingRiskFactors).map(el => el.value);

    // Collect ischemic risk factors
    const ischemicRiskFactors = document.querySelectorAll('input[name="ischemic_risk"]:checked');
    const ischemicRiskList = Array.from(ischemicRiskFactors).map(el => el.value);

    // Update patient data
    patientData.bleedingRiskFactors = bleedingRiskList;
    patientData.ischemicRiskFactors = ischemicRiskList;
    patientData.followUpEvents = []; // Reset follow-up events

    // Recalculate risks
    calculateRisks(patientData);
}

function updateFollowUp() {
    const patientID = document.getElementById('patient_list').value;
    const patientData = patients[patientID];

    const newBleedingEvent = document.getElementById('new_bleeding_event').checked;
    const newIschemicEvent = document.getElementById('new_ischemic_event').checked;
    const noNewEvent = document.getElementById('no_new_event').checked;

    // Reset follow-up events
    patientData.followUpEvents = [];

    // Update follow-up events
    if (newBleedingEvent) {
        patientData.followUpEvents.push('New Bleeding Event');
        // Add 'Prior bleeding' to bleeding risk factors if not already present
        if (!patientData.bleedingRiskFactors.includes('Prior bleeding')) {
            patientData.bleedingRiskFactors.push('Prior bleeding');
        }
    }

    if (newIschemicEvent) {
        patientData.followUpEvents.push('New Ischemic Event');
        // Optionally add 'Recurrent myocardial infarction' to ischemic risk factors
        if (!patientData.ischemicRiskFactors.includes('Recurrent myocardial infarction')) {
            patientData.ischemicRiskFactors.push('Recurrent myocardial infarction');
        }
    }

    // Recalculate risks
    calculateRisks(patientData);

    // Reset follow-up checkboxes
    document.getElementById('new_bleeding_event').checked = false;
    document.getElementById('new_ischemic_event').checked = false;
    document.getElementById('no_new_event').checked = false;
}

function calculateRisks(patientData) {
    const bleedingRiskCount = patientData.bleedingRiskFactors.length;
    const ischemicRiskCount = patientData.ischemicRiskFactors.length;

    // Determine High Bleeding Risk
    let isHighBleedingRisk = bleedingRiskCount >= 1;

    // Determine High Ischemic Risk
    let isHighIschemicRisk = ischemicRiskCount >= 2;

    // Display Bleeding Risk Result
    let bleedingRiskResult = isHighBleedingRisk ? 'Bleeding Risk: High' : 'Bleeding Risk: Not High';

    // Display Ischemic Risk Result
    let ischemicRiskResult = isHighIschemicRisk ? 'Ischemic Risk: High' : 'Ischemic Risk: Not High';

    // Generate therapy recommendation with detailed rationale
    generateTherapyRecommendation(patientData);

    // Generate probability graphs
    generateProbabilityGraphs(patientData);

    // Display Results
    document.getElementById('bleeding_risk_result').innerText = bleedingRiskResult;
    document.getElementById('ischemic_risk_result').innerText = ischemicRiskResult;
    document.getElementById('results').style.display = 'block';
}

function generateTherapyRecommendation(patientData) {
    let therapyRecommendation = '';
    let isHighBleedingRisk = patientData.bleedingRiskFactors.length >= 1;
    let isHighIschemicRisk = patientData.ischemicRiskFactors.length >= 2;
    let hasNewBleedingEvent = patientData.followUpEvents.includes('New Bleeding Event');
    let hasNewIschemicEvent = patientData.followUpEvents.includes('New Ischemic Event');

    // Determine the most appropriate therapy based on risk profile
    if (hasNewBleedingEvent || (isHighBleedingRisk && !isHighIschemicRisk)) {
        // High bleeding risk, low ischemic risk, or new bleeding event
        therapyRecommendation = `
            <p><strong>Recommendation:</strong> Minimize antithrombotic therapy to reduce bleeding risk.</p>
            <p><em>Rationale:</em> The patient's bleeding risk is elevated due to ${hasNewBleedingEvent ? 'a new bleeding event' : 'the presence of bleeding risk factors'}. Evidence indicates that reducing therapy intensity can lower bleeding risk without significantly increasing ischemic events in this population. The AI analyzed the patient's risk factors and determined that monotherapy would provide a safer balance between efficacy and safety.</p>
            <p><strong>Therapy Options:</strong></p>
            <ul>
                <li><strong>Clopidogrel Monotherapy</strong>
                    <ul>
                        <li>Dosage: 75 mg once daily</li>
                        <li>Duration: Continue as per physician's discretion</li>
                        <li><em>Evidence shows reduced bleeding risk (HR 0.60, 95% CI 0.50–0.72) compared to DAPT</em></li>
                    </ul>
                </li>
                <li><strong>Aspirin Monotherapy</strong>
                    <ul>
                        <li>Dosage: 81 mg once daily</li>
                        <li>Duration: Lifelong unless contraindicated</li>
                        <li><em>Evidence suggests similar ischemic protection with lower bleeding risk (HR 0.65, 95% CI 0.55–0.77)</em></li>
                    </ul>
                </li>
            </ul>
        `;
    } else if (hasNewIschemicEvent || (!isHighBleedingRisk && isHighIschemicRisk)) {
        // Low bleeding risk, high ischemic risk, or new ischemic event
        therapyRecommendation = `
            <p><strong>Recommendation:</strong> Intensify antithrombotic therapy to maximize ischemic protection.</p>
            <p><em>Rationale:</em> The patient's ischemic risk is elevated due to ${hasNewIschemicEvent ? 'a new ischemic event' : 'multiple ischemic risk factors'}. Evidence indicates that more potent antiplatelet agents significantly reduce ischemic events in such patients. The AI considered the low bleeding risk and high ischemic risk, recommending intensified therapy for optimal protection.</p>
            <p><strong>Therapy Options:</strong></p>
            <ul>
                <li><strong>Aspirin + Ticagrelor</strong>
                    <ul>
                        <li>Aspirin Dosage: 81 mg once daily</li>
                        <li>Ticagrelor Dosage: 90 mg twice daily</li>
                        <li>Duration: At least 12 months</li>
                        <li><em>Evidence shows a 22% reduction in major adverse cardiac events (HR 0.78, 95% CI 0.70–0.87)</em></li>
                    </ul>
                </li>
                <li><strong>Aspirin + Prasugrel</strong>
                    <ul>
                        <li>Aspirin Dosage: 81 mg once daily</li>
                        <li>Prasugrel Dosage: 10 mg once daily</li>
                        <li>Duration: At least 12 months</li>
                        <li><em>Evidence indicates a 19% reduction in MACE (HR 0.81, 95% CI 0.73–0.90)</em></li>
                    </ul>
                </li>
            </ul>
        `;
    } else if (isHighBleedingRisk && isHighIschemicRisk) {
        // Both high bleeding and ischemic risks
        therapyRecommendation = `
            <p><strong>Recommendation:</strong> Consider a de-escalation strategy to balance ischemic protection and bleeding risk.</p>
            <p><em>Rationale:</em> The patient has high risks for both bleeding and ischemic events. The AI reflected on this dual risk profile and suggested de-escalation strategies to provide sufficient ischemic protection while minimizing bleeding complications. Evidence supports this approach in achieving a favorable balance between efficacy and safety.</p>
            <p><strong>Therapy Options:</strong></p>
            <ul>
                <li><strong>Initial Intensive DAPT followed by De-escalation</strong>
                    <ul>
                        <li>First 1–3 months: Aspirin 81 mg once daily + Ticagrelor 90 mg twice daily</li>
                        <li>Then switch to: Aspirin 81 mg once daily + Clopidogrel 75 mg once daily</li>
                        <li>Duration: Total DAPT duration of 6–12 months</li>
                        <li><em>Evidence shows maintained ischemic protection (HR 0.85, 95% CI 0.76–0.95) with reduced bleeding risk (HR 1.10, 95% CI 0.90–1.35)</em></li>
                    </ul>
                </li>
                <li><strong>Shortened DAPT followed by Monotherapy</strong>
                    <ul>
                        <li>First 3 months: Aspirin 81 mg once daily + Clopidogrel 75 mg once daily</li>
                        <li>Then continue with: Clopidogrel 75 mg once daily</li>
                        <li>Duration: Monotherapy indefinitely or as per physician's discretion</li>
                        <li><em>Evidence suggests reduced bleeding risk (HR 0.65, 95% CI 0.55–0.77) while providing acceptable ischemic protection</em></li>
                    </ul>
                </li>
            </ul>
        `;
    } else {
        // Neither high bleeding nor high ischemic risk
        therapyRecommendation = `
            <p><strong>Recommendation:</strong> Continue standard antithrombotic therapy.</p>
            <p><em>Rationale:</em> The patient does not have significant risk factors that necessitate altering standard therapy. The AI determined that standard DAPT is appropriate, balancing efficacy and safety for patients with average risk profiles. Evidence supports this approach in patients without high bleeding or ischemic risks.</p>
            <p><strong>Therapy Options:</strong></p>
            <ul>
                <li><strong>Standard DAPT</strong>
                    <ul>
                        <li>Aspirin Dosage: 81 mg once daily</li>
                        <li>Clopidogrel Dosage: 75 mg once daily</li>
                        <li>Duration: 6–12 months</li>
                        <li><em>Evidence indicates balanced ischemic protection (HR 0.82, 95% CI 0.72–0.93) and bleeding risk (HR 1.71, 95% CI 1.30–2.24)</em></li>
                    </ul>
                </li>
            </ul>
        `;
    }

    // Generate Follow-up Guidance
    const followUpGuidance = generateFollowUpGuidance(patientData);

    // Display the therapy recommendation
    document.getElementById('therapy_recommendation').innerHTML = therapyRecommendation + followUpGuidance;
}

function generateProbabilityGraphs(patientData) {
    // Updated therapy options, including de-escalation strategies
    const therapyOptions = [
        {
            name: 'Standard DAPT',
            ischemicReductionHR: 0.82,
            ischemicReductionCI: [0.72, 0.93],
            bleedingRiskHR: 1.71,
            bleedingRiskCI: [1.30, 2.24]
        },
        {
            name: 'Intensive DAPT',
            ischemicReductionHR: 0.78,
            ischemicReductionCI: [0.70, 0.87],
            bleedingRiskHR: 1.73,
            bleedingRiskCI: [1.19, 2.50]
        },
        {
            name: 'De-escalation Strategy',
            ischemicReductionHR: 0.85,
            ischemicReductionCI: [0.76, 0.95],
            bleedingRiskHR: 1.10,
            bleedingRiskCI: [0.90, 1.35]
        },
        {
            name: 'Monotherapy',
            ischemicReductionHR: 0.95,
            ischemicReductionCI: [0.85, 1.06],
            bleedingRiskHR: 0.85,
            bleedingRiskCI: [0.70, 1.03]
        }
    ];

    // Select appropriate therapy options based on the patient's risk profile
    let selectedTherapies = [];

    if (patientData.followUpEvents.includes('New Bleeding Event')) {
        // High bleeding risk due to new bleeding event
        selectedTherapies = [therapyOptions[2], therapyOptions[3]]; // De-escalation and Monotherapy
    } else if (patientData.bleedingRiskFactors.length >= 1 && patientData.ischemicRiskFactors.length < 2) {
        // High bleeding risk, low ischemic risk
        selectedTherapies = [therapyOptions[3]]; // Monotherapy
    } else if (patientData.ischemicRiskFactors.length >= 2 && patientData.bleedingRiskFactors.length < 1) {
        // Low bleeding risk, high ischemic risk
        selectedTherapies = [therapyOptions[1]]; // Intensive DAPT
    } else if (patientData.ischemicRiskFactors.length >= 2 && patientData.bleedingRiskFactors.length >= 1) {
        // High ischemic and bleeding risks
        selectedTherapies = [therapyOptions[2]]; // De-escalation Strategy
    } else {
        // Balanced approach or standard therapy
        selectedTherapies = [therapyOptions[0]]; // Standard DAPT
    }

    // Prepare data for the chart
    const labels = selectedTherapies.map(therapy => therapy.name);
    const ischemicReductions = selectedTherapies.map(therapy => (1 - therapy.ischemicReductionHR) * 100);
    const bleedingRisks = selectedTherapies.map(therapy => (therapy.bleedingRiskHR - 1) * 100);

    // Create the chart
    const ctx = document.getElementById('probabilityChart').getContext('2d');
    if (probabilityChart) {
        probabilityChart.destroy();
    }
    probabilityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Ischemic Event Reduction (%)',
                    data: ischemicReductions,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)'
                },
                {
                    label: 'Increased Bleeding Risk (%)',
                    data: bleedingRisks,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Therapy Options: Ischemic Reduction vs. Bleeding Risk'
                },
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const index = context.dataIndex;
                            const therapy = selectedTherapies[index];
                            if (context.dataset.label === 'Ischemic Event Reduction (%)') {
                                return `${therapy.name}: ${context.parsed.y.toFixed(1)}% reduction (HR ${therapy.ischemicReductionHR.toFixed(2)}, 95% CI ${therapy.ischemicReductionCI[0]}–${therapy.ischemicReductionCI[1]})`;
                            } else {
                                return `${therapy.name}: ${context.parsed.y.toFixed(1)}% increase (HR ${therapy.bleedingRiskHR.toFixed(2)}, 95% CI ${therapy.bleedingRiskCI[0]}–${therapy.bleedingRiskCI[1]})`;
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Therapy Options'
                    }
                }
            }
        }
    });
}

function generateFollowUpGuidance(patientData) {
    let guidance = '';

    if (patientData.followUpEvents.length > 0) {
        guidance += `<h3>Follow-up Guidance:</h3>`;
        guidance += `<p>The patient has experienced the following new event(s) since the last assessment: <strong>${patientData.followUpEvents.join(', ')}</strong>.</p>`;
        guidance += `<p>Consider the following actions:</p>`;
        guidance += `<ul>`;
        if (patientData.followUpEvents.includes('New Bleeding Event')) {
            guidance += `<li>Reassess bleeding risk and adjust therapy to reduce bleeding complications.</li>`;
            guidance += `<li>Consider de-escalation strategies or transitioning to monotherapy.</li>`;
        }
        if (patientData.followUpEvents.includes('New Ischemic Event')) {
            guidance += `<li>Reassess ischemic risk and consider intensifying therapy to prevent further ischemic events.</li>`;
            guidance += `<li>Evaluate the potential benefits of more potent antiplatelet agents or extended therapy duration.</li>`;
        }
        guidance += `<li>Consult with a healthcare professional for personalized medical advice.</li>`;
        guidance += `</ul>`;
    } else {
        guidance += `<h3>Follow-up Guidance:</h3>`;
        guidance += `<p>No new events reported since the last assessment.</p>`;
        guidance += `<p>Continue current therapy and regular monitoring as per guidelines.</p>`;
    }

    return guidance;
}
