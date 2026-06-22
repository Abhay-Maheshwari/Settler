// Firebase Init & Configuration Check
let db = null;
let useFirebase = false;

function isFirebaseConfigValid() {
    return typeof firebaseConfig !== 'undefined' && 
           firebaseConfig && 
           firebaseConfig.apiKey && 
           firebaseConfig.apiKey !== 'YOUR_API_KEY' &&
           firebaseConfig.projectId && 
           firebaseConfig.projectId !== 'YOUR_PROJECT_ID';
}

if (isFirebaseConfigValid()) {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        useFirebase = true;
        
        // Update connection UI badge
        const syncStatus = document.getElementById('sync-status');
        if (syncStatus) {
            syncStatus.textContent = 'Cloud Synced';
            syncStatus.className = 'sync-status status-cloud';
        }
    } catch (e) {
        console.error("Firebase failed to initialize:", e);
    }
}

// State
let persons = [];
let transactions = [];

// Seed Firestore with Showcase Data
function seedFirestore() {
    const seedUUID = () => generateUUID();
    const dummyPersons = [
        { id: seedUUID(), name: "Alice" },
        { id: seedUUID(), name: "Bob" },
        { id: seedUUID(), name: "Charlie" },
        { id: seedUUID(), name: "Diana" },
        { id: seedUUID(), name: "Ethan" }
    ];
    
    const getId = (name) => dummyPersons.find(p => p.name === name).id;

    const dummyTransactions = [
        { id: seedUUID(), lenderId: getId("Alice"), borrowerId: getId("Bob"), amount: 120.50, description: "Dinner at Mario's", date: new Date(Date.now() - 86400000 * 5).toISOString() },
        { id: seedUUID(), lenderId: getId("Charlie"), borrowerId: getId("Alice"), amount: 45.00, description: "Movie tickets", date: new Date(Date.now() - 86400000 * 4).toISOString() },
        { id: seedUUID(), lenderId: getId("Bob"), borrowerId: getId("Diana"), amount: 300.00, description: "Airbnb booking", date: new Date(Date.now() - 86400000 * 3).toISOString() },
        { id: seedUUID(), lenderId: getId("Diana"), borrowerId: getId("Ethan"), amount: 50.00, description: "Gas money", date: new Date(Date.now() - 86400000 * 2).toISOString() },
        { id: seedUUID(), lenderId: getId("Ethan"), borrowerId: getId("Bob"), amount: 80.00, description: "Groceries", date: new Date(Date.now() - 86400000 * 1).toISOString() },
        { id: seedUUID(), lenderId: getId("Alice"), borrowerId: getId("Ethan"), amount: 15.50, description: "Coffee", date: new Date().toISOString() },
        { id: seedUUID(), lenderId: getId("Bob"), borrowerId: getId("Charlie"), amount: 200.00, description: "Concert tickets", date: new Date(Date.now() - 86400000 * 6).toISOString() },
        { id: seedUUID(), lenderId: getId("Charlie"), borrowerId: getId("Diana"), amount: 75.00, description: "Lunch", date: new Date(Date.now() - 86400000 * 7).toISOString() },
        { id: seedUUID(), lenderId: getId("Ethan"), borrowerId: getId("Alice"), amount: 25.00, description: "Uber ride", date: new Date(Date.now() - 86400000 * 8).toISOString() },
        { id: seedUUID(), lenderId: getId("Alice"), borrowerId: getId("Diana"), amount: 150.00, description: "Flight tickets", date: new Date(Date.now() - 86400000 * 10).toISOString() },
        { id: seedUUID(), lenderId: getId("Bob"), borrowerId: getId("Ethan"), amount: 90.00, description: "Ski pass", date: new Date(Date.now() - 86400000 * 11).toISOString() },
        { id: seedUUID(), lenderId: getId("Diana"), borrowerId: getId("Alice"), amount: 110.00, description: "Hotel stay", date: new Date(Date.now() - 86400000 * 13).toISOString() }
    ];

    const batch = db.batch();
    dummyPersons.forEach(p => {
        const ref = db.collection('persons').doc(p.id);
        batch.set(ref, { name: p.name });
    });
    dummyTransactions.forEach(t => {
        const ref = db.collection('transactions').doc(t.id);
        batch.set(ref, {
            lenderId: t.lenderId,
            borrowerId: t.borrowerId,
            amount: t.amount,
            description: t.description,
            date: t.date
        });
    });

    batch.commit().then(() => {
        console.log("Firestore successfully seeded with dummy data.");
    }).catch(err => {
        console.error("Error seeding Firestore:", err);
    });
}

if (useFirebase) {
    let personsLoaded = false;
    let transactionsLoaded = false;

    const checkAndSeed = () => {
        if (personsLoaded && transactionsLoaded) {
            if (persons.length === 0) {
                seedFirestore();
            } else {
                render();
            }
        }
    };

    db.collection('persons').onSnapshot(snapshot => {
        persons = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        personsLoaded = true;
        checkAndSeed();
    }, error => {
        console.error("Error loading persons:", error);
    });

    db.collection('transactions').onSnapshot(snapshot => {
        transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        transactionsLoaded = true;
        checkAndSeed();
    }, error => {
        console.error("Error loading transactions:", error);
    });
} else {
    // LocalStorage Fallback state loading
    persons = JSON.parse(localStorage.getItem('group_ledger_persons')) || [];
    transactions = JSON.parse(localStorage.getItem('group_ledger_transactions')) || [];

    // Dummy Data Seeding for Showcase
    if (!localStorage.getItem('group_ledger_seeded_v3')) {
        const seedUUID = () => crypto.randomUUID();
        
        const dummyPersons = [
            { id: seedUUID(), name: "Alice" },
            { id: seedUUID(), name: "Bob" },
            { id: seedUUID(), name: "Charlie" },
            { id: seedUUID(), name: "Diana" },
            { id: seedUUID(), name: "Ethan" }
        ];
        
        const getId = (name) => dummyPersons.find(p => p.name === name).id;

        const dummyTransactions = [
            { id: seedUUID(), lenderId: getId("Alice"), borrowerId: getId("Bob"), amount: 120.50, description: "Dinner at Mario's", date: new Date(Date.now() - 86400000 * 5).toISOString() },
            { id: seedUUID(), lenderId: getId("Charlie"), borrowerId: getId("Alice"), amount: 45.00, description: "Movie tickets", date: new Date(Date.now() - 86400000 * 4).toISOString() },
            { id: seedUUID(), lenderId: getId("Bob"), borrowerId: getId("Diana"), amount: 300.00, description: "Airbnb booking", date: new Date(Date.now() - 86400000 * 3).toISOString() },
            { id: seedUUID(), lenderId: getId("Diana"), borrowerId: getId("Ethan"), amount: 50.00, description: "Gas money", date: new Date(Date.now() - 86400000 * 2).toISOString() },
            { id: seedUUID(), lenderId: getId("Ethan"), borrowerId: getId("Bob"), amount: 80.00, description: "Groceries", date: new Date(Date.now() - 86400000 * 1).toISOString() },
            { id: seedUUID(), lenderId: getId("Alice"), borrowerId: getId("Ethan"), amount: 15.50, description: "Coffee", date: new Date().toISOString() },
            { id: seedUUID(), lenderId: getId("Bob"), borrowerId: getId("Charlie"), amount: 200.00, description: "Concert tickets", date: new Date(Date.now() - 86400000 * 6).toISOString() },
            { id: seedUUID(), lenderId: getId("Charlie"), borrowerId: getId("Diana"), amount: 75.00, description: "Lunch", date: new Date(Date.now() - 86400000 * 7).toISOString() },
            { id: seedUUID(), lenderId: getId("Ethan"), borrowerId: getId("Alice"), amount: 25.00, description: "Uber ride", date: new Date(Date.now() - 86400000 * 8).toISOString() },
            { id: seedUUID(), lenderId: getId("Alice"), borrowerId: getId("Diana"), amount: 150.00, description: "Flight tickets", date: new Date(Date.now() - 86400000 * 10).toISOString() },
            { id: seedUUID(), lenderId: getId("Bob"), borrowerId: getId("Ethan"), amount: 90.00, description: "Ski pass", date: new Date(Date.now() - 86400000 * 11).toISOString() },
            { id: seedUUID(), lenderId: getId("Diana"), borrowerId: getId("Alice"), amount: 110.00, description: "Hotel stay", date: new Date(Date.now() - 86400000 * 13).toISOString() }
        ];

        localStorage.setItem('group_ledger_persons', JSON.stringify(dummyPersons));
        localStorage.setItem('group_ledger_transactions', JSON.stringify(dummyTransactions));
        localStorage.setItem('group_ledger_seeded_v3', 'true');
        
        persons = dummyPersons;
        transactions = dummyTransactions;
    }
}

let currentViewUserId = '';
let activeIndividualModalUserId = null;

// DOM Elements
const peopleList = document.getElementById('people-list');
const historyList = document.getElementById('history-list');
const balancesList = document.getElementById('balances-list');
const formAddPerson = document.getElementById('form-add-person');
const inputPersonName = document.getElementById('input-person-name');

const selectViewAs = document.getElementById('select-view-as');
const personalSummary = document.getElementById('personal-summary');

const modalTransaction = document.getElementById('modal-transaction');
const btnAddTransaction = document.getElementById('btn-add-transaction');
const btnCloseModal = document.getElementById('btn-close-modal');
const formTransaction = document.getElementById('form-transaction');
const selectLender = document.getElementById('select-lender');
const selectBorrower = document.getElementById('select-borrower');
const inputAmount = document.getElementById('input-amount');
const inputDescription = document.getElementById('input-description');

// Individual History Modal Elements
const modalIndividualHistory = document.getElementById('modal-individual-history');
const btnCloseIndModal = document.getElementById('btn-close-ind-modal');
const indHistoryTitle = document.getElementById('ind-history-title');
const indHistorySummary = document.getElementById('ind-history-summary');
const indHistoryList = document.getElementById('ind-history-list');
const indHistorySettleContainer = document.getElementById('ind-history-settle-container');

// UUID Generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Persist Data
function saveData() {
    localStorage.setItem('group_ledger_persons', JSON.stringify(persons));
    localStorage.setItem('group_ledger_transactions', JSON.stringify(transactions));
    render();
}

// Add Person
formAddPerson.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = inputPersonName.value.trim();
    if (name) {
        const id = generateUUID();
        if (useFirebase) {
            db.collection('persons').doc(id).set({ name })
                .catch(err => alert("Error adding person: " + err.message));
        } else {
            persons.push({ id, name });
            saveData();
        }
        inputPersonName.value = '';
    }
});

// Remove Person
function removePerson(id) {
    // Check if person has transactions
    const hasTransactions = transactions.some(t => t.lenderId === id || t.borrowerId === id);
    if (hasTransactions) {
        alert("Cannot remove a person who is part of a transaction. Settle or delete their transactions first.");
        return;
    }
    if (useFirebase) {
        db.collection('persons').doc(id).delete()
            .catch(err => alert("Error removing person: " + err.message));
    } else {
        persons = persons.filter(p => p.id !== id);
        saveData();
    }
}

// Remove Transaction
function removeTransaction(id) {
    if(confirm("Are you sure you want to delete this transaction?")) {
        if (useFirebase) {
            db.collection('transactions').doc(id).delete()
                .catch(err => alert("Error removing transaction: " + err.message));
        } else {
            transactions = transactions.filter(t => t.id !== id);
            saveData();
        }
    }
}

// Settle Debt
function settleDebt(lenderId, borrowerId, amount) {
    // To settle, the borrower pays the lender
    const id = generateUUID();
    const newTx = {
        lenderId: borrowerId, // Borrower is paying now
        borrowerId: lenderId, // Lender is receiving
        amount: parseFloat(amount),
        description: "Settled up",
        date: new Date().toISOString(),
        isSettlement: true
    };
    if (useFirebase) {
        db.collection('transactions').doc(id).set(newTx)
            .catch(err => alert("Error settling debt: " + err.message));
    } else {
        transactions.push({ id, ...newTx });
        saveData();
    }
}

// Modal Logic
btnAddTransaction.addEventListener('click', () => {
    if (persons.length < 2) {
        alert("Please add at least 2 people to the group first.");
        return;
    }
    populateSelects();
    modalTransaction.classList.add('active');
});

btnCloseModal.addEventListener('click', () => {
    modalTransaction.classList.remove('active');
    formTransaction.reset();
});

// Add Transaction
formTransaction.addEventListener('submit', (e) => {
    e.preventDefault();
    const lenderId = selectLender.value;
    const borrowerId = selectBorrower.value;
    const amount = parseFloat(inputAmount.value);
    const description = inputDescription.value.trim() || "Transfer";

    if (lenderId === borrowerId) {
        alert("Lender and borrower cannot be the same person.");
        return;
    }

    if (lenderId && borrowerId && amount > 0) {
        const id = generateUUID();
        const newTx = {
            lenderId,
            borrowerId,
            amount,
            description,
            date: new Date().toISOString()
        };
        if (useFirebase) {
            db.collection('transactions').doc(id).set(newTx)
                .then(() => {
                    modalTransaction.classList.remove('active');
                    formTransaction.reset();
                })
                .catch(err => alert("Error saving transaction: " + err.message));
        } else {
            transactions.push({ id, ...newTx });
            modalTransaction.classList.remove('active');
            formTransaction.reset();
            saveData();
        }
    }
});

// Calculate Balances (Pairwise)
function calculateBalances() {
    const balances = {};
    
    // Initialize matrix
    persons.forEach(p1 => {
        balances[p1.id] = {};
        persons.forEach(p2 => {
            if (p1.id !== p2.id) {
                balances[p1.id][p2.id] = 0;
            }
        });
    });

    // Compute pairwise net: positive means p2 owes p1
    transactions.forEach(t => {
        if(balances[t.lenderId] && balances[t.lenderId][t.borrowerId] !== undefined) {
            balances[t.lenderId][t.borrowerId] += t.amount;
            balances[t.borrowerId][t.lenderId] -= t.amount;
        }
    });

    return balances;
}

// Render UI
function render() {
    populateSelects();
    renderPeople();
    renderHistory();
    renderBalances();
    if (activeIndividualModalUserId) {
        renderIndividualHistoryModal();
    }
}

function getPersonName(id) {
    const p = persons.find(p => p.id === id);
    return p ? p.name : 'Unknown';
}

function populateSelects() {
    selectLender.innerHTML = '<option value="">Select a person...</option>';
    selectBorrower.innerHTML = '<option value="">Select a person...</option>';
    
    const currentView = selectViewAs.value;
    selectViewAs.innerHTML = '<option value="">Everyone (Group Overview)</option>';
    
    persons.forEach(p => {
        selectLender.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        selectBorrower.innerHTML += `<option value="${p.id}">${p.name}</option>`;
        selectViewAs.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
    
    if (persons.some(p => p.id === currentView)) {
        selectViewAs.value = currentView;
    }
}

function renderPeople() {
    if (persons.length === 0) {
        peopleList.innerHTML = '<div class="empty-state">No one in the group yet.</div>';
        return;
    }

    peopleList.innerHTML = persons.map(p => `
        <div class="person-item">
            <span class="clickable-name" onclick="viewAsUser('${p.id}')">${p.name}</span>
            <button class="btn-danger-sm" onclick="removePerson('${p.id}')">Remove</button>
        </div>
    `).join('');
}

function renderHistory() {
    if (transactions.length === 0) {
        historyList.innerHTML = '<div class="empty-state">No transactions yet.</div>';
        return;
    }

    // Sort descending by date
    let sortedTx = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

    if (currentViewUserId) {
        sortedTx = sortedTx.filter(t => t.lenderId === currentViewUserId || t.borrowerId === currentViewUserId);
        
        if (sortedTx.length === 0) {
            historyList.innerHTML = '<div class="empty-state">No transactions found for you.</div>';
            return;
        }
    }

    // Cap visible transactions
    const selectHistoryLimit = document.getElementById('select-history-limit');
    let displayTx = sortedTx;
    if (selectHistoryLimit && selectHistoryLimit.value !== 'all') {
        const limitNum = parseInt(selectHistoryLimit.value, 10);
        displayTx = sortedTx.slice(0, limitNum);
    }

    historyList.innerHTML = displayTx.map(t => {
        const date = new Date(t.date).toLocaleDateString();
        
        let lenderName = getPersonName(t.lenderId);
        let borrowerName = getPersonName(t.borrowerId);
        
        if (currentViewUserId) {
            if (t.lenderId === currentViewUserId) lenderName = "You";
            if (t.borrowerId === currentViewUserId) borrowerName = "you";
        }

        return `
        <div class="history-item">
            <div class="history-item-details">
                <strong>${lenderName} paid to ${borrowerName}</strong>
                <span class="history-item-desc">${t.description} • ${date}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="history-item-amount">$${t.amount.toFixed(2)}</span>
                <button class="btn-danger-sm" onclick="removeTransaction('${t.id}')">&times;</button>
            </div>
        </div>
        `;
    }).join('');
}

function renderBalances() {
    if (persons.length < 2) {
        balancesList.innerHTML = '<div class="empty-state">Add at least 2 people to see balances.</div>';
        return;
    }

    const balances = calculateBalances();
    let balanceHtml = '';
    
    // For Split View
    let youOweHtml = '';
    let owedToYouHtml = '';
    
    let totalOwedToUser = 0;
    let totalUserOwes = 0;

    // Toggle everyone-view class for standalone grid look
    const balancesSection = document.getElementById('balances-section');
    if (currentViewUserId) {
        balancesSection.classList.remove('everyone-view');
    } else {
        balancesSection.classList.add('everyone-view');
    }

    // Calculate overall net balances for the overview boxes
    const netBalances = {};
    persons.forEach(p => {
        netBalances[p.id] = 0;
    });

    persons.forEach(p1 => {
        persons.forEach(p2 => {
            if (p1.id < p2.id) {
                const net = balances[p1.id][p2.id] || 0;
                netBalances[p1.id] += net;
                netBalances[p2.id] -= net;
            }
        });
    });

    persons.forEach(p1 => {
        persons.forEach(p2 => {
            if (p1.id >= p2.id) return; // Avoid duplicates (combinations instead of permutations)
            
            const net = balances[p1.id][p2.id];
            if (net === 0) return;

            // If we have a view filter, only include pairs with that user
            if (currentViewUserId && p1.id !== currentViewUserId && p2.id !== currentViewUserId) {
                return;
            }

            let debtor, creditor, amount;
            if (net > 0) {
                // p2 owes p1
                creditor = p1;
                debtor = p2;
                amount = net;
            } else {
                // p1 owes p2
                creditor = p2;
                debtor = p1;
                amount = Math.abs(net);
            }

            let isYouOwe = false;
            let isOwedToYou = false;

            if (currentViewUserId) {
                if (creditor.id === currentViewUserId) {
                    totalOwedToUser += amount;
                    isOwedToYou = true;
                } else if (debtor.id === currentViewUserId) {
                    totalUserOwes += amount;
                    isYouOwe = true;
                }
            }

            // Contextual text
            let debtorNameHtml = '';
            let creditorNameHtml = '';
            let otherUserId = debtor.id === currentViewUserId ? creditor.id : debtor.id;

            if (currentViewUserId) {
                let debtorText = debtor.id === currentViewUserId ? "You" : debtor.name;
                let creditorText = creditor.id === currentViewUserId ? "you" : creditor.name;
                debtorNameHtml = `<strong>${debtorText}</strong>`;
                creditorNameHtml = `<strong>${creditorText}</strong>`;
            } else {
                debtorNameHtml = `<strong><span class="clickable-name" onclick="viewAsUser('${debtor.id}')">${debtor.name}</span></strong>`;
                creditorNameHtml = `<strong><span class="clickable-name" onclick="viewAsUser('${creditor.id}')">${creditor.name}</span></strong>`;
            }

            let isActive = (activeIndividualModalUserId === otherUserId) ? 'active' : '';
            let clickableClass = currentViewUserId ? 'clickable' : '';
            let onClickHandler = currentViewUserId ? `onclick="openIndividualHistoryModal('${otherUserId}')"` : '';

            let itemHtml = `
                <div class="balance-item ${clickableClass} ${isActive}" ${onClickHandler}>
                    <div>
                        ${debtorNameHtml} owe${(currentViewUserId && debtor.id === currentViewUserId) ? '' : 's'} ${creditorNameHtml}
                    </div>
                    <div style="display: flex; align-items: center; gap: 1rem;">
                        <span class="history-item-amount amount-negative">$${amount.toFixed(2)}</span>
                        <button class="btn btn-secondary btn-sm" 
                            onclick="event.stopPropagation(); settleDebt('${creditor.id}', '${debtor.id}', ${amount})">Settle Up</button>
                    </div>
                </div>
            `;

            if (currentViewUserId) {
                if (isYouOwe) youOweHtml += itemHtml;
                if (isOwedToYou) owedToYouHtml += itemHtml;
            } else {
                balanceHtml += itemHtml;
            }
        });
    });

    if (currentViewUserId) {
        if (!youOweHtml && !owedToYouHtml) {
            balancesList.innerHTML = '<div class="empty-state">All settled up!</div>';
        } else {
            balancesList.innerHTML = `
                <div class="balances-split">
                    <div class="balance-column">
                        <h3>You Owe</h3>
                        ${youOweHtml || '<div class="empty-state" style="padding:1rem;">Nothing owed</div>'}
                    </div>
                    <div class="balance-column">
                        <h3>Owed to You</h3>
                        ${owedToYouHtml || '<div class="empty-state" style="padding:1rem;">No one owes you</div>'}
                    </div>
                </div>
            `;
        }
    } else {
        // Group Overview (Everyone): render grid of large member boxes
        let boxesHtml = `
            <div class="people-grid large">
                ${persons.map(p => {
                    const net = netBalances[p.id] || 0;
                    let balanceText = 'settled up';
                    let balanceClass = '';
                    
                    if (net > 0) {
                        balanceText = `owed $${net.toFixed(2)}`;
                        balanceClass = 'amount-positive';
                    } else if (net < 0) {
                        balanceText = `owes $${Math.abs(net).toFixed(2)}`;
                        balanceClass = 'amount-negative';
                    }

                    return `
                        <div class="member-box large" onclick="viewAsUser('${p.id}')">
                            <div class="member-name">${p.name}</div>
                            <div class="member-balance ${balanceClass}">${balanceText}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        balancesList.innerHTML = boxesHtml;
    }

    // Update Summary
    if (currentViewUserId) {
        personalSummary.classList.remove('hidden');
        let netTotal = totalOwedToUser - totalUserOwes;
        if (netTotal > 0) {
            personalSummary.innerHTML = `Overall, you are owed <span class="amount-positive">$${netTotal.toFixed(2)}</span>`;
        } else if (netTotal < 0) {
            personalSummary.innerHTML = `Overall, you owe <span class="amount-negative">$${Math.abs(netTotal).toFixed(2)}</span>`;
        } else {
            personalSummary.innerHTML = `Your overall balance is settled.`;
        }
    } else {
        personalSummary.classList.add('hidden');
    }
}

// Switch view to individual user
function viewAsUser(userId) {
    currentViewUserId = userId;
    selectViewAs.value = userId;
    activeIndividualModalUserId = null;
    closeIndividualHistoryModal();
    render();
}

// View As Logic
selectViewAs.addEventListener('change', (e) => {
    currentViewUserId = e.target.value;
    activeIndividualModalUserId = null; // Reset filter on view change
    closeIndividualHistoryModal();
    render();
});

// Individual History Modal Functions
function openIndividualHistoryModal(otherUserId) {
    activeIndividualModalUserId = otherUserId;
    renderIndividualHistoryModal();
    modalIndividualHistory.classList.add('active');
}

function closeIndividualHistoryModal() {
    activeIndividualModalUserId = null;
    modalIndividualHistory.classList.remove('active');
}

btnCloseIndModal.addEventListener('click', closeIndividualHistoryModal);

modalIndividualHistory.addEventListener('click', (e) => {
    if (e.target === modalIndividualHistory) {
        closeIndividualHistoryModal();
    }
});

function modalSettleDebt(lenderId, borrowerId, amount) {
    settleDebt(lenderId, borrowerId, amount);
    // Modal will render automatically on snapshot update if using Firebase,
    // but in local fallback we need to manually update:
    if (!useFirebase) {
        renderIndividualHistoryModal();
    }
}

function removeTransactionFromModal(id) {
    if (confirm("Are you sure you want to delete this transaction?")) {
        if (useFirebase) {
            db.collection('transactions').doc(id).delete()
                .catch(err => alert("Error removing transaction: " + err.message));
        } else {
            transactions = transactions.filter(t => t.id !== id);
            saveData();
            renderIndividualHistoryModal();
        }
    }
}

function renderIndividualHistoryModal() {
    if (!activeIndividualModalUserId || !currentViewUserId) return;
    
    const otherUser = persons.find(p => p.id === activeIndividualModalUserId);
    if (!otherUser) {
        closeIndividualHistoryModal();
        return;
    }
    
    indHistoryTitle.textContent = `History with ${otherUser.name}`;
    
    const balances = calculateBalances();
    const net = balances[currentViewUserId] ? (balances[currentViewUserId][otherUser.id] || 0) : 0;
    
    if (net > 0) {
        indHistorySummary.innerHTML = `${otherUser.name} owes you <span class="amount-positive">$${net.toFixed(2)}</span>`;
        indHistorySettleContainer.innerHTML = `
            <button class="btn btn-primary" onclick="event.stopPropagation(); modalSettleDebt('${currentViewUserId}', '${otherUser.id}', ${net})">Settle Up</button>
        `;
    } else if (net < 0) {
        const absNet = Math.abs(net);
        indHistorySummary.innerHTML = `You owe ${otherUser.name} <span class="amount-negative">$${absNet.toFixed(2)}</span>`;
        indHistorySettleContainer.innerHTML = `
            <button class="btn btn-primary" onclick="event.stopPropagation(); modalSettleDebt('${otherUser.id}', '${currentViewUserId}', ${absNet})">Settle Up</button>
        `;
    } else {
        indHistorySummary.innerHTML = `All settled up!`;
        indHistorySettleContainer.innerHTML = '';
    }
    
    let sharedTx = transactions.filter(t => 
        (t.lenderId === currentViewUserId && t.borrowerId === otherUser.id) ||
        (t.borrowerId === currentViewUserId && t.lenderId === otherUser.id)
    );
    
    sharedTx.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (sharedTx.length === 0) {
        indHistoryList.innerHTML = '<div class="empty-state">No transactions together.</div>';
        return;
    }
    
    indHistoryList.innerHTML = sharedTx.map(t => {
        const date = new Date(t.date).toLocaleDateString();
        let lenderName = getPersonName(t.lenderId);
        let borrowerName = getPersonName(t.borrowerId);
        
        if (t.lenderId === currentViewUserId) lenderName = "You";
        if (t.borrowerId === currentViewUserId) borrowerName = "you";
        
        return `
        <div class="history-item" style="padding: 0.75rem 0;">
            <div class="history-item-details">
                <strong>${lenderName} paid to ${borrowerName}</strong>
                <span class="history-item-desc">${t.description} • ${date}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span class="history-item-amount">$${t.amount.toFixed(2)}</span>
                <button class="btn-danger-sm" onclick="event.stopPropagation(); removeTransactionFromModal('${t.id}')">&times;</button>
            </div>
        </div>
        `;
    }).join('');
}

// Theme Logic
const btnThemeToggle = document.getElementById('btn-theme-toggle');
let isDarkMode = localStorage.getItem('group_ledger_theme') === 'dark';

function applyTheme() {
    if (isDarkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        btnThemeToggle.textContent = '☀️';
    } else {
        document.documentElement.removeAttribute('data-theme');
        btnThemeToggle.textContent = '🌙';
    }
}

btnThemeToggle.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    localStorage.setItem('group_ledger_theme', isDarkMode ? 'dark' : 'light');
    applyTheme();
});

// Initialize Settings
applyTheme();

// History Limit Listener
const selectHistoryLimit = document.getElementById('select-history-limit');
if (selectHistoryLimit) {
    selectHistoryLimit.addEventListener('change', () => {
        renderHistory();
    });
}

// Tab Switching Logic
let activeTab = 'balances';
const navBtns = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        switchTab(tabName);
    });
});

function switchTab(tabName) {
    activeTab = tabName;
    
    // Update nav buttons active states
    navBtns.forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update tab content displays
    tabContents.forEach(content => {
        if (content.id === `tab-${tabName}`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// Initial render
render();
