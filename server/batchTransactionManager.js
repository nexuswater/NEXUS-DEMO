// Batch Transaction Manager for XRPL/Xahau Devnet Portal
// Handles batch transaction creation and multi-account signing

class BatchTransactionManager {
    constructor() {
        this.maxInnerTransactions = 8;
        console.log('✅ Batch Transaction Manager initialized');
    }

    // Show Batch Transaction modal
    showBatchModal() {
        const modal = this.createBatchModal();
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    // Create Batch Transaction modal
    createBatchModal() {
        const modal = document.createElement('div');
        modal.id = 'batchTransactionModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-teal-400">⚡ XLS-0056 Batch</h3>
                    <button id="closeBatchModal" class="text-gray-400 hover:text-white text-xl">&times;</button>
                </div>
                
                <div class="mb-6">
                    <p class="text-gray-300 mb-4">Execute multiple transactions atomically with different processing modes for complex operations.</p>
                    <div class="bg-blue-900/30 p-4 rounded border border-blue-600/30 mb-4">
                        <h4 class="font-bold text-blue-400 mb-2">🔄 Signing Process:</h4>
                        <p class="text-sm text-gray-300 mb-2">A batch transaction may require signatures from multiple accounts. We'll automatically sign for each account that has inner transactions.</p>
                        <div class="text-xs text-gray-400">
                            <div><strong>Submitter:</strong> <span id="batchSubmitterPreview">Select account below...</span></div>
                            <div><strong>Other Signers:</strong> <span id="otherSignersPreview" class="font-mono text-white">Will be calculated...</span></div>
                            <div><strong>Total Inner Transactions:</strong> <span id="innerTxnCount">0</span></div>
                        </div>
                    </div>
                </div>

                <!-- Batch Mode Selection -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-gray-300 mb-3">Batch Processing Mode:</label>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <button id="allOrNothingMode" class="batch-mode-btn bg-teal-800 hover:bg-teal-700 text-white px-3 py-2 rounded transition duration-300 border-2 border-teal-600 flex items-center space-x-2">
                            <span class="text-lg">🔒</span>
                            <div class="text-left">
                                <div class="font-bold text-sm">All Or Nothing</div>
                                <div class="text-xs text-gray-300">All transactions must succeed</div>
                            </div>
                        </button>
                        <button id="onlyOneMode" class="batch-mode-btn bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition duration-300 border-2 border-gray-600 flex items-center space-x-2">
                            <span class="text-lg">1️⃣</span>
                            <div class="text-left">
                                <div class="font-bold text-sm">Only One</div>
                                <div class="text-xs text-gray-300">First successful transaction only</div>
                            </div>
                        </button>
                        <button id="untilFailureMode" class="batch-mode-btn bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition duration-300 border-2 border-gray-600 flex items-center space-x-2">
                            <span class="text-lg">⏸️</span>
                            <div class="text-left">
                                <div class="font-bold text-sm">Until Failure</div>
                                <div class="text-xs text-gray-300">Stop at first failure</div>
                            </div>
                        </button>
                        <button id="independentMode" class="batch-mode-btn bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded transition duration-300 border-2 border-gray-600 flex items-center space-x-2">
                            <span class="text-lg">🔄</span>
                            <div class="text-left">
                                <div class="font-bold text-sm">Independent</div>
                                <div class="text-xs text-gray-300">Process all regardless</div>
                            </div>
                        </button>
                    </div>
                    <input type="hidden" id="selectedBatchMode" value="allOrNothing">
                </div>

                <!-- Batch Account -->
                <div class="mb-4">
                    <label class="block text-sm font-medium text-gray-300 mb-2">Batch Submitter Account:</label>
                    <select id="batchSubmitterAccount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white">
                        <option value="">Choose account to submit batch...</option>
                    </select>
                    <p class="text-xs text-gray-400 mt-1">Account that will submit and pay fees for the batch transaction</p>
                </div>

                <!-- Inner Transactions -->
                <div class="mb-6">
                    <div class="flex justify-between items-center mb-3">
                        <label class="block text-sm font-medium text-gray-300">Inner Transactions:</label>
                        <button type="button" id="addInnerTransaction" class="bg-blue-800 hover:bg-blue-700 text-white px-3 py-2 rounded transition duration-300 text-sm">
                            ➕ Add Transaction
                        </button>
                    </div>
                    <div id="innerTransactionsList" class="space-y-4">
                        <!-- Inner transaction entries will be added here -->
                    </div>
                    <p class="text-xs text-gray-400 mt-2">Up to 8 transactions can be included in a batch. Inner transactions use Fee: "0" and include tfInnerBatchTxn flag.</p>
                </div>

                <!-- Mode Description -->
                <div id="modeDescription" class="mb-6 p-4 bg-gray-700/50 rounded border">
                    <h4 class="text-sm font-bold text-teal-400 mb-2">🔒 All Or Nothing Mode:</h4>
                    <p class="text-xs text-gray-300">All transactions must succeed for any of them to succeed. Perfect for operations where partial completion would be problematic, like minting an NFT and creating an offer for it.</p>
                </div>

                <!-- Transaction Preview -->
                <div id="batchPreview" class="hidden mb-6 p-4 bg-gray-700/50 rounded border">
                    <h4 class="text-sm font-bold text-teal-400 mb-2">📋 Batch Preview:</h4>
                    <div class="text-xs space-y-1" id="batchPreviewContent">
                        <!-- Content will be populated by JavaScript -->
                    </div>
                </div>

                <div class="mb-6 text-xs text-gray-400 bg-yellow-900/30 p-3 rounded">
                    <h4 class="font-bold text-yellow-400 mb-1">⚠️ Batch Transaction Notes:</h4>
                    <ul class="list-disc pl-4 space-y-1">
                        <li>Inner transactions must have Fee: "0" (fees paid by outer transaction)</li>
                        <li>Inner transactions must include tfInnerBatchTxn flag (1073741824)</li>
                        <li>Inner transactions must have empty SigningPubKey: ""</li>
                        <li>Total fee calculation: (n + 2) × base_fee + sum of inner transaction fees</li>
                        <li>Maximum 8 inner transactions per batch</li>
                    </ul>
                </div>

                <div class="flex space-x-3">
                    <button id="previewBatch" class="flex-1 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300">🔍 Preview</button>
                    <button id="buildBatch" class="flex-1 bg-teal-800 hover:bg-teal-700 text-white px-4 py-2 rounded transition duration-300 opacity-50 cursor-not-allowed" disabled>⚙️ Build Batch</button>
                    <button id="cancelBatch" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition duration-300">Cancel</button>
                </div>
            </div>
        `;

        // Populate dropdowns
        this.populateAccountDropdowns(modal);

        // Setup event handlers
        this.setupBatchModalEvents(modal);

        return modal;
    }

    // Setup Batch modal event handlers
    setupBatchModalEvents(modal) {
        const closeBtn = modal.querySelector('#closeBatchModal');
        const cancelBtn = modal.querySelector('#cancelBatch');
        const previewBtn = modal.querySelector('#previewBatch');
        const buildBtn = modal.querySelector('#buildBatch');
        const addInnerTxnBtn = modal.querySelector('#addInnerTransaction');

        // Close modal
        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Batch mode selection
        const modeButtons = modal.querySelectorAll('.batch-mode-btn');
        const selectedModeInput = modal.querySelector('#selectedBatchMode');
        const modeDescription = modal.querySelector('#modeDescription');

        modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Reset all buttons
                modeButtons.forEach(b => {
                    b.classList.remove('bg-teal-800', 'border-teal-600', 'bg-purple-800', 'border-purple-600', 'bg-orange-800', 'border-orange-600', 'bg-green-800', 'border-green-600');
                    b.classList.add('bg-gray-700', 'border-gray-600');
                });

                // Highlight selected button and update mode
                let mode, description, colorClass;
                
                switch(btn.id) {
                    case 'allOrNothingMode':
                        mode = 'allOrNothing';
                        description = 'All transactions must succeed for any of them to succeed. Perfect for operations where partial completion would be problematic, like minting an NFT and creating an offer for it.';
                        colorClass = ['bg-teal-800', 'border-teal-600'];
                        break;
                    case 'onlyOneMode':
                        mode = 'onlyOne';
                        description = 'The first transaction to succeed will be the only one executed. Useful for submitting multiple offers with different slippage tolerances.';
                        colorClass = ['bg-purple-800', 'border-purple-600'];
                        break;
                    case 'untilFailureMode':
                        mode = 'untilFailure';
                        description = 'Transactions are processed in order until the first failure occurs. All subsequent transactions are skipped.';
                        colorClass = ['bg-orange-800', 'border-orange-600'];
                        break;
                    case 'independentMode':
                        mode = 'independent';
                        description = 'All transactions are processed regardless of individual success or failure. Similar to using tickets but more cost-effective.';
                        colorClass = ['bg-green-800', 'border-green-600'];
                        break;
                }

                btn.classList.remove('bg-gray-700', 'border-gray-600');
                btn.classList.add(...colorClass);
                selectedModeInput.value = mode;
                modeDescription.innerHTML = `<h4 class="text-sm font-bold text-teal-400 mb-2">${btn.querySelector('.font-bold').textContent} Mode:</h4><p class="text-xs text-gray-300">${description}</p>`;
            });
        });

        // Add inner transaction
        addInnerTxnBtn?.addEventListener('click', () => {
            this.addInnerTransaction(modal);
        });

        // Preview and build
        previewBtn?.addEventListener('click', () => {
            this.previewBatchTransaction(modal);
        });

        buildBtn?.addEventListener('click', () => {
            this.buildBatchTransaction(modal);
        });

        // Submitter account change handler
        const submitterSelect = modal.querySelector('#batchSubmitterAccount');
        submitterSelect?.addEventListener('change', () => {
            this.updateBatchPreview(modal);
        });

        // Add initial inner transaction
        this.addInnerTransaction(modal);
    }

    // Populate account dropdowns
    populateAccountDropdowns(modal) {
        const network = this.getCurrentNetwork();
        if (!network) return;

        const storageKey = `${network.toLowerCase()}_credentials`;
        const stored = localStorage.getItem(storageKey);
        const credentials = stored ? JSON.parse(stored) : [];

        const select = modal.querySelector('#batchSubmitterAccount');
        if (!select) return;

        // Clear existing options first
        select.innerHTML = '<option value="">Choose account to submit batch...</option>';

        credentials.forEach((credential, index) => {
            const option = document.createElement('option');
            option.value = credential.address;
            option.textContent = `${credential.address} (${credential.balance})`;
            select.appendChild(option);
        });

        if (credentials.length === 0) {
            const option = document.createElement('option');
            option.textContent = 'No accounts available - generate credentials first';
            option.disabled = true;
            select.appendChild(option);
        }
    }

    // Add inner transaction
    addInnerTransaction(modal) {
        const innerTxnsList = modal.querySelector('#innerTransactionsList');
        if (!innerTxnsList) return;

        const entries = innerTxnsList.querySelectorAll('.inner-transaction-entry');
        if (entries.length >= this.maxInnerTransactions) {
            alert(`Maximum ${this.maxInnerTransactions} inner transactions allowed per batch`);
            return;
        }

        const entryIndex = entries.length;
        const innerTxnEntry = document.createElement('div');
        innerTxnEntry.className = 'inner-transaction-entry bg-gray-700/30 p-4 rounded border border-gray-600';
        
        innerTxnEntry.innerHTML = `
            <div class="flex justify-between items-center mb-3">
                <span class="text-sm font-medium text-teal-400">Inner Transaction ${entryIndex + 1}</span>
                <button type="button" class="remove-inner-transaction text-red-400 hover:text-red-300 text-xs px-2 py-1 border border-red-400 rounded">Remove</button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div>
                    <label class="block text-xs text-gray-400 mb-1">Transaction Type:</label>
                    <select class="inner-txn-type w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                        <option value="Payment">Payment</option>
                        <option value="TrustSet">TrustSet</option>
                        <option value="OfferCreate">OfferCreate</option>
                        <option value="AccountSet">AccountSet</option>
                        <option value="CredentialCreate">CredentialCreate</option>
                    </select>
                </div>
                <div>
                    <label class="block text-xs text-gray-400 mb-1">From Account:</label>
                    <select class="inner-txn-account w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                        <option value="">Choose account...</option>
                    </select>
                </div>
            </div>

            <!-- Payment Fields -->
            <div class="payment-fields">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Destination:</label>
                        <select class="payment-destination w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                            <option value="">Choose destination...</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Amount (XRP drops):</label>
                        <input type="number" class="payment-amount w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="5000000" value="5000000">
                    </div>
                </div>
            </div>

            <!-- TrustSet Fields -->
            <div class="trustset-fields hidden">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Currency:</label>
                        <input type="text" class="trustset-currency w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="USD" maxlength="3">
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Issuer:</label>
                        <select class="trustset-issuer w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm">
                            <option value="">Choose issuer...</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-xs text-gray-400 mb-1">Limit:</label>
                        <input type="number" class="trustset-limit w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm" placeholder="1000000" value="1000000">
                    </div>
                </div>
            </div>

            <!-- Other transaction types will show a generic message -->
            <div class="other-fields hidden">
                <p class="text-xs text-gray-400 italic">Additional fields for this transaction type can be configured after building the batch.</p>
            </div>

            <div class="text-xs text-gray-500 bg-gray-800/50 p-2 rounded">
                <strong>Auto-configured:</strong> Fee: "0", SigningPubKey: "", Flags: includes tfInnerBatchTxn (1073741824), Sequence: auto-filled by client
            </div>
        `;

        innerTxnsList.appendChild(innerTxnEntry);

        // Populate account dropdowns for this entry
        this.populateInnerTransactionAccounts(innerTxnEntry);

        // Setup event handlers for this entry
        this.setupInnerTransactionEvents(innerTxnEntry, modal);

        this.updateInnerTransactionNumbers(modal);
        this.updateBatchPreview(modal);
    }

    // Populate account dropdowns for inner transactions
    populateInnerTransactionAccounts(entry) {
        const network = this.getCurrentNetwork();
        if (!network) return;

        const storageKey = `${network.toLowerCase()}_credentials`;
        const stored = localStorage.getItem(storageKey);
        const credentials = stored ? JSON.parse(stored) : [];

        const accountSelect = entry.querySelector('.inner-txn-account');
        const destinationSelect = entry.querySelector('.payment-destination');
        const issuerSelect = entry.querySelector('.trustset-issuer');
        
        [accountSelect, destinationSelect, issuerSelect].forEach(select => {
            if (!select) return;

            credentials.forEach((credential, index) => {
                const option = document.createElement('option');
                option.value = credential.address;
                option.textContent = `${credential.address.substring(0, 12)}... (${credential.balance})`;
                select.appendChild(option);
            });

            if (credentials.length === 0) {
                const option = document.createElement('option');
                option.textContent = 'No accounts available';
                option.disabled = true;
                select.appendChild(option);
            }
        });
    }

    // Setup inner transaction event handlers
    setupInnerTransactionEvents(entry, modal) {
        const removeBtn = entry.querySelector('.remove-inner-transaction');
        const typeSelect = entry.querySelector('.inner-txn-type');
        const accountSelect = entry.querySelector('.inner-txn-account');
        const paymentFields = entry.querySelector('.payment-fields');
        const trustsetFields = entry.querySelector('.trustset-fields');
        const otherFields = entry.querySelector('.other-fields');

        // Remove transaction
        removeBtn.addEventListener('click', () => {
            entry.remove();
            this.updateInnerTransactionNumbers(modal);
            this.updateBatchPreview(modal);
        });

        // Transaction type change
        typeSelect.addEventListener('change', () => {
            // Hide all field groups
            [paymentFields, trustsetFields, otherFields].forEach(fields => {
                fields?.classList.add('hidden');
            });

            // Show relevant fields
            switch(typeSelect.value) {
                case 'Payment':
                    paymentFields?.classList.remove('hidden');
                    break;
                case 'TrustSet':
                    trustsetFields?.classList.remove('hidden');
                    break;
                default:
                    otherFields?.classList.remove('hidden');
                    break;
            }
            this.updateBatchPreview(modal);
        });

        // Account selection change
        accountSelect.addEventListener('change', () => {
            this.updateBatchPreview(modal);
        });
    }

    // Update inner transaction numbers
    updateInnerTransactionNumbers(modal) {
        const entries = modal.querySelectorAll('.inner-transaction-entry');
        entries.forEach((entry, index) => {
            const label = entry.querySelector('span');
            if (label) {
                label.textContent = `Inner Transaction ${index + 1}`;
            }
        });

        // Update count in header
        const countElement = modal.querySelector('#innerTxnCount');
        if (countElement) {
            countElement.textContent = entries.length;
        }
    }

    // Update batch preview in header
    updateBatchPreview(modal) {
        const submitterSelect = modal.querySelector('#batchSubmitterAccount');
        const submitterPreview = modal.querySelector('#batchSubmitterPreview');
        const signersPreview = modal.querySelector('#otherSignersPreview');

        if (submitterSelect && submitterPreview) {
            if (submitterSelect.value) {
                submitterPreview.textContent = `${submitterSelect.value.substring(0, 20)}...`;
            } else {
                submitterPreview.textContent = 'Select account below...';
            }
        }

        // Calculate other signers
        const innerTxnEntries = modal.querySelectorAll('.inner-transaction-entry');
        const accounts = new Set();
        
        innerTxnEntries.forEach(entry => {
            const account = entry.querySelector('.inner-txn-account').value;
            if (account && account !== submitterSelect?.value) {
                accounts.add(account);
            }
        });

        if (signersPreview) {
            if (accounts.size === 0) {
                signersPreview.textContent = 'None (single-account batch)';
                signersPreview.className = 'font-mono text-green-400';
            } else {
                signersPreview.textContent = Array.from(accounts).map(acc => acc.substring(0, 8) + '...').join(', ');
                signersPreview.className = 'font-mono text-yellow-400';
            }
        }
    }

    // Preview batch transaction
    previewBatchTransaction(modal) {
        const data = this.gatherBatchData(modal);
        if (!data.isValid) {
            alert(data.error);
            return;
        }

        const network = this.getCurrentNetwork();
        const storageKey = `${network.toLowerCase()}_credentials`;
        const stored = localStorage.getItem(storageKey);
        const credentials = stored ? JSON.parse(stored) : [];

        const preview = modal.querySelector('#batchPreview');
        const content = modal.querySelector('#batchPreviewContent');
        const buildBtn = modal.querySelector('#buildBatch');

        if (preview && content) {
            const modeNames = {
                allOrNothing: 'All Or Nothing',
                onlyOne: 'Only One',
                untilFailure: 'Until Failure',
                independent: 'Independent'
            };

            let previewContent = `
                <div><span class="text-gray-400">Batch Submitter:</span> <span class="text-white">${data.submitterAccount}</span></div>
                <div><span class="text-gray-400">Batch Mode:</span> <span class="text-white">${modeNames[data.mode]}</span></div>
                <div><span class="text-gray-400">Inner Transactions:</span> <span class="text-white">${data.innerTransactions.length}</span></div>
                <div><span class="text-gray-400">Network:</span> <span class="text-white">${network.toUpperCase()}</span></div>
            `;

            if (data.needsBatchSigners) {
                const signerStatus = data.otherAccounts.map(account => {
                    const credential = credentials.find(cred => cred.address === account);
                    return {
                        account,
                        hasPublicKey: !!credential,
                        publicKey: credential ? credential.publicKey : null
                    };
                });

                previewContent += `<div><span class="text-yellow-400">⚠️ Multi-Account:</span> <span class="text-white">Requires BatchSigners for: ${data.otherAccounts.join(', ')}</span></div>`;
                
                previewContent += `
                    <div class="mt-2">
                        <span class="text-gray-400">Additional Signers:</span>
                        <div class="ml-4 text-xs">
                            ${signerStatus.map(s => 
                                `<div class="flex items-center gap-2">
                                    <span class="${s.hasPublicKey ? 'text-green-400' : 'text-red-400'}">${s.hasPublicKey ? '✅' : '❌'}</span>
                                    <span class="text-white font-mono">${s.account.substring(0, 8)}...${s.account.substring(-4)}</span>
                                    ${s.hasPublicKey ? '<span class="text-gray-400">(Public key available)</span>' : '<span class="text-red-400">(Not in credentials)</span>'}
                                </div>`
                            ).join('')}
                        </div>
                    </div>
                `;
            }

            data.innerTransactions.forEach((txn, index) => {
                // Remove sequence info from preview
                previewContent += `<div class="ml-4 text-xs"><span class="text-gray-400">${index + 1}. ${txn.TransactionType} from ${txn.Account.substring(0, 12)}... (seq: auto-filled)</span></div>`;
            });

            content.innerHTML = previewContent;

            preview.classList.remove('hidden');
            buildBtn.disabled = false;
            buildBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    // Gather batch data
    gatherBatchData(modal) {
        const mode = modal.querySelector('#selectedBatchMode').value;
        const submitterAccount = modal.querySelector('#batchSubmitterAccount').value;
        const innerTxnEntries = modal.querySelectorAll('.inner-transaction-entry');

        // Validation
        if (!submitterAccount) {
            return { isValid: false, error: 'Please select a batch submitter account.' };
        }

        if (innerTxnEntries.length === 0) {
            return { isValid: false, error: 'At least one inner transaction must be specified.' };
        }

        const innerTransactions = [];
        
        for (const entry of innerTxnEntries) {
            const txnType = entry.querySelector('.inner-txn-type').value;
            const account = entry.querySelector('.inner-txn-account').value;

            if (!account) {
                return { isValid: false, error: 'All inner transactions must have an account specified.' };
            }

            let transaction = {
                TransactionType: txnType,
                Account: account,
                Fee: '0',
                SigningPubKey: '',
                Flags: 1073741824 // tfInnerBatchTxn
                // Note: Sequence will be auto-filled by the transaction client
            };

            // Add type-specific fields
            if (txnType === 'Payment') {
                const destination = entry.querySelector('.payment-destination').value;
                const amount = entry.querySelector('.payment-amount').value;
                
                if (!destination || !amount) {
                    return { isValid: false, error: 'Payment transactions must have destination and amount.' };
                }
                
                transaction.Destination = destination;
                transaction.Amount = amount;
            } else if (txnType === 'TrustSet') {
                const currency = entry.querySelector('.trustset-currency').value;
                const issuer = entry.querySelector('.trustset-issuer').value;
                const limit = entry.querySelector('.trustset-limit').value;
                
                if (!currency || !issuer || !limit) {
                    return { isValid: false, error: 'TrustSet transactions must have currency, issuer, and limit.' };
                }
                
                transaction.LimitAmount = {
                    currency: currency.toUpperCase(),
                    issuer: issuer,
                    value: limit
                };
            }

            innerTransactions.push(transaction);
        }

        // Get unique accounts from inner transactions
        const innerTransactionAccounts = [...new Set(innerTransactions.map(tx => tx.Account))];
        
        // BatchSigners are only needed for accounts other than the submitter
        const otherAccounts = innerTransactionAccounts.filter(acc => acc !== submitterAccount);
        const needsBatchSigners = otherAccounts.length > 0;

        return {
            isValid: true,
            mode,
            submitterAccount,
            innerTransactions,
            needsBatchSigners,
            otherAccounts
        };
    }

    // Build batch transaction
    async buildBatchTransaction(modal) {
        const data = this.gatherBatchData(modal);
        if (!data.isValid) {
            alert(data.error);
            return;
        }

        const currentNetwork = this.getCurrentNetwork();
        if (!currentNetwork) {
            alert('No network selected.');
            return;
        }

        const storageKey = `${currentNetwork.toLowerCase()}_credentials`;
        const stored = localStorage.getItem(storageKey);
        const credentials = stored ? JSON.parse(stored) : [];

        // Helper function to get credential for an account
        const getCredentialForAccount = (accountAddress) => {
            return credentials.find(cred => cred.address === accountAddress);
        };

        try {
            // Map mode to flag value
            const modeFlags = {
                allOrNothing: 0x00010000,  // 65536
                onlyOne: 0x00020000,       // 131072
                untilFailure: 0x00040000,  // 262144
                independent: 0x00080000    // 524288
            };

            // Get client - FIX: use lowercase network names
            let client = null;
            if (currentNetwork === 'xrpl') {
                client = window.xrplConnection?.getClient?.() || window.xrplClient;
            } else if (currentNetwork === 'xahau') {
                client = window.xahauConnection?.getClient?.() || window.xahauClient;
            }

            if (!client) {
                throw new Error(`${currentNetwork.toUpperCase()} client not found. Please ensure you are connected to the network.`);
            }

            // Build the batch transaction base
            const batchTransaction = {
                TransactionType: 'Batch',
                Account: data.submitterAccount,
                Flags: modeFlags[data.mode],
                RawTransactions: []
            };

            const innerTransactionAccounts = [...new Set(data.innerTransactions.map(tx => tx.Account))];
            const otherAccounts = innerTransactionAccounts.filter(account => account !== data.submitterAccount);
            
            // Validate all required credentials are available
            const missingCredentials = [];
            
            if (!getCredentialForAccount(data.submitterAccount)) {
                missingCredentials.push(data.submitterAccount);
            }
            
            for (const account of otherAccounts) {
                if (!getCredentialForAccount(account)) {
                    missingCredentials.push(account);
                }
            }

            if (missingCredentials.length > 0) {
                throw new Error(`Missing credentials for accounts: ${missingCredentials.join(', ')}`);
            }

            // Process inner transactions (no sequence handling needed)
            const processedInnerTransactions = data.innerTransactions.map(innerTx => ({
                ...innerTx,
                Fee: '0',
                SigningPubKey: '',
                Flags: (innerTx.Flags || 0) | 1073741824 // Add tfInnerBatchTxn flag
                // Sequence will be auto-filled by the transaction client during submission
            }));

            // Add processed transactions to batch
            batchTransaction.RawTransactions = processedInnerTransactions.map(tx => ({
                RawTransaction: tx
            }));

            // Handle BatchSigners for multi-account scenarios
            if (otherAccounts.length > 0) {
                const batchSigners = [];

                // According to XLS-0056, BatchSigners sign the Flags field and hashes of RawTransactions
                // This is complex cryptographic work that should be handled by the XRPL client
                
                for (const signerAccount of otherAccounts) {
                    const credential = getCredentialForAccount(signerAccount);
                    if (credential) {
                        try {
                            // Create a wallet for the signer
                            if (typeof xrpl !== 'undefined') {
                                const signerWallet = xrpl.Wallet.fromSeed(credential.seed);
                                
                                // The signature for BatchSigners is complex - it involves:
                                // 1. Hashing each RawTransaction
                                // 2. Combining with the Flags field  
                                // 3. Signing the combined hash
                                
                                // For now, we'll prepare the structure and let the XRPL client handle signing
                                batchSigners.push({
                                    BatchSigner: {
                                        Account: signerAccount,
                                        SigningPubKey: credential.publicKey,
                                        TxnSignature: "" // Will be filled by XRPL client during submission
                                    }
                                });
                                
                                console.log(`✅ Prepared BatchSigner for ${signerAccount}`);
                            } else {
                                // Fallback when XRPL library not available
                                batchSigners.push({
                                    BatchSigner: {
                                        Account: signerAccount,
                                        SigningPubKey: credential.publicKey,
                                        TxnSignature: ""
                                    }
                                });
                                
                                console.warn(`⚠️ XRPL library not available, BatchSigner prepared without signature for ${signerAccount}`);
                            }
                            
                        } catch (signingError) {
                            console.error(`Failed to prepare BatchSigner for ${signerAccount}:`, signingError);
                            
                            // Still add the signer structure for manual completion
                            batchSigners.push({
                                BatchSigner: {
                                    Account: signerAccount,
                                    SigningPubKey: credential.publicKey,
                                    TxnSignature: ""
                                }
                            });
                        }
                    }
                }
                
                if (batchSigners.length > 0) {
                    batchTransaction.BatchSigners = batchSigners;
                }
            }

            // Add signing context for workflow
            if (otherAccounts.length > 0) {
                batchTransaction._signingContext = {
                    submitterAccount: data.submitterAccount,
                    otherAccounts: otherAccounts,
                    credentials: credentials.filter(cred => 
                        [...otherAccounts, data.submitterAccount].includes(cred.address)
                    ),
                    rawTransactions: processedInnerTransactions
                };
            }

            // AUTO-SIGN the BatchSigners before populating transaction builder
            if (batchTransaction.BatchSigners && batchTransaction.BatchSigners.length > 0) {
                console.log('🔐 Multi-account batch detected - launching BatchSigner workflow...');
                
                // Close the batch builder modal
                modal.remove();
                
                // Show the BatchSigner workflow instead of auto-signing
                this.showBatchSignerWorkflow(batchTransaction, credentials.filter(cred => 
                    [...otherAccounts, data.submitterAccount].includes(cred.address)
                ));
                
                return; // Exit early - workflow will handle completion
            }

            // For single-account batches, proceed normally
            // Remove _signingContext before sending to transaction builder
            const finalTransaction = { ...batchTransaction };
            delete finalTransaction._signingContext;

            // Populate the transaction builder with the transaction
            if (window.templateLibrary && window.templateLibrary.populateTransactionBuilder) {
                window.templateLibrary.populateTransactionBuilder(finalTransaction, 'Batch Transaction');
            } else {
                // Fallback
                const transactionJson = document.getElementById('transactionJson');
                if (transactionJson) {
                    transactionJson.value = JSON.stringify(finalTransaction, null, 2);
                }
            }

            // Close modal
            modal.remove();

            // Enhanced success message with signing info
            const modeNames = {
                allOrNothing: 'All Or Nothing',
                onlyOne: 'Only One',
                untilFailure: 'Until Failure',
                independent: 'Independent'
            };

            let message = `✅ Batch transaction built successfully!\n\n`;
            message += `Batch Submitter: ${data.submitterAccount}\n`;
            message += `Mode: ${modeNames[data.mode]}\n`;
            message += `Inner Transactions: ${data.innerTransactions.length}\n`;
            message += `\n\n✅ Single-Account Batch - Only submitter signature required.`;
            message += `\n\n🚀 Transaction is ready for submission!`;
            alert(message);

        } catch (error) {
            console.error('Error building batch transaction:', error);
            let errorMessage = `❌ Error building batch transaction: ${error.message}`;
            
            if (error.message.includes('credentials')) {
                errorMessage += `\n\nPlease ensure all required accounts have credentials available.`;
            } else if (error.message.includes('client')) {
                errorMessage += `\n\nPlease ensure you are connected to the ${currentNetwork} network and try again.`;
            }
            
            alert(errorMessage);
        }
    }

    // Show manual signing instructions
    showManualSigningInstructions(modal, batchTransaction) {
        const instructionsModal = document.createElement('div');
        instructionsModal.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-60';
        
        instructionsModal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-blue-400">📖 Manual BatchSigner Instructions</h3>
                    <button class="close-instructions text-gray-400 hover:text-white text-xl">&times;</button>
                </div>
                
                <div class="space-y-4 text-sm text-gray-300">
                    <div class="bg-blue-900/30 p-4 rounded border border-blue-600/30">
                        <h4 class="font-bold text-blue-400 mb-2">🔐 BatchSigner Manual Process:</h4>
                        <ol class="list-decimal pl-4 space-y-2">
                            <li>Each BatchSigner must sign the combination of Flags + RawTransaction hashes</li>
                            <li>Use the XRPL library to create a wallet from the signer's seed</li>
                            <li>Hash each RawTransaction individually using SHA-256</li>
                            <li>Combine the Flags field with the transaction hashes</li>
                            <li>Sign the combined data and place in TxnSignature field</li>
                        </ol>
                    </div>
                    
                    <div class="bg-yellow-900/30 p-4 rounded border border-yellow-600/30">
                        <h4 class="font-bold text-yellow-400 mb-2">⚠️ Technical Requirements:</h4>
                        <ul class="list-disc pl-4 space-y-1">
                            <li>Signatures must follow XRPL signing standards</li>
                            <li>All BatchSigners must sign before submitter signs outer transaction</li>
                            <li>Empty TxnSignature fields will cause temBAD_SIGNATURE errors</li>
                            <li>Use canonical JSON ordering for consistent hashing</li>
                        </ul>
                    </div>
                    
                    <div class="bg-gray-700/50 p-4 rounded">
                        <h4 class="font-bold text-gray-400 mb-2">📝 Current Batch Data:</h4>
                        <div class="text-xs font-mono bg-gray-800 p-2 rounded">
                            <div>Flags: ${batchTransaction.Flags}</div>
                            <div>RawTransactions: ${batchTransaction.RawTransactions.length}</div>
                            <div>BatchSigners: ${batchTransaction.BatchSigners?.length || 0}</div>
                        </div>
                    </div>
                </div>
                
                <div class="flex space-x-3 mt-6">
                    <button class="close-instructions flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition duration-300">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(instructionsModal);
        
        // Close instruction modal
        instructionsModal.querySelectorAll('.close-instructions').forEach(btn => {
            btn.addEventListener('click', () => {
                instructionsModal.remove();
            });
        });
    }

    // Get current network (fix the missing method)
    getCurrentNetwork() {
        return window.devnetManager.currentNetwork();
    }

    // Show BatchSigner workflow modal
    showBatchSignerWorkflow(batchTransaction, credentials) {

        alert(
        "⚠️ This BatchSigner workflow is a work in progress and not fully implemented.\n\n" +
        "Despite our efforts, full multi-account batch signing and submission is not available at this time."
        );

        console.log('🔐 Launching BatchSigner workflow for multi-account batch...');
        
        // Create BatchSigner workflow modal
        const modal = this.createBatchSignerWorkflowModal(batchTransaction, credentials);
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    // Create BatchSigner workflow modal
    createBatchSignerWorkflowModal(batchTransaction, credentials) {
        const modal = document.createElement('div');
        modal.id = 'batchSignerWorkflowModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        
        // Extract accounts that need BatchSigner signatures
        const submitterAccount = batchTransaction.Account;
        const innerAccounts = batchTransaction.RawTransactions.map(tx => tx.RawTransaction.Account);
        const otherAccounts = [...new Set(innerAccounts)].filter(acc => acc !== submitterAccount);
        
        // Calculate signing steps
        const signingSteps = this.calculateBatchSigningSteps(otherAccounts, credentials);
        
        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-orange-400">🔐 BatchSigner Workflow</h3>
                    <button id="closeBatchSignerModal" class="text-gray-400 hover:text-white text-xl">&times;</button>
                </div>
                
                <div class="mb-6">
                    <div class="bg-orange-900/30 p-4 rounded border border-orange-600/30 mb-4">
                        <h4 class="font-bold text-orange-400 mb-2">🔄 Multi-Account Batch Signing Process:</h4>
                        <p class="text-sm text-gray-300 mb-2">This batch transaction requires signatures from multiple accounts. Each BatchSigner must sign according to XLS-0056 specification.</p>
                        <div class="text-xs text-gray-400 grid grid-cols-2 gap-4">
                            <div><strong>Batch Submitter:</strong> ${submitterAccount.substring(0, 12)}...</div>
                            <div><strong>Batch Mode:</strong> ${this.getFlagName(batchTransaction.Flags)}</div>
                            <div><strong>Inner Transactions:</strong> ${batchTransaction.RawTransactions.length}</div>
                            <div><strong>BatchSigners Required:</strong> ${otherAccounts.length}</div>
                        </div>
                    </div>
                    
                    <div class="bg-blue-900/30 p-4 rounded border border-blue-600/30 mb-4">
                        <h4 class="font-bold text-blue-400 mb-2">📚 How BatchSigner Works (XLS-0056):</h4>
                        <ol class="list-decimal pl-4 space-y-1 text-sm text-gray-300">
                            <li>Each inner transaction is serialized to a hex blob</li>
                            <li>Each hex blob is hashed using SHA512Half</li>
                            <li>BatchSigners sign: BMT prefix + Flags + concatenated hashes</li>
                            <li>Signatures are added to the BatchSigners array</li>
                            <li>The submitter signs the complete batch transaction</li>
                        </ol>
                    </div>

                    <div class="bg-yellow-900/30 p-4 rounded border border-yellow-600/30">
                        <h4 class="font-bold text-yellow-400 mb-1">⚠️ Important Notes:</h4>
                        <ul class="list-disc pl-4 space-y-1 text-sm text-gray-300">
                            <li>BatchSigners do NOT sign individual inner transactions</li>
                            <li>They sign a special hash combination per XLS-0056</li>
                            <li>All BatchSigner signatures must be valid for batch to succeed</li>
                            <li>This is similar to multi-signing but for batch transactions</li>
                        </ul>
                    </div>
                </div>

                <!-- Signing Steps Progress -->
                <div class="mb-6">
                    <h4 class="text-lg font-bold text-gray-300 mb-4">Signing Steps:</h4>
                    <div id="batchSigningStepsList" class="space-y-4">
                        ${signingSteps.map((step, index) => this.createBatchSigningStepHTML(step, index)).join('')}
                    </div>
                </div>

                <!-- Batch Transaction Details -->
                <div class="mb-6">
                    <h4 class="text-sm font-bold text-gray-400 mb-2">📋 Transaction Details:</h4>
                    <div class="bg-gray-700/50 p-3 rounded text-xs font-mono">
                        <div>Submitter: ${submitterAccount}</div>
                        <div>Flags: ${batchTransaction.Flags} (${this.getFlagName(batchTransaction.Flags)})</div>
                        <div>Inner Transactions: ${batchTransaction.RawTransactions.length}</div>
                        <div class="mt-2 text-gray-400">
                            ${batchTransaction.RawTransactions.map((tx, i) => 
                                `${i+1}. ${tx.RawTransaction.TransactionType} from ${tx.RawTransaction.Account.substring(0, 12)}...`
                            ).join('<br>')}
                        </div>
                    </div>
                </div>

                <div class="flex space-x-3">
                    <button id="autoSignAllBatch" class="flex-1 bg-green-800 hover:bg-green-700 text-white px-4 py-2 rounded transition duration-300">🚀 Auto-Sign All BatchSigners</button>
                    <button id="manualBatchSigning" class="flex-1 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300">✍️ Manual Signing Guide</button>
                    <button id="cancelBatchSigning" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition duration-300">Cancel</button>
                </div>

                <!-- Progress indicator -->
                <div id="batchSigningProgress" class="hidden mt-4 p-3 bg-gray-700/50 rounded">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-sm text-gray-300">Signing Progress</span>
                        <span class="text-sm text-gray-300" id="batchProgressText">0 / ${otherAccounts.length}</span>
                    </div>
                    <div class="w-full bg-gray-600 rounded-full h-2">
                        <div class="bg-green-600 h-2 rounded-full transition-all duration-500" id="batchProgressBar" style="width: 0%"></div>
                    </div>
                </div>
            </div>
        `;

        this.setupBatchSignerWorkflowEvents(modal, batchTransaction, credentials, otherAccounts);
        return modal;
    }

    // Calculate BatchSigner signing steps
    calculateBatchSigningSteps(otherAccounts, credentials) {
        return otherAccounts.map(account => {
            const credential = credentials.find(cred => cred.address === account);
            return {
                account: account,
                hasCredential: !!credential,
                credential: credential,
                status: 'pending', // pending, signing, completed, failed
                signature: null
            };
        });
    }

    // Create HTML for individual BatchSigner step
    createBatchSigningStepHTML(step, index) {
        const statusIcon = step.hasCredential ? '⏳' : '❌';
        const statusColor = step.hasCredential ? 'text-yellow-400' : 'text-red-400';
        const statusText = step.hasCredential ? 'Ready to Sign' : 'Missing Credential';
        
        return `
            <div class="batch-signing-step bg-gray-700/30 p-4 rounded border border-gray-600" data-step="${index}">
                <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center space-x-2">
                        <span class="${statusColor} text-lg step-icon">${statusIcon}</span>
                        <span class="font-medium text-gray-300">BatchSigner: ${step.account.substring(0, 12)}...</span>
                    </div>
                    <span class="step-status text-xs px-2 py-1 rounded ${step.hasCredential ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}">
                        ${statusText}
                    </span>
                </div>
                
                ${step.hasCredential ? `
                    <div class="text-xs text-gray-400 mb-2">
                        <div>Full Address: ${step.account}</div>
                        <div>Public Key: ${step.credential.publicKey.substring(0, 20)}...</div>
                        <div>Network: ${step.credential.network}</div>
                    </div>
                    <div class="signing-result hidden">
                        <div class="text-xs text-green-400">✅ BatchSigner Signature: <span class="font-mono signature-value"></span></div>
                    </div>
                ` : `
                    <div class="text-xs text-red-400 mb-2">⚠️ This account's credentials are not available locally</div>
                    <div class="text-xs text-gray-500">The account ${step.account} needs to sign but credentials are not found in localStorage.</div>
                `}
            </div>
        `;
    }

    // Setup BatchSigner workflow events
    setupBatchSignerWorkflowEvents(modal, batchTransaction, credentials, otherAccounts) {
        const closeBtn = modal.querySelector('#closeBatchSignerModal');
        const cancelBtn = modal.querySelector('#cancelBatchSigning');
        const autoSignBtn = modal.querySelector('#autoSignAllBatch');
        const manualSignBtn = modal.querySelector('#manualBatchSigning');

        // Close modal
        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => {
                modal.remove();
            });
        });

        // Auto-sign all BatchSigners
        autoSignBtn?.addEventListener('click', async () => {
            await this.performBatchAutoSigning(modal, batchTransaction, credentials, otherAccounts);
        });

        // Show manual signing guide
        manualSignBtn?.addEventListener('click', () => {
            this.showBatchManualSigningGuide(modal, batchTransaction);
        });
    }

    // Perform automatic BatchSigner signing
    async performBatchAutoSigning(modal, batchTransaction, credentials, otherAccounts) {
        const progressDiv = modal.querySelector('#batchSigningProgress');
        const progressBar = modal.querySelector('#batchProgressBar');
        const progressText = modal.querySelector('#batchProgressText');
        const steps = modal.querySelectorAll('.batch-signing-step');
        
        // Show progress
        progressDiv.classList.remove('hidden');
        
        try {
            console.log('🔑 Starting BatchSigner auto-signing process...');
            
            // IMPORTANT: Keep original JSON format for transaction builder
            const originalRawTransactions = JSON.parse(JSON.stringify(batchTransaction.RawTransactions));
            
            // Prepare inner transactions and compute hashes for BatchSigners
            const innerHashes = [];
            
            // Serialize each inner transaction and compute its hash (for signing only)
            for (const txWrapper of batchTransaction.RawTransactions) {
                const innerTx = txWrapper.RawTransaction;
                console.log('Processing inner transaction:', innerTx);
                
                // Serialize inner transaction to hex blob (for signing)
                const innerHex = this.serializeInnerTx({ ...innerTx });
                
                // Compute hash for BatchSigner signing
                const innerHash = this.computeInnerHash(innerHex);
                innerHashes.push(innerHash);
                
                console.log(`  Serialized to hex: ${innerHex.substring(0, 40)}...`);
                console.log(`  Hash: ${innerHash.substring(0, 40)}...`);
            }

            // Generate BatchSigner signatures
            const batchSigners = [];
            let completedCount = 0;
            
            for (let i = 0; i < otherAccounts.length; i++) {
                const signerAddress = otherAccounts[i];
                const stepElement = steps[i];
                const icon = stepElement.querySelector('.step-icon');
                const status = stepElement.querySelector('.step-status');
                const resultDiv = stepElement.querySelector('.signing-result');
                
                console.log(`🔑 Processing BatchSigner ${i + 1}/${otherAccounts.length}: ${signerAddress}`);
                
                // Update UI to show signing in progress
                icon.textContent = '🔄';
                icon.className = 'text-blue-400 text-lg step-icon';
                status.textContent = 'Signing...';
                status.className = 'step-status text-xs px-2 py-1 rounded bg-blue-900 text-blue-300';
                
                const signerCred = credentials.find(cred => cred.address === signerAddress);
                if (!signerCred || !signerCred.seed) {
                    throw new Error(`Missing or invalid seed for signer ${signerAddress}`);
                }
                const signatureResult = await this.generateBatchSignature(
                    batchTransaction.Flags,
                    batchTransaction.RawTransactions,
                    signerCred.seed // <-- must be a string like "sEd..."
                );


                // VALIDATION: Check if signature was generated successfully
                if (!signatureResult || !signatureResult.TxnSignature) {
                    throw new Error('Failed to generate BatchSigner signature - result is empty');
                }

                console.log(`  Generated signature: ${signatureResult.TxnSignature.substring(0, 20)}...`);
                
                // Add to BatchSigners array
                batchSigners.push({
                    BatchSigner: {
                        Account: signerAddress,
                        SigningPubKey: signerCred.publicKey,
                        TxnSignature: signatureResult.TxnSignature
                    }
                });

                // Update UI to show success
                icon.textContent = '✅';
                icon.className = 'text-green-400 text-lg step-icon';
                status.textContent = 'Signed Successfully';
                status.className = 'step-status text-xs px-2 py-1 rounded bg-green-900 text-green-300';
                
                if (resultDiv) {
                    const signatureSpan = resultDiv.querySelector('.signature-value');
                    if (signatureSpan) {
                        signatureSpan.textContent = signatureResult.TxnSignature.substring(0, 20) + '...';
                    }
                    resultDiv.classList.remove('hidden');
                }

                completedCount++;
                console.log(`✅ Generated BatchSigner signature for ${signerAddress}`);
                
            }

            // CRITICAL: Restore original JSON format for transaction builder
            batchTransaction.RawTransactions = originalRawTransactions;

            // Add BatchSigners to transaction
            if (batchSigners.length > 0) {
                batchTransaction.BatchSigners = batchSigners;
                console.log(`✅ Added ${batchSigners.length} BatchSigners to transaction`);
            }

            // Remove signing context
            delete batchTransaction._signingContext;

            console.log('📋 Final transaction with JSON format preserved:', batchTransaction);

            // Complete the workflow
            setTimeout(() => {
                modal.remove();
                this.completeBatchSigningWorkflow(batchTransaction, completedCount, otherAccounts.length);
            }, 1000);

        } catch (error) {
            console.error('❌ BatchSigner auto-signing failed:', error);
            alert(`❌ BatchSigner signing failed: ${error.message}\n\nYou may need to complete signatures manually.`);
        }
    }

    // Complete the BatchSigner workflow
    completeBatchSigningWorkflow(batchTransaction, successCount, totalCount) {
        // Populate transaction builder
        if (window.templateLibrary && window.templateLibrary.populateTransactionBuilder) {
            window.templateLibrary.populateTransactionBuilder(batchTransaction, 'Batch Transaction (BatchSigned)');
        }

        // Show completion message
        if (successCount === totalCount) {
            alert(`✅ BatchSigner workflow completed successfully!\n\n🔐 Signed: ${successCount}/${totalCount} BatchSigners\n📋 Transaction ready for submission\n\nAll required BatchSigner signatures have been generated according to XLS-0056 specification.`);
        } else {
            alert(`⚠️ BatchSigner workflow completed with warnings!\n\n🔐 Signed: ${successCount}/${totalCount} BatchSigners\n📋 Transaction populated but may need manual completion\n\nSome BatchSigner signatures could not be generated automatically.`);
        }

   
    }
    
    // Get flag name for display
    getFlagName(flag) {
        const flagNames = {
            65536: 'All Or Nothing',
            131072: 'Only One',
            262144: 'Until Failure', 
            524288: 'Independent'
        };
        return flagNames[flag] || `Unknown (${flag})`;
    }

    // XLS-0056 signing helper methods:

    // Helper to serialize inner tx to hex blob
    serializeInnerTx(innerJson) {
        // Enforce inner tx requirements
        innerJson.Fee = "0";
        innerJson.SigningPubKey = "";
        delete innerJson.TxnSignature;
        innerJson.Flags = (innerJson.Flags || 0) | 1073741824; // tfInnerBatchTxn

        return xrpl.encode(innerJson);
    }

    // Compute signing hash for inner tx (SHA512Half)
    computeInnerHash(innerHex) {
        return xrpl.hashes.hashSignedTx(innerHex);
    }

    bytesToHex(bytes) {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    }

    computeBatchSigningDataBytes(flags, innerHashes) {
    // Prefix: 'BMT\0'
    const prefix = new Uint8Array([0x42, 0x4D, 0x54, 0x00]);
    // Flags: UInt32, big-endian
    const flagsBytes = new Uint8Array(4);
    new DataView(flagsBytes.buffer).setUint32(0, flags, false); // false = big-endian

    // Inner hashes: each is a 32-byte Uint8Array
    const hashesBytes = new Uint8Array(innerHashes.length * 32);
    innerHashes.forEach((hashHex, i) => {
        const hashBytes = this.hexToBytes(hashHex);
        hashesBytes.set(hashBytes, i * 32);
    });

    // Concatenate all
    const total = new Uint8Array(prefix.length + flagsBytes.length + hashesBytes.length);
    total.set(prefix, 0);
    total.set(flagsBytes, prefix.length);
    total.set(hashesBytes, prefix.length + flagsBytes.length);
    return total;
}

   async generateBatchSignature(flags, rawTransactions, seed) {
        try {
            // Create Ed25519 wallet from seed
            const wallet = xrpl.Wallet.fromSeed(seed, { algorithm: 'ed25519' });
            if (!wallet.privateKey.startsWith('ED')) {
                throw new Error('Wallet private key is not Ed25519 format');
            }

            // Compute SHA512Half for each canonical-encoded transaction
            async function sha512Half(data) {
                const hash = await window.crypto.subtle.digest('SHA-512', data);
                return new Uint8Array(hash).slice(0, 32);
            }

            // Compute signing data: BMT\0 + Flags (UInt32BE) + [hashes]
            const prefix = new Uint8Array([0x42, 0x4D, 0x54, 0x00]); // 'BMT\0'
            const flagsBuffer = new Uint8Array(4);
            new DataView(flagsBuffer.buffer).setUint32(0, flags, false); // Big-endian

            const txHashes = [];
            for (const tx of rawTransactions) {
                const canonicalTx = xrpl.encode(tx.RawTransaction);
                const txBytes = this.hexToBytes(canonicalTx);
                txHashes.push(await sha512Half(txBytes));
            }

            const totalLength = prefix.length + flagsBuffer.length + txHashes.length * 32;
            const signingData = new Uint8Array(totalLength);
            let offset = 0;
            signingData.set(prefix, offset);
            offset += prefix.length;
            signingData.set(flagsBuffer, offset);
            offset += flagsBuffer.length;
            for (const hash of txHashes) {
                signingData.set(hash, offset);
                offset += hash.length;
            }

            // Hash the signing data
            const message = await sha512Half(signingData);

            // Sign with tweetnacl
            if (!window.nacl) throw new Error('tweetnacl not available');
            const privKeyHex = wallet.privateKey.slice(2); // Remove 'ED'
            const privKeyBytes = this.hexToBytes(privKeyHex);
            if (privKeyBytes.length !== 32) {
                throw new Error('Invalid Ed25519 private key length');
            }
            const keyPair = window.nacl.sign.keyPair.fromSeed(privKeyBytes);
            const signature = window.nacl.sign.detached(message, keyPair.secretKey);

            // Return BatchSigner object (SigningPubKey as hex, not ED-prefixed)
            return {
                Account: wallet.classicAddress,
                SigningPubKey: Array.from(keyPair.publicKey).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase(),
                TxnSignature: Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
            };
        } catch (error) {
            console.error('🚨 generateBatchSignature failed:', error);
            throw new Error(`BatchSigner signing failed: ${error.message}`);
        }
    }

    // Helper: Hex to bytes
    hexToBytes(hex) {
        hex = hex.replace(/^0x/, '').replace(/[^A-Fa-f0-9]/g, '');
        if (hex.length % 2 !== 0) hex = '0' + hex;
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
    }

}


// Create global instance
window.batchTransactionManager = new BatchTransactionManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Batch Transaction Manager ready');
});