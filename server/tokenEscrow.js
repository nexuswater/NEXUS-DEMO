// Token Escrow Transaction Manager for XRPL/Xahau Devnet Portal
// Handles IOU/MPT token escrows per XLS-85d

class TokenEscrowManager {
    constructor() {
        console.log('✅ Token Escrow Manager initialized');
    }

    // Show Token Escrow transaction selector modal
    showTokenEscrowTransactionSelector() {
        if (!this.checkNetworkConnection()) return;
        const modal = this.createTokenEscrowSelectorModal();
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    checkNetworkConnection() {
        return window.checkNetworkConnection ? window.checkNetworkConnection() : false;
    }

    getCurrentNetwork() {
        if (window.devnetManager && typeof window.devnetManager.currentNetwork === 'function') {
            return window.devnetManager.currentNetwork();
        }
        return null;
    }

    // --- SELECTOR MODAL ---
    createTokenEscrowSelectorModal() {
        const modal = document.createElement('div');
        modal.id = 'tokenEscrowSelectorModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        modal.innerHTML = `
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-teal-400">🔒 XLS-0085 Token Escrow</h3>
                    <button id="closeTokenEscrowSelector" class="text-gray-400 hover:text-white text-xl">&times;</button>
                </div>
                <div class="bg-blue-900/30 p-4 rounded-lg mb-6">
                    <h4 class="text-lg font-bold text-blue-400 mb-2">💡 What are Token Escrows?</h4>
                    <div class="text-sm text-gray-300 space-y-2">
                        <p>Token escrows lock IOUs or MPTs on the ledger until specific conditions are met, supporting:</p>
                        <ul class="list-disc pl-5">
                            <li>Trustline-based tokens (IOUs)</li>
                            <li>Multi-Purpose Tokens (MPTs)</li>
                        </ul>
                        <div class="bg-gray-700/50 p-3 rounded mt-3 text-xs text-gray-400">
                            <div><strong>✅ XLS-85d:</strong> Token escrows require <span class="text-orange-300">CancelAfter</span> and support issuer controls.</div>
                            <div><strong>⚠️ Only IOUs/MPTs:</strong> XRP escrows are handled separately.</div>
                        </div>
                    </div>
                </div>
                <div class="mb-6">
                    <p class="text-gray-300 mb-4">Choose the token escrow operation you want to perform:</p>
                </div>
                <div class="grid grid-cols-1 gap-4">
                    <button id="tokenEscrowCreate" class="text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition duration-300">
                        <div class="flex items-start space-x-4">
                            <span class="text-3xl">🆕</span>
                            <div class="flex-1">
                                <h4 class="text-lg font-bold text-teal-400">Create Token Escrow</h4>
                                <p class="text-sm text-gray-300 mb-2">Lock IOUs or MPTs with time, conditions, or both</p>
                                <div class="text-xs text-gray-400">
                                    <span class="bg-blue-900/50 px-2 py-1 rounded mr-2">EscrowCreate</span>
                                    IOU/MPT only (not XRP)
                                </div>
                            </div>
                        </div>
                    </button>
                    <button id="tokenEscrowFinish" class="text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition duration-300">
                        <div class="flex items-start space-x-4">
                            <span class="text-3xl">✅</span>
                            <div class="flex-1">
                                <h4 class="text-lg font-bold text-teal-400">Finish Token Escrow</h4>
                                <p class="text-sm text-gray-300 mb-2">Release escrowed tokens to destination</p>
                                <div class="text-xs text-gray-400">
                                    <span class="bg-green-900/50 px-2 py-1 rounded mr-2">EscrowFinish</span>
                                    Complete token escrow when conditions are met
                                </div>
                            </div>
                        </div>
                    </button>
                    <button id="tokenEscrowCancel" class="text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition duration-300">
                        <div class="flex items-start space-x-4">
                            <span class="text-3xl">❌</span>
                            <div class="flex-1">
                                <h4 class="text-lg font-bold text-teal-400">Cancel Token Escrow</h4>
                                <p class="text-sm text-gray-300 mb-2">Return escrowed tokens to sender after expiration</p>
                                <div class="text-xs text-gray-400">
                                    <span class="bg-red-900/50 px-2 py-1 rounded mr-2">EscrowCancel</span>
                                    Only works on expired token escrows
                                </div>
                            </div>
                        </div>
                    </button>
                    <button id="tokenEscrowLookup" class="text-left p-4 bg-gray-700 hover:bg-gray-600 rounded-lg border border-gray-600 transition duration-300">
                        <div class="flex items-start space-x-4">
                            <span class="text-3xl">🔍</span>
                            <div class="flex-1">
                                <h4 class="text-lg font-bold text-teal-400">Lookup Token Escrows</h4>
                                <p class="text-sm text-gray-300 mb-2">Find existing token escrows by account</p>
                                <div class="text-xs text-gray-400">
                                    <span class="bg-purple-900/50 px-2 py-1 rounded mr-2">account_objects</span>
                                    View all pending token escrows for an account
                                </div>
                            </div>
                        </div>
                    </button>
                </div>
                <div class="mt-6 text-center">
                    <button id="cancelTokenEscrowSelector" class="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition duration-300">Cancel</button>
                </div>
            </div>
        `;
        this.setupTokenEscrowSelectorEvents(modal);
        return modal;
    }

    setupTokenEscrowSelectorEvents(modal) {
        const closeBtn = modal.querySelector('#closeTokenEscrowSelector');
        const cancelBtn = modal.querySelector('#cancelTokenEscrowSelector');
        const createBtn = modal.querySelector('#tokenEscrowCreate');
        const finishBtn = modal.querySelector('#tokenEscrowFinish');
        const cancelEscrowBtn = modal.querySelector('#tokenEscrowCancel');
        const lookupBtn = modal.querySelector('#tokenEscrowLookup');

        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => modal.remove());
        });

        createBtn?.addEventListener('click', () => {
            modal.remove();
            this.showTokenEscrowCreateModal();
        });
        finishBtn?.addEventListener('click', () => {
            modal.remove();
            this.showTokenEscrowFinishModal();
        });
        cancelEscrowBtn?.addEventListener('click', () => {
            modal.remove();
            this.showTokenEscrowCancelModal();
        });
        lookupBtn?.addEventListener('click', () => {
            modal.remove();
            this.showTokenEscrowLookupModal();
        });
    }

    // --- Placeholders for modals ---
    showTokenEscrowCreateModal() {
        const modal = this.createTokenEscrowCreateModal();
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    createTokenEscrowCreateModal() {
        const modal = document.createElement('div');
        modal.id = 'tokenEscrowCreateModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
    <div class="bg-gray-800 rounded-lg p-8 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col gap-6">
        <div class="flex justify-between items-center mb-2">
            <h3 class="text-2xl font-bold text-teal-400">🆕 Create Token Escrow</h3>
            <button id="closeTokenEscrowCreateModal" class="text-gray-400 hover:text-white text-2xl">&times;</button>
        </div>
        <div class="mb-2">
            <h4 class="text-lg font-bold text-teal-400 mb-2">💡 Token Escrow (XLS-85d)</h4>
            <div class="bg-blue-900/30 p-4 rounded-lg text-xs text-gray-300">
                <ul class="list-disc pl-5 space-y-1">
                    <li>
                        <strong>IOU Escrow:</strong> Lock trustline-based tokens (requires trustline, issuer controls apply)
                    </li>
                    <li>
                        <strong>MPT Escrow:</strong> Lock Multi-Purpose Tokens (issuer controls and transfer flags apply)
                    </li>
                </ul>
                <div class="mt-2 text-yellow-200">
                    <strong>Note:</strong> <span class="text-orange-300">Cancel After</span> is always required for token escrows.
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Left: Basic Fields -->
            <div class="space-y-5">
                <div class="bg-blue-900/30 p-4 rounded-lg">
                    <h4 class="text-sm font-bold text-blue-400 mb-1">📋 Escrow Details</h4>
                    <p class="text-xs text-gray-300">Configure the properties of your token escrow</p>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300 mb-1">Sender Account:</label>
                    <select id="tokenEscrowSenderAccount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                        <option value="">Choose sender account...</option>
                    </select>
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300 mb-1">Destination Account:</label>
                    <select id="tokenEscrowDestinationAccount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                        <option value="">Choose destination account...</option>
                    </select>
                    <div class="flex justify-between mt-1 gap-2">
                        <button type="button" id="useSelfTokenEscrow" class="text-xs text-teal-400 hover:text-teal-300">
                            📋 Use sender (self-escrow)
                        </button>
                        <button type="button" id="useCustomTokenDestination" class="text-xs text-purple-400 hover:text-purple-300">
                            ✏️ Enter custom address
                        </button>
                    </div>
                    <input type="text" id="tokenEscrowCustomDestination" placeholder="rAccount... (custom destination)" 
                           class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mt-2 hidden">
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300 mb-1">Token (Currency):</label>
                    <input type="text" id="tokenEscrowCurrency" maxlength="40" placeholder="e.g. XRM or 0158415500000000C1F76FF6ECB0CCCD00000000" 
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300 mb-1">Issuer:</label>
                    <select id="tokenEscrowIssuerSelect" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                        <option value="">Choose issuer...</option>
                    </select>
                    <button type="button" id="useCustomTokenIssuer" class="text-xs text-purple-400 hover:text-purple-300 mt-1">
                        ✏️ Enter custom issuer
                    </button>
                    <input type="text" id="tokenEscrowIssuer" maxlength="35" placeholder="rIssuer..." 
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mt-2 hidden">
                </div>
                <div class="space-y-2">
                    <label class="block text-sm font-medium text-gray-300 mb-1">Amount (Token):</label>
                    <input type="number" id="tokenEscrowAmount" min="0.000001" step="0.000001" placeholder="100.0" 
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                </div>
            </div>
            <!-- Right: Time & Condition -->
            <div class="space-y-5">
                <div id="tokenTimeFieldsSection" class="space-y-4">
                    <h4 class="text-lg font-bold text-teal-400 mb-2">⏰ Time Settings</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Finish After:</label>
                            <div class="grid grid-cols-2 gap-2">
                                <input type="number" id="tokenFinishAfterSeconds" placeholder="300" 
                                    class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                                <select id="tokenFinishAfterUnit" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                                    <option value="60">Minutes</option>
                                    <option value="3600">Hours</option>
                                    <option value="86400">Days</option>
                                    <option value="1">Seconds</option>
                                </select>
                            </div>
                            <p class="text-xs text-gray-400 mt-1">Earliest time escrow can be finished</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Cancel After: <span class="text-orange-300">*</span></label>
                            <div class="grid grid-cols-2 gap-2">
                                <input type="number" id="tokenCancelAfterSeconds" placeholder="3600" 
                                    class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                                <select id="tokenCancelAfterUnit" class="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                                    <option value="3600">Hours</option>
                                    <option value="86400">Days</option>
                                    <option value="604800">Weeks</option>
                                    <option value="60">Minutes</option>
                                    <option value="1">Seconds</option>
                                </select>
                            </div>
                            <p class="text-xs text-orange-300 mt-1">Required. When escrow expires and can be cancelled</p>
                        </div>
                        <div class="bg-yellow-900/30 p-2 rounded">
                            <p class="text-xs text-yellow-200">
                                <strong>Tip:</strong> Cancel time should be after finish time. 
                                Current: <span id="currentTokenRippleTime">${Math.floor(Date.now() / 1000) - 946684800}</span>
                            </p>
                        </div>
                    </div>
                </div>
                <div id="tokenConditionFieldsSection" class="space-y-4">
                    <h4 class="text-lg font-bold text-teal-400 mb-2">🔐 Crypto-Condition (optional)</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-1">Condition:</label>
                            <textarea id="tokenEscrowCondition" rows="2" placeholder="A0258020..." 
                                class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-xs font-mono"></textarea>
                            <p class="text-xs text-gray-400 mt-1">PREIMAGE-SHA-256 condition (hex)</p>
                        </div>
                        <div class="flex space-x-2">
                            <button type="button" id="generateTokenCondition" class="bg-blue-800 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs">
                                🎲 Generate Random
                            </button>
                            <button type="button" id="useCustomTokenCondition" class="bg-purple-800 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs">
                                ✏️ Enter Custom
                            </button>
                        </div>
                        <div id="tokenFulfillmentDisplay" class="hidden bg-red-900/30 p-2 rounded">
                            <h5 class="font-bold text-red-400 text-xs mb-1">🔑 Keep This Secret!</h5>
                            <label class="block text-xs font-medium text-gray-300 mb-1">Fulfillment:</label>
                            <textarea id="tokenEscrowFulfillment" rows="2" readonly 
                                class="w-full bg-gray-800 border border-gray-600 rounded px-2 py-1 text-white text-xs font-mono"></textarea>
                            <p class="text-xs text-gray-400 mt-1">
                                <strong>⚠️ SAVE THIS!</strong> You need it to finish the escrow.
                            </p>
                        </div>
                        <div class="bg-blue-900/30 p-2 rounded">
                            <p class="text-xs text-blue-200">
                                <strong>Note:</strong> Anyone with the fulfillment can finish the escrow 
                                (if time conditions are met). Enables trustless atomic swaps.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Transaction Preview -->
        <div id="tokenEscrowCreatePreview" class="hidden mt-4 p-4 bg-gray-700/50 rounded border">
            <h4 class="text-sm font-bold text-teal-400 mb-2">📋 Transaction Preview:</h4>
            <div class="text-xs space-y-1" id="tokenEscrowCreatePreviewContent"></div>
        </div>
        <div class="flex flex-col md:flex-row gap-3 mt-4">
            <button id="previewTokenEscrowCreate" class="flex-1 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300 text-sm">🔍 Preview</button>
            <button id="buildTokenEscrowCreate" class="flex-1 bg-teal-800 hover:bg-teal-700 text-white px-4 py-2 rounded transition duration-300 opacity-50 cursor-not-allowed text-sm" disabled>⚙️ Build</button>
            <button id="cancelTokenEscrowCreate" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition duration-300 text-sm">Cancel</button>
        </div>
    </div>
    `;

        this.populateTokenAccountDropdowns(modal);
        this.populateTokenIssuerDropdown(modal);
        this.setupTokenEscrowCreateEvents(modal);
        return modal;
    }

    setupTokenEscrowCreateEvents(modal) {
        const closeBtn = modal.querySelector('#closeTokenEscrowCreateModal');
        const cancelBtn = modal.querySelector('#cancelTokenEscrowCreate');
        const previewBtn = modal.querySelector('#previewTokenEscrowCreate');
        const buildBtn = modal.querySelector('#buildTokenEscrowCreate');
        const selfEscrowBtn = modal.querySelector('#useSelfTokenEscrow');
        const customDestBtn = modal.querySelector('#useCustomTokenDestination');
        const destinationSelect = modal.querySelector('#tokenEscrowDestinationAccount');
        const customDestInput = modal.querySelector('#tokenEscrowCustomDestination');
        const senderSelect = modal.querySelector('#tokenEscrowSenderAccount');

        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => modal.remove());
        });

        selfEscrowBtn?.addEventListener('click', () => {
            if (senderSelect.value) {
                destinationSelect.value = senderSelect.value;
                customDestInput.classList.add('hidden');
                destinationSelect.classList.remove('hidden');
            } else {
                alert('Please select a sender account first.');
            }
        });

        customDestBtn?.addEventListener('click', () => {
            destinationSelect.classList.add('hidden');
            customDestInput.classList.remove('hidden');
            customDestInput.focus();
            destinationSelect.value = '';
        });

        destinationSelect?.addEventListener('change', () => {
            if (destinationSelect.value) {
                customDestInput.classList.add('hidden');
                customDestInput.value = '';
            }
        });

        // Condition generation
        const generateBtn = modal.querySelector('#generateTokenCondition');
        const customBtn = modal.querySelector('#useCustomTokenCondition');
        generateBtn?.addEventListener('click', () => {
            this.generateRandomTokenCondition(modal);
        });
        customBtn?.addEventListener('click', () => {
            const conditionField = modal.querySelector('#tokenEscrowCondition');
            conditionField.focus();
            conditionField.placeholder = 'Enter your PREIMAGE-SHA-256 condition here...';
        });

        // Preview/build
        previewBtn?.addEventListener('click', () => {
            this.previewTokenEscrowCreate(modal);
        });
        buildBtn?.addEventListener('click', () => {
            this.buildTokenEscrowCreateTransaction(modal);
        });

        // Update current time every second
        setInterval(() => {
            const timeElement = modal.querySelector('#currentTokenRippleTime');
            if (timeElement) {
                timeElement.textContent = Math.floor(Date.now() / 1000) - 946684800;
            }
        }, 1000);
    }

    showTokenEscrowFinishModal() {
        const modal = this.createTokenEscrowFinishModal();
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
    }

    createTokenEscrowFinishModal() {
        const modal = document.createElement('div');
        modal.id = 'tokenEscrowFinishModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-teal-400">✅ Finish Token Escrow</h3>
                <button id="closeTokenEscrowFinishModal" class="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>
            <div class="bg-green-900/30 p-3 rounded-lg mb-4">
                <h4 class="text-sm font-bold text-green-400 mb-1">💡 Finishing Token Escrows</h4>
                <p class="text-xs text-gray-300">
                    Complete a token escrow to release IOUs or MPTs to the destination. Time and/or crypto-conditions must be satisfied.
                </p>
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <!-- Left: Escrow Identification -->
                <div class="space-y-3">
                    <div class="bg-blue-900/30 p-3 rounded-lg">
                        <h4 class="text-sm font-bold text-blue-400 mb-1">🎯 Escrow Identification</h4>
                        <p class="text-xs text-gray-300">Identify the token escrow you want to finish</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Finisher Account:</label>
                        <select id="tokenFinishAccount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                            <option value="">Choose account to finish escrow...</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Escrow Owner:</label>
                        <select id="tokenEscrowOwner" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                            <option value="">Choose escrow owner...</option>
                        </select>
                        <div class="flex justify-between mt-1">
                            <button type="button" id="useTokenSameAsFinisher" class="text-xs text-teal-400 hover:text-teal-300">
                                📋 Use finisher account
                            </button>
                            <button type="button" id="useTokenCustomOwner" class="text-xs text-purple-400 hover:text-purple-300">
                                ✏️ Enter custom address
                            </button>
                        </div>
                        <input type="text" id="tokenCustomOwner" placeholder="rAccount... (custom owner)" 
                               class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mt-2 hidden">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Offer Sequence:</label>
                        <input type="number" id="tokenOfferSequence" min="1" placeholder="12345" 
                               class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                    </div>
                    <div class="flex space-x-2">
                        <button type="button" id="lookupTokenEscrows" class="bg-purple-800 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs">
                            🔍 Find Token Escrows
                        </button>
                        <button type="button" id="clearTokenEscrowLookup" class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">
                            🧹 Clear
                        </button>
                    </div>
                    <div id="tokenEscrowLookupResults" class="hidden bg-gray-700/50 p-3 rounded border max-h-40 overflow-y-auto">
                        <h5 class="text-sm font-bold text-teal-400 mb-2">📋 Found Token Escrows:</h5>
                        <div id="tokenEscrowList" class="space-y-2"></div>
                    </div>
                </div>
                <!-- Right: Fulfillment & Preview -->
                <div class="space-y-3">
                    <div class="bg-yellow-900/30 p-3 rounded-lg">
                        <h4 class="text-sm font-bold text-yellow-400 mb-1">🔐 Fulfillment (if needed)</h4>
                        <p class="text-xs text-gray-300">Only required for conditional token escrows</p>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-300 mb-1">Fulfillment (optional):</label>
                        <textarea id="tokenEscrowFulfillment" rows="3" placeholder="A0228020... (hex fulfillment for conditional escrows)" 
                                  class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-xs font-mono"></textarea>
                    </div>
                    <div class="bg-blue-900/30 p-2 rounded">
                        <p class="text-xs text-blue-200">
                            <strong>Current Ripple Time:</strong> <span id="currentTokenFinishTime">${Math.floor(Date.now() / 1000) - 946684800}</span>
                            <br><strong>Local Time:</strong> <span id="currentTokenFinishLocalTime">${new Date().toLocaleString()}</span>
                        </p>
                    </div>
                </div>
            </div>
            <div id="tokenEscrowFinishPreview" class="hidden mt-4 p-3 bg-gray-700/50 rounded border">
                <h4 class="text-sm font-bold text-teal-400 mb-2">📋 Transaction Preview:</h4>
                <div class="text-xs space-y-1" id="tokenEscrowFinishPreviewContent"></div>
            </div>
            <div class="flex space-x-2 mt-4">
                <button id="previewTokenEscrowFinish" class="flex-1 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300 text-sm">🔍 Preview</button>
                <button id="buildTokenEscrowFinish" class="flex-1 bg-teal-800 hover:bg-teal-700 text-white px-4 py-2 rounded transition duration-300 opacity-50 cursor-not-allowed text-sm" disabled>⚙️ Build</button>
                <button id="cancelTokenEscrowFinish" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition duration-300 text-sm">Cancel</button>
            </div>
        </div>
    `;
        this.populateTokenFinishAccountDropdowns(modal);
        this.setupTokenEscrowFinishEvents(modal);
        return modal;
    }

    populateTokenAccountDropdowns(modal) {
        const network = this.getCurrentNetwork();
        if (!network) return;
        const storageKey = `${network.toLowerCase()}_credentials`;
        const stored = localStorage.getItem(storageKey);
        const credentials = stored ? JSON.parse(stored) : [];
        const senderSelect = modal.querySelector('#tokenEscrowSenderAccount');
        const destinationSelect = modal.querySelector('#tokenEscrowDestinationAccount');
        [senderSelect, destinationSelect].forEach(select => {
            if (select) select.innerHTML = '<option value="">Choose account...</option>';
        });
        credentials.forEach(cred => {
            const option1 = document.createElement('option');
            option1.value = cred.address;
            option1.textContent = `${cred.address.substring(0, 20)}... (${cred.balance})`;
            senderSelect?.appendChild(option1);
            const option2 = document.createElement('option');
            option2.value = cred.address;
            option2.textContent = `${cred.address.substring(0, 20)}... (${cred.balance})`;
            destinationSelect?.appendChild(option2);
        });
    }

    populateTokenIssuerDropdown(modal) {
        const network = this.getCurrentNetwork();
        if (!network) return;
        const storageKey = `${network.toLowerCase()}_credentials`;
        const stored = localStorage.getItem(storageKey);
        const credentials = stored ? JSON.parse(stored) : [];
        const issuerSelect = modal.querySelector('#tokenEscrowIssuerSelect');
        const customIssuerBtn = modal.querySelector('#useCustomTokenIssuer');
        const issuerInput = modal.querySelector('#tokenEscrowIssuer');

        issuerSelect.innerHTML = '<option value="">Choose issuer...</option>';
        credentials.forEach(cred => {
            const option = document.createElement('option');
            option.value = cred.address;
            option.textContent = `${cred.address.substring(0, 20)}...`;
            issuerSelect.appendChild(option);
        });

        issuerSelect?.addEventListener('change', () => {
            if (issuerSelect.value) {
                issuerInput.classList.add('hidden');
                issuerInput.value = '';
            }
        });

        customIssuerBtn?.addEventListener('click', () => {
            issuerSelect.classList.add('hidden');
            issuerInput.classList.remove('hidden');
            issuerInput.focus();
            issuerSelect.value = '';
        });
    }

    generateRandomTokenCondition(modal) {
        const preimage = new Uint8Array(32);
        crypto.getRandomValues(preimage);
        const preimageHex = Array.from(preimage).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
        crypto.subtle.digest('SHA-256', preimage).then(hashBuffer => {
            const hashArray = new Uint8Array(hashBuffer);
            const hashHex = Array.from(hashArray).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
            const condition = `A0258020${hashHex}810120`;
            const fulfillment = `A0228020${preimageHex}`;
            modal.querySelector('#tokenEscrowCondition').value = condition;
            modal.querySelector('#tokenEscrowFulfillment').value = fulfillment;
            modal.querySelector('#tokenFulfillmentDisplay').classList.remove('hidden');
        });
    }

    gatherTokenEscrowCreateData(modal) {
        const sender = modal.querySelector('#tokenEscrowSenderAccount').value;
        const destinationSelect = modal.querySelector('#tokenEscrowDestinationAccount');
        const customDestInput = modal.querySelector('#tokenEscrowCustomDestination');
        const destination = destinationSelect.value || customDestInput.value.trim();
        const currency = modal.querySelector('#tokenEscrowCurrency').value.trim();
        const issuer = modal.querySelector('#tokenEscrowIssuerSelect').value || modal.querySelector('#tokenEscrowIssuer').value.trim();
        const value = modal.querySelector('#tokenEscrowAmount').value.trim();

        // Time fields
        const finishAfterSeconds = modal.querySelector('#tokenFinishAfterSeconds').value;
        const finishAfterUnit = parseInt(modal.querySelector('#tokenFinishAfterUnit').value);
        const cancelAfterSeconds = modal.querySelector('#tokenCancelAfterSeconds').value;
        const cancelAfterUnit = parseInt(modal.querySelector('#tokenCancelAfterUnit').value);

        // Condition field
        const condition = modal.querySelector('#tokenEscrowCondition').value.trim();

        // Validation
        if (!sender) return { isValid: false, error: 'Please select a sender account.' };
        if (!destination) return { isValid: false, error: 'Please select or enter a destination account.' };
        if (!currency) return { isValid: false, error: 'Please enter a token currency.' };
        if (!issuer) return { isValid: false, error: 'Please select or enter an issuer.' };
        if (!value || isNaN(value) || parseFloat(value) <= 0) return { isValid: false, error: 'Please enter a valid token amount.' };

        let finishAfter = null;
        let cancelAfter = null;

        if (finishAfterSeconds) {
            finishAfter = Math.floor(Date.now() / 1000) - 946684800 + (parseInt(finishAfterSeconds) * finishAfterUnit);
        }
        if (cancelAfterSeconds) {
            cancelAfter = Math.floor(Date.now() / 1000) - 946684800 + (parseInt(cancelAfterSeconds) * cancelAfterUnit);
        }

        // Always require CancelAfter for token escrows
        if (!cancelAfter) return { isValid: false, error: 'All token escrows must have a CancelAfter time.' };
        if (finishAfter && cancelAfter <= finishAfter) return { isValid: false, error: 'Cancel time must be after finish time.' };

        // If condition is provided, validate it
        if (condition && !/^A0258020[A-F0-9]{64}810120$/.test(condition)) {
            return { isValid: false, error: 'Invalid condition format. Should be PREIMAGE-SHA-256 format.' };
        }

        return {
            isValid: true,
            sender,
            destination,
            amount: {
                currency,
                issuer,
                value
            },
            finishAfter,
            cancelAfter,
            condition: condition || null
        };
    }

    previewTokenEscrowCreate(modal) {
        const data = this.gatherTokenEscrowCreateData(modal);
        if (!data.isValid) {
            alert(data.error);
            return;
        }

        const preview = modal.querySelector('#tokenEscrowCreatePreview');
        const content = modal.querySelector('#tokenEscrowCreatePreviewContent');
        const buildBtn = modal.querySelector('#buildTokenEscrowCreate');

        if (preview && content) {
            preview.classList.remove('hidden');

            let previewHtml = `
                <div><span class="text-gray-400">Sender:</span> <span class="text-white">${data.sender}</span></div>
                <div><span class="text-gray-400">Destination:</span> <span class="text-white">${data.destination}</span></div>
                <div><span class="text-gray-400">Amount:</span> <span class="text-white">${data.amount.value} ${data.amount.currency}</span></div>
                <div><span class="text-gray-400">Issuer:</span> <span class="text-white">${data.amount.issuer}</span></div>
                <div><span class="text-gray-400">Network:</span> <span class="text-white">${this.getCurrentNetwork().toUpperCase()}</span></div>
            `;

            if (data.finishAfter) {
                const finishDate = new Date((data.finishAfter + 946684800) * 1000);
                previewHtml += `<div><span class="text-gray-400">Finish After:</span> <span class="text-white">${data.finishAfter} (${finishDate.toLocaleString()})</span></div>`;
            }

            if (data.cancelAfter) {
                const cancelDate = new Date((data.cancelAfter + 946684800) * 1000);
                previewHtml += `<div><span class="text-gray-400">Cancel After:</span> <span class="text-white">${data.cancelAfter} (${cancelDate.toLocaleString()})</span></div>`;
            }

            if (data.condition) {
                previewHtml += `<div><span class="text-gray-400">Condition:</span> <span class="text-white font-mono text-xs">${data.condition.substring(0, 40)}...</span></div>`;
            }

            // Show estimated fee (token escrows may have higher fees)
            previewHtml += `<div><span class="text-gray-400">Estimated Fee:</span> <span class="text-white">Check network settings</span></div>`;

            content.innerHTML = previewHtml;

            // Enable build button
            buildBtn?.classList.remove('opacity-50', 'cursor-not-allowed');
            buildBtn.disabled = false;
        }
    }

    buildTokenEscrowCreateTransaction(modal) {
        const data = this.gatherTokenEscrowCreateData(modal);
        if (!data.isValid) {
            alert(data.error);
            return;
        }

        // Build transaction object for token escrow
        const transaction = {
            TransactionType: 'EscrowCreate',
            Account: data.sender,
            Destination: data.destination,
            Amount: {
                currency: data.amount.currency,
                issuer: data.amount.issuer,
                value: data.amount.value
            }
        };

        if (data.finishAfter) transaction.FinishAfter = data.finishAfter;
        if (data.cancelAfter) transaction.CancelAfter = data.cancelAfter;
        if (data.condition) transaction.Condition = data.condition;

        // Store escrow data in local memory for later reference
        const escrowData = {
            id: this.generateTokenEscrowId(),
            timestamp: Date.now(),
            type: 'token',
            sender: data.sender,
            destination: data.destination,
            amount: data.amount,
            finishAfter: data.finishAfter,
            cancelAfter: data.cancelAfter,
            condition: data.condition,
            fulfillment: data.condition ? modal.querySelector('#tokenEscrowFulfillment').value : null,
            network: this.getCurrentNetwork(),
            status: 'created',
            transactionHash: null,
            sequence: null,
            ledgerIndex: null
        };

        this.storeTokenEscrowData(escrowData);

        // Populate transaction builder
        if (window.templateLibrary) {
            window.templateLibrary.populateTransactionBuilder(transaction, 'EscrowCreate');
        }

        // Close modal
        modal.remove();

        // Show summary
        let summary = `✅ Token EscrowCreate transaction populated!\n\n`;
        summary += `Escrow ID: ${escrowData.id}\n`;
        summary += `Sender: ${data.sender}\n`;
        summary += `Destination: ${data.destination}\n`;
        summary += `Amount: ${data.amount.value} ${data.amount.currency}\n`;
        summary += `Issuer: ${data.amount.issuer}\n`;

        if (data.finishAfter) {
            const finishDate = new Date((data.finishAfter + 946684800) * 1000);
            summary += `Finish After: ${finishDate.toLocaleString()}\n`;
        }
        if (data.cancelAfter) {
            const cancelDate = new Date((data.cancelAfter + 946684800) * 1000);
            summary += `Cancel After: ${cancelDate.toLocaleString()}\n`;
        }
        if (data.condition) {
            summary += `\n⚠️ IMPORTANT: Fulfillment saved to local storage!\n`;
            summary += `Escrow stored with ID: ${escrowData.id}\n`;
        }
        summary += `\n📋 Escrow data saved to local storage for easy reference.`;
        summary += `\nTransaction is ready in the builder below. Click "Submit Transaction" to create the escrow.`;

        alert(summary);
    }

    updateTokenEscrowAfterCreate({ sender, destination, amount, condition, finishAfter, cancelAfter, sequence, transactionHash, ledgerIndex }, txResult) {
        const network = this.getCurrentNetwork();
        const storageKey = `${network.toLowerCase()}_token_escrows`;
        const escrows = this.getStoredTokenEscrows();

        // Normalize null/undefined for matching
        const normalize = v => v === undefined ? null : v;

        const escrow = escrows.find(e =>
            e.sender === sender &&
            e.destination === destination &&
            e.amount.currency === amount.currency &&
            e.amount.issuer === amount.issuer &&
            e.amount.value === amount.value &&
            normalize(e.finishAfter) === normalize(finishAfter) &&
            normalize(e.cancelAfter) === normalize(cancelAfter) &&
            e.condition === (condition || null) &&
            !e.transactionHash
        );

        if (escrow) {
            escrow.transactionHash = transactionHash;
            escrow.sequence = sequence;
            escrow.ledgerIndex = ledgerIndex || (txResult && txResult.ledger_index) || null;
            escrow.status = 'submitted';
            localStorage.setItem(storageKey, JSON.stringify(escrows));
            console.log('✅ Token escrow updated after create:', escrow.id);
        } else {
            console.warn('⚠️ Could not find matching token escrow to update after create.', {
                sender, destination, amount, finishAfter, cancelAfter, condition
            });
        }
    }

    generateTokenEscrowId() {
        const timestamp = Date.now().toString(36);
        const randomPart = Math.random().toString(36).substring(2, 8);
        return `tokenescrow_${timestamp}_${randomPart}`;
    }

    storeTokenEscrowData(escrowData) {
        try {
            const network = this.getCurrentNetwork();
            const storageKey = `${network.toLowerCase()}_token_escrows`;
            const existingEscrows = this.getStoredTokenEscrows();
            existingEscrows.push(escrowData);
            localStorage.setItem(storageKey, JSON.stringify(existingEscrows));
            console.log('✅ Token escrow data stored:', escrowData.id);
        } catch (error) {
            console.error('❌ Failed to store token escrow data:', error);
        }
    }

    getStoredTokenEscrows() {
        try {
            const network = this.getCurrentNetwork();
            const storageKey = `${network.toLowerCase()}_token_escrows`;
            const stored = localStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('❌ Failed to retrieve stored token escrows:', error);
            return [];
        }
    }

    lookupTokenAccountEscrows(modal) {
        const ownerSelect = modal.querySelector('#tokenEscrowOwner');
        const customOwnerInput = modal.querySelector('#tokenCustomOwner');
        const owner = ownerSelect.value || customOwnerInput.value.trim();
        const resultsDiv = modal.querySelector('#tokenEscrowLookupResults');
        const listDiv = modal.querySelector('#tokenEscrowList');
        if (!owner) {
            alert('Please select or enter an escrow owner account first.');
            return;
        }
        const storedEscrows = this.getStoredTokenEscrows().filter(e => e.sender === owner && e.sequence);
        resultsDiv.classList.remove('hidden');
        if (!storedEscrows.length) {
            listDiv.innerHTML = '<div class="text-xs text-gray-400">No token escrows found for this account in local storage.</div>';
            return;
        }
        let html = '';
        storedEscrows.forEach(e => {
            html += `
            <div class="token-escrow-item p-2 bg-gray-600/50 rounded border cursor-pointer hover:bg-gray-600"
                data-sequence="${e.sequence}" data-owner="${e.sender}" data-amount="${e.amount.value} ${e.amount.currency}" data-condition="${e.condition || ''}">
                <div class="flex justify-between items-center">
                    <div>
                        <span class="text-xs text-gray-400">Seq:</span>
                        <span class="text-white font-mono">${e.sequence}</span>
                        <span class="ml-2 text-xs text-gray-400">Amount:</span>
                        <span class="text-white">${e.amount.value} ${e.amount.currency}</span>
                    </div>
                    <div class="text-xs text-green-400 font-bold">✅ Finishable</div>
                </div>
            </div>
        `;
        });
        listDiv.innerHTML = html;
        modal.querySelectorAll('.token-escrow-item').forEach(item => {
            item.addEventListener('click', () => {
                ownerSelect.value = item.dataset.owner;
                modal.querySelector('#tokenOfferSequence').value = item.dataset.sequence;

                // Auto-fill fulfillment if present
                const escrow = this.getStoredTokenEscrows().find(e =>
                    e.sender === item.dataset.owner && String(e.sequence) === String(item.dataset.sequence)
                );
                if (escrow && escrow.condition && escrow.fulfillment) {
                    const fulfillmentField = modal.querySelector('#tokenEscrowFulfillment');
                    fulfillmentField.value = escrow.fulfillment;
                    // Optionally, show a message to the user
                    fulfillmentField.classList.add('bg-green-900');
                }
            });
        });
    }

    setupTokenEscrowFinishEvents(modal) {
        const closeBtn = modal.querySelector('#closeTokenEscrowFinishModal');
        const cancelBtn = modal.querySelector('#cancelTokenEscrowFinish');
        const previewBtn = modal.querySelector('#previewTokenEscrowFinish');
        const buildBtn = modal.querySelector('#buildTokenEscrowFinish');
        const sameAsFinisherBtn = modal.querySelector('#useTokenSameAsFinisher');
        const customOwnerBtn = modal.querySelector('#useTokenCustomOwner');
        const ownerSelect = modal.querySelector('#tokenEscrowOwner');
        const customOwnerInput = modal.querySelector('#tokenCustomOwner');
        const finishSelect = modal.querySelector('#tokenFinishAccount');

        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => modal.remove());
        });

        sameAsFinisherBtn?.addEventListener('click', () => {
            if (finishSelect.value) {
                ownerSelect.value = finishSelect.value;
                customOwnerInput.classList.add('hidden');
                ownerSelect.classList.remove('hidden');
            } else {
                alert('Please select a finisher account first.');
            }
        });

        customOwnerBtn?.addEventListener('click', () => {
            ownerSelect.classList.add('hidden');
            customOwnerInput.classList.remove('hidden');
            customOwnerInput.focus();
            ownerSelect.value = '';
        });

        ownerSelect?.addEventListener('change', () => {
            if (ownerSelect.value) {
                customOwnerInput.classList.add('hidden');
                customOwnerInput.value = '';
            }
        });

        // Lookup
        const lookupBtn = modal.querySelector('#lookupTokenEscrows');
        const clearBtn = modal.querySelector('#clearTokenEscrowLookup');
        lookupBtn?.addEventListener('click', () => {
            this.lookupTokenAccountEscrows(modal);
        });
        clearBtn?.addEventListener('click', () => {
            const resultsDiv = modal.querySelector('#tokenEscrowLookupResults');
            resultsDiv.classList.add('hidden');
            modal.querySelector('#tokenEscrowList').innerHTML = '';
        });

        // Preview/build
        previewBtn?.addEventListener('click', () => {
            this.previewTokenEscrowFinish(modal);
        });
        buildBtn?.addEventListener('click', () => {
            this.buildTokenEscrowFinishTransaction(modal);
        });

        // Update current time every second
        setInterval(() => {
            const timeElement = modal.querySelector('#currentTokenFinishTime');
            const localTimeElement = modal.querySelector('#currentTokenFinishLocalTime');
            if (timeElement) {
                timeElement.textContent = Math.floor(Date.now() / 1000) - 946684800;
            }
            if (localTimeElement) {
                localTimeElement.textContent = new Date().toLocaleString();
            }
        }, 1000);
    }

    previewTokenEscrowFinish(modal) {
        const owner = modal.querySelector('#tokenEscrowOwner').value || modal.querySelector('#tokenCustomOwner').value.trim();
        const offerSequence = modal.querySelector('#tokenOfferSequence').value;
        const fulfillment = modal.querySelector('#tokenEscrowFulfillment').value.trim();
        const finisher = modal.querySelector('#tokenFinishAccount').value;

        if (!owner || !offerSequence) {
            alert('Please select an escrow owner and enter the offer sequence.');
            return;
        }

        const preview = modal.querySelector('#tokenEscrowFinishPreview');
        const content = modal.querySelector('#tokenEscrowFinishPreviewContent');
        const buildBtn = modal.querySelector('#buildTokenEscrowFinish');

        if (preview && content) {
            preview.classList.remove('hidden');
            let previewHtml = `
            <div><span class="text-gray-400">Owner:</span> <span class="text-white">${owner}</span></div>
            <div><span class="text-gray-400">Offer Sequence:</span> <span class="text-white">${offerSequence}</span></div>
            <div><span class="text-gray-400">Finisher:</span> <span class="text-white">${finisher || '(any account)'}</span></div>
        `;
            if (fulfillment) {
                previewHtml += `<div><span class="text-gray-400">Fulfillment:</span> <span class="text-white font-mono text-xs">${fulfillment.substring(0, 40)}...</span></div>`;
            }
            content.innerHTML = previewHtml;
            buildBtn?.classList.remove('opacity-50', 'cursor-not-allowed');
            buildBtn.disabled = false;
        }
    }

    buildTokenEscrowFinishTransaction(modal) {
        const owner = modal.querySelector('#tokenEscrowOwner').value || modal.querySelector('#tokenCustomOwner').value.trim();
        const offerSequence = modal.querySelector('#tokenOfferSequence').value;
        const fulfillment = modal.querySelector('#tokenEscrowFulfillment').value.trim();
        const finisher = modal.querySelector('#tokenFinishAccount').value;

        // Find escrow in local storage
        const escrow = this.getStoredTokenEscrows().find(e =>
            e.sender === owner && String(e.sequence) === String(offerSequence)
        );

        if (!escrow) {
            alert('Token escrow not found in local storage. Please use the lookup.');
            return;
        }

        // Check finishAfter
        if (escrow.finishAfter) {
            const now = Math.floor(Date.now() / 1000) - 946684800;
            if (now < escrow.finishAfter) {
                alert(`⏰ Token escrow cannot be finished yet. FinishAfter: ${escrow.finishAfter}, Current: ${now}`);
                return;
            }
        }

        // Check fulfillment for conditional
        if (escrow.condition && !fulfillment) {
            alert('This token escrow requires a fulfillment. Please provide it.');
            return;
        }

        const transaction = {
            TransactionType: 'EscrowFinish',
            Owner: owner,
            OfferSequence: parseInt(offerSequence, 10)
        };
        if (finisher) {
            transaction.Account = finisher;
        }
        if (escrow.condition) {
            transaction.Condition = escrow.condition;
        }
        if (fulfillment) {
            transaction.Fulfillment = fulfillment;
        }

        // Instead of submitting, populate the transaction builder
        if (window.templateLibrary) {
            window.templateLibrary.populateTransactionBuilder(transaction, 'EscrowFinish');
        }

        alert('✅ Token EscrowFinish transaction populated in the builder!\n\nReview and submit when ready.');
        modal.remove();
    }

    populateTokenFinishAccountDropdowns(modal) {
        const network = this.getCurrentNetwork();
        if (!network) return;
        const storageKey = `${network.toLowerCase()}_credentials`;
        const stored = localStorage.getItem(storageKey);
        const credentials = stored ? JSON.parse(stored) : [];
        const finishSelect = modal.querySelector('#tokenFinishAccount');
        const ownerSelect = modal.querySelector('#tokenEscrowOwner');
        [finishSelect, ownerSelect].forEach(select => {
            if (select) select.innerHTML = '<option value="">Choose account...</option>';
        });
        credentials.forEach(cred => {
            const option1 = document.createElement('option');
            option1.value = cred.address;
            option1.textContent = `${cred.address.substring(0, 20)}... (${cred.balance})`;
            finishSelect?.appendChild(option1);
            const option2 = document.createElement('option');
            option2.value = cred.address;
            option2.textContent = `${cred.address.substring(0, 20)}... (${cred.balance})`;
            ownerSelect?.appendChild(option2);
        });
    }

    removeTokenEscrowFromStorage(owner, offerSequence) {
        const network = this.getCurrentNetwork();
        const storageKey = `${network.toLowerCase()}_token_escrows`;
        let escrows = this.getStoredTokenEscrows();
        const before = escrows.length;
        escrows = escrows.filter(e => !(e.sender === owner && String(e.sequence) === String(offerSequence)));
        localStorage.setItem(storageKey, JSON.stringify(escrows));
        console.log(`🗑️ Removed token escrow for owner ${owner} seq ${offerSequence} (${before - escrows.length} removed)`);
    }

    // Add this method to your TokenEscrowManager class
    showTokenEscrowCancelModal() {
        const modal = document.createElement('div');
        modal.id = 'tokenEscrowCancelModal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

        modal.innerHTML = `
    <div class="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-bold text-teal-400">❌ Cancel Token Escrow</h3>
            <button id="closeTokenEscrowCancelModal" class="text-gray-400 hover:text-white text-xl">&times;</button>
        </div>
        <div class="bg-red-900/30 p-3 rounded-lg mb-4">
            <h4 class="text-sm font-bold text-red-400 mb-1">💡 Cancelling Token Escrows</h4>
            <p class="text-xs text-gray-300">
                You can cancel a token escrow after its <span class="text-orange-300">CancelAfter</span> time has passed. This returns the escrowed tokens to the sender.
            </p>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <!-- Left: Escrow Identification -->
            <div class="space-y-3">
                <div class="bg-blue-900/30 p-3 rounded-lg">
                    <h4 class="text-sm font-bold text-blue-400 mb-1">🎯 Escrow Identification</h4>
                    <p class="text-xs text-gray-300">Identify the token escrow you want to cancel</p>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Canceller Account:</label>
                    <select id="tokenCancelAccount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                        <option value="">Choose account to cancel escrow...</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Escrow Owner:</label>
                    <select id="tokenCancelEscrowOwner" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                        <option value="">Choose escrow owner...</option>
                    </select>
                    <div class="flex justify-between mt-1">
                        <button type="button" id="useTokenCancelSameAsCanceller" class="text-xs text-teal-400 hover:text-teal-300">
                            📋 Use canceller account
                        </button>
                        <button type="button" id="useTokenCancelCustomOwner" class="text-xs text-purple-400 hover:text-purple-300">
                            ✏️ Enter custom address
                        </button>
                    </div>
                    <input type="text" id="tokenCancelCustomOwner" placeholder="rAccount... (custom owner)" 
                           class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mt-2 hidden">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Offer Sequence:</label>
                    <input type="number" id="tokenCancelOfferSequence" min="1" placeholder="12345" 
                           class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm">
                </div>
                <div class="flex space-x-2">
                    <button type="button" id="lookupTokenCancelEscrows" class="bg-purple-800 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs">
                        🔍 Find Token Escrows
                    </button>
                    <button type="button" id="clearTokenCancelEscrowLookup" class="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs">
                        🧹 Clear
                    </button>
                </div>
                <div id="tokenCancelEscrowLookupResults" class="hidden bg-gray-700/50 p-3 rounded border max-h-40 overflow-y-auto">
                    <h5 class="text-sm font-bold text-teal-400 mb-2">📋 Found Token Escrows:</h5>
                    <div id="tokenCancelEscrowList" class="space-y-2"></div>
                </div>
            </div>
            <!-- Right: Preview -->
            <div class="space-y-3">
                <div class="bg-yellow-900/30 p-3 rounded-lg">
                    <h4 class="text-sm font-bold text-yellow-400 mb-1">⏰ CancelAfter</h4>
                    <p class="text-xs text-gray-300">Escrow can only be cancelled after the CancelAfter time.</p>
                </div>
                <div class="bg-blue-900/30 p-2 rounded">
                    <p class="text-xs text-blue-200">
                        <strong>Current Ripple Time:</strong> <span id="currentTokenCancelTime">${Math.floor(Date.now() / 1000) - 946684800}</span>
                        <br><strong>Local Time:</strong> <span id="currentTokenCancelLocalTime">${new Date().toLocaleString()}</span>
                    </p>
                </div>
            </div>
        </div>
        <div id="tokenEscrowCancelPreview" class="hidden mt-4 p-3 bg-gray-700/50 rounded border">
            <h4 class="text-sm font-bold text-teal-400 mb-2">📋 Transaction Preview:</h4>
            <div class="text-xs space-y-1" id="tokenEscrowCancelPreviewContent"></div>
        </div>
        <div class="flex space-x-2 mt-4">
            <button id="previewTokenEscrowCancel" class="flex-1 bg-blue-800 hover:bg-blue-700 text-white px-4 py-2 rounded transition duration-300 text-sm">🔍 Preview</button>
            <button id="buildTokenEscrowCancel" class="flex-1 bg-teal-800 hover:bg-teal-700 text-white px-4 py-2 rounded transition duration-300 opacity-50 cursor-not-allowed text-sm" disabled>⚙️ Build</button>
            <button id="cancelTokenEscrowCancel" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded transition duration-300 text-sm">Cancel</button>
        </div>
    </div>
    `;

        // Populate dropdowns
        this.populateTokenCancelAccountDropdowns(modal);

        // Setup events
        const closeBtn = modal.querySelector('#closeTokenEscrowCancelModal');
        const cancelBtn = modal.querySelector('#cancelTokenEscrowCancel');
        [closeBtn, cancelBtn].forEach(btn => {
            btn?.addEventListener('click', () => modal.remove());
        });

        // Use canceller as owner
        const cancellerSelect = modal.querySelector('#tokenCancelAccount');
        const ownerSelect = modal.querySelector('#tokenCancelEscrowOwner');
        const customOwnerInput = modal.querySelector('#tokenCancelCustomOwner');
        modal.querySelector('#useTokenCancelSameAsCanceller')?.addEventListener('click', () => {
            if (cancellerSelect.value) {
                ownerSelect.value = cancellerSelect.value;
                customOwnerInput.classList.add('hidden');
                ownerSelect.classList.remove('hidden');
            } else {
                alert('Please select a canceller account first.');
            }
        });
        modal.querySelector('#useTokenCancelCustomOwner')?.addEventListener('click', () => {
            ownerSelect.classList.add('hidden');
            customOwnerInput.classList.remove('hidden');
            customOwnerInput.focus();
            ownerSelect.value = '';
        });
        ownerSelect?.addEventListener('change', () => {
            if (ownerSelect.value) {
                customOwnerInput.classList.add('hidden');
                customOwnerInput.value = '';
            }
        });

        // Lookup logic
        const lookupBtn = modal.querySelector('#lookupTokenCancelEscrows');
        const clearBtn = modal.querySelector('#clearTokenCancelEscrowLookup');
        lookupBtn?.addEventListener('click', () => {
            // Only show escrows that are expired (cancelAfter < now) and have a sequence
            const owner = ownerSelect.value || customOwnerInput.value.trim();
            const resultsDiv = modal.querySelector('#tokenCancelEscrowLookupResults');
            const listDiv = modal.querySelector('#tokenCancelEscrowList');
            if (!owner) {
                alert('Please select or enter an escrow owner account first.');
                return;
            }
            const now = Math.floor(Date.now() / 1000) - 946684800;
            const escrows = this.getStoredTokenEscrows().filter(e =>
                e.sender === owner && e.sequence && e.cancelAfter && now > e.cancelAfter
            );
            resultsDiv.classList.remove('hidden');
            if (!escrows.length) {
                listDiv.innerHTML = '<div class="text-xs text-gray-400">No expired token escrows found for this account in local storage.</div>';
                return;
            }
            let html = '';
            escrows.forEach(e => {
                html += `
                <div class="token-cancel-escrow-item p-2 bg-gray-600/50 rounded border cursor-pointer hover:bg-gray-600"
                    data-sequence="${e.sequence}" data-owner="${e.sender}">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-xs text-gray-400">Seq:</span>
                            <span class="text-white font-mono">${e.sequence}</span>
                            <span class="ml-2 text-xs text-gray-400">Amount:</span>
                            <span class="text-white">${e.amount.value} ${e.amount.currency}</span>
                        </div>
                        <div class="text-xs text-red-400 font-bold">❌ Expired</div>
                    </div>
                </div>
            `;
            });
            listDiv.innerHTML = html;
           modal.querySelectorAll('.token-cancel-escrow-item').forEach(item => {
    item.addEventListener('click', () => {
        ownerSelect.value = item.dataset.owner;
        modal.querySelector('#tokenCancelOfferSequence').value = item.dataset.sequence;

        // Autofill canceller if the sender is in the dropdown
        const escrow = this.getStoredTokenEscrows().find(e =>
            e.sender === item.dataset.owner && String(e.sequence) === String(item.dataset.sequence)
        );
        const cancellerSelect = modal.querySelector('#tokenCancelAccount');
        if (escrow && cancellerSelect) {
            // If the sender is in the canceller dropdown, select it
            for (let i = 0; i < cancellerSelect.options.length; i++) {
                if (cancellerSelect.options[i].value === escrow.sender) {
                    cancellerSelect.selectedIndex = i;
                    break;
                }
            }
        }
    });
});
        });
        clearBtn?.addEventListener('click', () => {
            const resultsDiv = modal.querySelector('#tokenCancelEscrowLookupResults');
            resultsDiv.classList.add('hidden');
            modal.querySelector('#tokenCancelEscrowList').innerHTML = '';
        });

        // Preview/build
        const previewBtn = modal.querySelector('#previewTokenEscrowCancel');
        const buildBtn = modal.querySelector('#buildTokenEscrowCancel');
        previewBtn?.addEventListener('click', () => {
            const owner = ownerSelect.value || customOwnerInput.value.trim();
            const offerSequence = modal.querySelector('#tokenCancelOfferSequence').value;
            const canceller = cancellerSelect.value;
            if (!owner || !offerSequence || !canceller) {
                alert('Please select an escrow owner, offer sequence, and canceller account.');
                return;
            }
            const preview = modal.querySelector('#tokenEscrowCancelPreview');
            const content = modal.querySelector('#tokenEscrowCancelPreviewContent');
            if (preview && content) {
                preview.classList.remove('hidden');
                let previewHtml = `
                <div><span class="text-gray-400">Owner:</span> <span class="text-white">${owner}</span></div>
                <div><span class="text-gray-400">Offer Sequence:</span> <span class="text-white">${offerSequence}</span></div>
                <div><span class="text-gray-400">Canceller:</span> <span class="text-white">${canceller}</span></div>
            `;
                content.innerHTML = previewHtml;
                buildBtn?.classList.remove('opacity-50', 'cursor-not-allowed');
                buildBtn.disabled = false;
            }
        });
        buildBtn?.addEventListener('click', () => {
            const owner = ownerSelect.value || customOwnerInput.value.trim();
            const offerSequence = modal.querySelector('#tokenCancelOfferSequence').value;
            const canceller = cancellerSelect.value;
            // Find escrow in local storage
            const escrow = this.getStoredTokenEscrows().find(e =>
                e.sender === owner && String(e.sequence) === String(offerSequence)
            );
            if (!escrow) {
                alert('Token escrow not found in local storage. Please use the lookup.');
                return;
            }
            // Check cancelAfter
            const now = Math.floor(Date.now() / 1000) - 946684800;
            if (!escrow.cancelAfter || now < escrow.cancelAfter) {
                alert(`⏰ Token escrow cannot be cancelled yet. CancelAfter: ${escrow.cancelAfter}, Current: ${now}`);
                return;
            }
            // Build transaction object
            const transaction = {
                TransactionType: 'EscrowCancel',
                Account: canceller,
                Owner: owner,
                OfferSequence: parseInt(offerSequence, 10)
            };
            // Instead of submitting, populate the transaction builder
            if (window.templateLibrary) {
                window.templateLibrary.populateTransactionBuilder(transaction, 'EscrowCancel');
            }
            alert('✅ Token EscrowCancel transaction populated in the builder!\n\nReview and submit when ready.');
            modal.remove();
        });

        // Update current time every second
        setInterval(() => {
            const timeElement = modal.querySelector('#currentTokenCancelTime');
            const localTimeElement = modal.querySelector('#currentTokenCancelLocalTime');
            if (timeElement) {
                timeElement.textContent = Math.floor(Date.now() / 1000) - 946684800;
            }
            if (localTimeElement) {
                localTimeElement.textContent = new Date().toLocaleString();
            }
        }, 1000);

        document.body.appendChild(modal);
        modal.classList.remove('hidden');

    }

    showTokenEscrowLookupModal() {
    const modal = document.createElement('div');
    modal.id = 'tokenEscrowLookupModal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';

    modal.innerHTML = `
        <div class="bg-gray-800 rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xl font-bold text-purple-400">🔍 Lookup Token Escrows</h3>
                <button id="closeTokenEscrowLookupModal" class="text-gray-400 hover:text-white text-xl">&times;</button>
            </div>
            <div class="bg-purple-900/30 p-3 rounded-lg mb-4">
                <h4 class="text-sm font-bold text-purple-400 mb-1">Find Token Escrows On-Ledger</h4>
                <p class="text-xs text-gray-300">
                    Search for token escrows by account. You can import escrows into local storage for use with Finish/Cancel.
                </p>
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-300 mb-1">Account:</label>
                <select id="lookupTokenEscrowAccount" class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-2">
                    <option value="">Choose account...</option>
                </select>
                <input type="text" id="lookupTokenEscrowCustomAccount" placeholder="rAccount... (custom address)" 
                    class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm mb-2">
                <button type="button" id="searchTokenEscrowsLedger" class="bg-purple-800 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs mb-2">
                    🔍 Search Ledger
                </button>
            </div>
            <div id="tokenEscrowLedgerResults" class="hidden mt-4">
                <h5 class="text-sm font-bold text-teal-400 mb-2">📋 Token Escrows Found:</h5>
                <div id="tokenEscrowLedgerList" class="space-y-2"></div>
            </div>
            <div class="flex space-x-2 mt-4">
                <button id="closeTokenEscrowLookupModal2" class="flex-1 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition duration-300 text-sm">Close</button>
            </div>
        </div>
    `;

    // Populate dropdown with credentials
    const network = this.getCurrentNetwork();
    const storageKey = `${network.toLowerCase()}_credentials`;
    const stored = localStorage.getItem(storageKey);
    const credentials = stored ? JSON.parse(stored) : [];
    const accountSelect = modal.querySelector('#lookupTokenEscrowAccount');
    if (accountSelect) {
        accountSelect.innerHTML = '<option value="">Choose account...</option>';
        credentials.forEach(cred => {
            const option = document.createElement('option');
            option.value = cred.address;
            option.textContent = `${cred.address.substring(0, 20)}... (${cred.balance})`;
            accountSelect.appendChild(option);
        });
    }

    // Close modal
    [modal.querySelector('#closeTokenEscrowLookupModal'), modal.querySelector('#closeTokenEscrowLookupModal2')].forEach(btn => {
        btn?.addEventListener('click', () => modal.remove());
    });

    // Search button logic
    modal.querySelector('#searchTokenEscrowsLedger').addEventListener('click', async () => {
        const selected = accountSelect.value;
        const custom = modal.querySelector('#lookupTokenEscrowCustomAccount').value.trim();
        const account = selected || custom;
        if (!account) {
            alert('Please select or enter an account address.');
            return;
        }
        const resultsDiv = modal.querySelector('#tokenEscrowLedgerResults');
        const listDiv = modal.querySelector('#tokenEscrowLedgerList');
        resultsDiv.classList.remove('hidden');
        listDiv.innerHTML = '<div class="text-xs text-gray-400">Searching ledger...</div>';

        // Fetch escrows from ledger
        let escrows = [];
        try {
            const client = window.getCurrentClient ? window.getCurrentClient() : null;
            if (!client) throw new Error('No network client available.');
            const resp = await client.request({
                command: 'account_objects',
                account,
                type: 'escrow'
            });
            escrows = resp.result.account_objects || [];
        } catch (e) {
            listDiv.innerHTML = `<div class="text-xs text-red-400">Failed to fetch escrows: ${e.message}</div>`;
            return;
        }

        // Only show IOU/MPT escrows (Amount is object, not string)
        escrows = escrows.filter(e => typeof e.Amount === 'object');

        if (!escrows.length) {
            listDiv.innerHTML = '<div class="text-xs text-gray-400">No token escrows found for this account on the ledger.</div>';
            return;
        }

        // Display escrows
        let html = '';
        escrows.forEach(e => {
            html += `
                <div class="token-escrow-ledger-item p-2 bg-gray-600/50 rounded border cursor-pointer hover:bg-gray-600"
                    data-owner="${e.Owner || e.Account || ''}" 
                    data-destination="${e.Destination || ''}" 
                    data-amount='${JSON.stringify(e.Amount)}'
                    data-condition="${e.Condition || ''}" 
                    data-cancelafter="${e.CancelAfter || ''}" 
                    data-finishafter="${e.FinishAfter || ''}"
                    data-previoustxnid="${e.PreviousTxnID || ''}">
                    <div class="flex justify-between items-center">
                        <div>
                            <div class="text-xs text-gray-400">Seq: <span class="text-white font-mono">[fetching]</span></div>
                            <div class="text-xs text-gray-400">Amount: <span class="text-white">${e.Amount.value} ${e.Amount.currency}</span></div>
                            <div class="text-xs text-gray-400">Destination: <span class="text-white font-mono">${(e.Destination || '').substring(0, 15)}...</span></div>
                            ${e.Condition ? '<div class="text-xs text-purple-400">🔐 Conditional</div>' : ''}
                            ${e.CancelAfter ? `<div class="text-xs text-orange-400">❌ Expires: ${e.CancelAfter}</div>` : ''}
                            ${e.FinishAfter ? `<div class="text-xs text-blue-400">⏰ After: ${e.FinishAfter}</div>` : ''}
                        </div>
                        <button class="saveTokenEscrowToLocal bg-teal-800 hover:bg-teal-700 text-white px-2 py-1 rounded text-xs" title="Save to Local">💾 Save</button>
                    </div>
                </div>
            `;
        });
        listDiv.innerHTML = html;

        // Save to local storage handler
        modal.querySelectorAll('.saveTokenEscrowToLocal').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const item = btn.closest('.token-escrow-ledger-item');
                const previousTxnId = item.dataset.previoustxnid || '';
                const owner = item.dataset.owner;
                const network = this.getCurrentNetwork();

                if (!previousTxnId || !owner) {
                    alert('Escrow missing required fields (PreviousTxnID or Owner). Not saved.');
                    return;
                }

                // Fetch the EscrowCreate transaction to get the sequence
                let sequence = null;
                try {
                    const client = window.getCurrentClient ? window.getCurrentClient() : null;
                    if (!client) throw new Error('No network client available.');
                    const txResp = await client.request({
                        command: 'tx',
                        transaction: previousTxnId
                    });
                    sequence = txResp.result.tx_json.Sequence;
                } catch (e) {
                    alert('Failed to fetch EscrowCreate transaction for sequence: ' + e.message);
                    return;
                }

                const escrowData = {
                    id: `tokenescrow_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
                    timestamp: Date.now(),
                    type: item.dataset.condition ? 'conditional' : 'time',
                    sender: owner,
                    destination: item.dataset.destination,
                    amount: JSON.parse(item.dataset.amount),
                    finishAfter: item.dataset.finishafter ? parseInt(item.dataset.finishafter) : null,
                    cancelAfter: item.dataset.cancelafter ? parseInt(item.dataset.cancelafter) : null,
                    condition: item.dataset.condition || null,
                    fulfillment: null, // Can't get fulfillment from ledger
                    network: network,
                    status: 'imported',
                    transactionHash: previousTxnId,
                    sequence: sequence,
                    ledgerIndex: null
                };

                // Defensive: Don't save if missing required fields
                if (!escrowData.sender || !escrowData.sequence) {
                    alert(`Escrow missing required fields (Owner or Sequence). Not saved.\n\nOwner: ${escrowData.sender}\nSequence: ${escrowData.sequence}`);
                    return;
                }

                // Remove any previous escrow with same sender+sequence to avoid duplicates
                const storageKey = `${network.toLowerCase()}_token_escrows`;
                let escrowArr = [];
                try {
                    escrowArr = JSON.parse(localStorage.getItem(storageKey)) || [];
                } catch {}
                escrowArr = escrowArr.filter(e => !(e.sender === escrowData.sender && String(e.sequence) === String(escrowData.sequence)));
                escrowArr.push(escrowData);
                localStorage.setItem(storageKey, JSON.stringify(escrowArr));

                btn.textContent = '✅ Saved';
                btn.disabled = true;
                btn.classList.add('bg-green-800');
            });
        });
    });

    document.body.appendChild(modal);
    modal.classList.remove('hidden');
}

    populateTokenCancelAccountDropdowns(modal) {
    const network = this.getCurrentNetwork();
    if (!network) return;
    const storageKey = `${network.toLowerCase()}_credentials`;
    const stored = localStorage.getItem(storageKey);
    const credentials = stored ? JSON.parse(stored) : [];
    const cancelSelect = modal.querySelector('#tokenCancelAccount');
    const ownerSelect = modal.querySelector('#tokenCancelEscrowOwner');
    [cancelSelect, ownerSelect].forEach(select => {
        if (select) select.innerHTML = '<option value="">Choose account...</option>';
    });
    credentials.forEach(cred => {
        const option1 = document.createElement('option');
        option1.value = cred.address;
        option1.textContent = `${cred.address.substring(0, 20)}... (${cred.balance})`;
        cancelSelect?.appendChild(option1);
        const option2 = document.createElement('option');
        option2.value = cred.address;
        option2.textContent = `${cred.address.substring(0, 20)}... (${cred.balance})`;
        ownerSelect?.appendChild(option2);
    });
    }

}

// Create global instance
window.tokenEscrowManager = new TokenEscrowManager();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔒 Escrow Manager ready');
});