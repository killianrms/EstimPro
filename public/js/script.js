let currentStep = 1;
const totalSteps = 9;

function updateProgress() {
    const progress = (currentStep / totalSteps) * 100;
    const progressBar = document.getElementById('progressBar');
    const currentStepSpan = document.getElementById('currentStep');
    
    if (progressBar) {
        progressBar.style.width = progress + '%';
    }
    
    if (currentStepSpan) {
        currentStepSpan.textContent = currentStep;
    }
    
    // Mettre à jour les indicateurs d'étapes visuels
    const progressSteps = document.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
        if (index < currentStep - 1) {
            step.classList.add('completed');
            step.classList.remove('active');
        } else if (index === currentStep - 1) {
            step.classList.add('active');
            step.classList.remove('completed');
        } else {
            step.classList.remove('active', 'completed');
        }
    });
}

function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < totalSteps) {
            document.getElementById('step' + currentStep).classList.remove('active');
            currentStep++;
            document.getElementById('step' + currentStep).classList.add('active');
            updateProgress();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById('step' + currentStep).classList.remove('active');
        currentStep--;
        document.getElementById('step' + currentStep).classList.add('active');
        updateProgress();
    }
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            if (typeof validateAddress === 'function') {
                return validateAddress();
            } else {
                const address = document.getElementById('address').value;
                if (!address.trim()) {
                    alert('Veuillez saisir une adresse');
                    return false;
                }
                return true;
            }
        case 2:
            const propertyType = document.getElementById('propertyType').value;
            const validTypes = ['appartement', 'maison', 'terrain', 'immeuble', 'commerce'];
            if (!propertyType || !validTypes.includes(propertyType)) {
                alert('Veuillez sélectionner un type de bien valide');
                return false;
            }
            return true;
        case 3:
            const surface = document.getElementById('surface').value;
            const rooms = document.getElementById('rooms').value;
            const propertyType3 = document.getElementById('propertyType').value;
            
            if (!surface || surface < 10 || surface > 10000) {
                alert('Veuillez saisir une surface valide (entre 10 et 10000 m²)');
                return false;
            }
            
            // Validation des pièces selon le type de bien
            if (['appartement', 'maison'].includes(propertyType3)) {
                if (!rooms) {
                    alert('Veuillez sélectionner le nombre de pièces');
                    return false;
                }
            }
            
            return true;
        case 3:
            const workNeeded = document.getElementById('workNeeded').value;
            if (!workNeeded) {
                alert('Veuillez indiquer s\'il y a des travaux à prévoir');
                return false;
            }
            return true;
        case 4:
            const dpe = document.getElementById('dpe').value;
            if (!dpe) {
                alert('Veuillez sélectionner le DPE de votre bien');
                return false;
            }
            return true;
        case 5:
            const condition = document.getElementById('condition').value;
            if (!condition) {
                alert('Veuillez sélectionner l\'état du bien');
                return false;
            }
            return true;
        case 6:
            // Validation optionnelle pour les extérieurs
            return true;
        case 7:
            const estimationReason = document.getElementById('estimationReason').value;
            const projectTimeline = document.getElementById('projectTimeline').value;
            if (!estimationReason) {
                alert('Veuillez sélectionner la raison de votre estimation');
                return false;
            }
            if (!projectTimeline) {
                alert('Veuillez sélectionner le délai de votre projet');
                return false;
            }
            return true;
        case 8:
            return true;
        case 9:
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const consentData = document.getElementById('consentData').checked;
            
            if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
                alert('Veuillez remplir tous les champs obligatoires');
                return false;
            }
            
            // Validation du téléphone
            const cleanPhone = phone.replace(/\s/g, '');
            if (!/^0[1-9]\d{8}$/.test(cleanPhone)) {
                alert('Veuillez entrer un numéro de téléphone français valide (10 chiffres)');
                return false;
            }
            
            if (!validateEmail(email)) {
                alert('Veuillez saisir un email valide');
                return false;
            }
            
            if (!consentData) {
                alert('Vous devez accepter le traitement de vos données personnelles pour continuer');
                return false;
            }
            
            return true;
        default:
            return true;
    }
}

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Fonction de formatage du téléphone
function formatPhoneNumber(value) {
    // Supprimer tous les caractères non numériques
    const cleaned = value.replace(/\D/g, '');
    
    // Limiter à 10 chiffres
    const limited = cleaned.substring(0, 10);
    
    // Formater en XX XX XX XX XX
    const match = limited.match(/^(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})(\d{0,2})$/);
    
    if (match) {
        return [match[1], match[2], match[3], match[4], match[5]]
            .filter(group => group)
            .join(' ');
    }
    
    return value;
}

// Gestion du mode sombre
function initDarkMode() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Initialiser le mode sombre
initDarkMode();

// Sauvegarder les données du formulaire
function saveFormData() {
    const form = document.getElementById('estimationForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const data = {};
    
    for (let [key, value] of formData.entries()) {
        data[key] = value;
    }
    
    localStorage.setItem('estimationFormData', JSON.stringify(data));
}

// Restaurer les données du formulaire
function restoreFormData() {
    const savedData = localStorage.getItem('estimationFormData');
    if (!savedData) return;
    
    try {
        const data = JSON.parse(savedData);
        const form = document.getElementById('estimationForm');
        
        Object.keys(data).forEach(key => {
            const input = form.elements[key];
            if (input && input.type !== 'checkbox' && input.type !== 'radio') {
                input.value = data[key];
            }
        });
        
        // Restaurer les sélections de type de propriété
        if (data.propertyType) {
            const propertyTypes = document.querySelectorAll('.property-type');
            propertyTypes.forEach(type => {
                if (type.dataset.value === data.propertyType) {
                    type.click();
                }
            });
        }
    } catch (e) {
        console.error('Erreur lors de la restauration des données:', e);
    }
}

// Effacer les données sauvegardées après soumission
function clearSavedFormData() {
    localStorage.removeItem('estimationFormData');
}

document.addEventListener('DOMContentLoaded', function() {
    const propertyTypes = document.querySelectorAll('.property-type');
    propertyTypes.forEach(type => {
        type.addEventListener('click', function() {
            propertyTypes.forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('propertyType').value = this.dataset.value;
            updateFieldsVisibility(this.dataset.value);
        });
    });

    // DPE selection
    const dpeOptions = document.querySelectorAll('.dpe-option');
    dpeOptions.forEach(option => {
        option.addEventListener('click', function() {
            dpeOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('dpe').value = this.dataset.value;
        });
    });

    // Condition selection
    const conditionOptions = document.querySelectorAll('.condition-option');
    conditionOptions.forEach(option => {
        option.addEventListener('click', function() {
            conditionOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('condition').value = this.dataset.value;
        });
    });

    // Project reason selection
    const projectReasons = document.querySelectorAll('.project-reason');
    projectReasons.forEach(reason => {
        reason.addEventListener('click', function() {
            projectReasons.forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('estimationReason').value = this.dataset.value;
        });
    });

    // Project timeline selection
    const timelineOptions = document.querySelectorAll('.timeline-option');
    timelineOptions.forEach(option => {
        option.addEventListener('click', function() {
            timelineOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('projectTimeline').value = this.dataset.value;
        });
    });

    // Elevator and multi-floor selection
    document.addEventListener('click', function(e) {
        if (e.target.closest('.elevator-option')) {
            const option = e.target.closest('.elevator-option');
            const container = option.parentNode;
            const hiddenInput = container.parentNode.querySelector('input[type="hidden"]');
            
            // Remove selected from siblings
            container.querySelectorAll('.elevator-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            
            // Set value in hidden input
            if (hiddenInput) {
                hiddenInput.value = option.dataset.value;
                
                // Special handling for DPE specialists question
                if (hiddenInput.id === 'dpeSpecialists') {
                    const dpePartnersInfo = document.getElementById('dpePartnersInfo');
                    if (option.dataset.value === 'non') {
                        dpePartnersInfo.style.display = 'block';
                    } else {
                        dpePartnersInfo.style.display = 'none';
                    }
                }
            }
        }
    });

    // Work selection
    const workNeedOptions = document.querySelectorAll('.work-need-option');
    workNeedOptions.forEach(option => {
        option.addEventListener('click', function() {
            workNeedOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('workNeeded').value = this.dataset.value;
            
            // Afficher/masquer les détails selon le choix
            const workDetails = document.getElementById('workDetails');
            const importantWork = document.getElementById('importantWork');
            const refreshmentWork = document.getElementById('refreshmentWork');
            
            if (this.dataset.value === 'non') {
                workDetails.style.display = 'none';
            } else if (this.dataset.value === 'importants') {
                workDetails.style.display = 'block';
                importantWork.style.display = 'block';
                refreshmentWork.style.display = 'none';
            } else if (this.dataset.value === 'rafraichissement') {
                workDetails.style.display = 'block';
                importantWork.style.display = 'none';
                refreshmentWork.style.display = 'block';
            }
        });
    });

    // Counter controls
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('counter-btn')) {
            const action = e.target.dataset.action;
            const targetId = e.target.dataset.target;
            const input = document.getElementById(targetId);
            
            if (input) {
                let currentValue = parseInt(input.value) || 0;
                const min = parseInt(input.min) || 0;
                const max = parseInt(input.max) || 999;
                
                if (action === 'increase' && currentValue < max) {
                    input.value = currentValue + 1;
                } else if (action === 'decrease' && currentValue > min) {
                    input.value = currentValue - 1;
                }
                
                // Trigger change event to update size fields
                input.dispatchEvent(new Event('change'));
                updateExteriorDetails();
            }
        }
    });
    
    // Update exterior details when counters change
    const counterInputs = document.querySelectorAll('.counter-control input');
    counterInputs.forEach(input => {
        input.addEventListener('change', updateExteriorDetails);
    });

    // Construction period selection
    const periodOptions = document.querySelectorAll('.period-option');
    periodOptions.forEach(option => {
        option.addEventListener('click', function() {
            periodOptions.forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            document.getElementById('constructionPeriod').value = this.dataset.value;
        });
    });

    const form = document.getElementById('estimationForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        if (validateCurrentStep()) {
            submitEstimation();
        }
    });

    updateProgress();
    
    // Restaurer les données sauvegardées
    restoreFormData();
    
    // Sauvegarder automatiquement les données du formulaire
    const inputs = form.querySelectorAll('input[type="text"], input[type="number"], input[type="email"], input[type="tel"], select, textarea');
    
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            saveFormData();
        });
    });
    
    // Formatage automatique du téléphone
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            const formatted = formatPhoneNumber(e.target.value);
            e.target.value = formatted;
        });
    }
});

function updateFieldsVisibility(propertyType) {
    const roomsGroup = document.getElementById('roomsGroup');
    const bedroomsGroup = document.getElementById('bedroomsGroup');
    const floorGroup = document.getElementById('floorGroup');
    const multiFloorGroup = document.getElementById('multiFloorGroup');
    const elevatorGroup = document.getElementById('elevatorGroup');
    const floorLabel = document.getElementById('floorLabel');
    const roomsSelect = document.getElementById('rooms');
    const bedroomsSelect = document.getElementById('bedrooms');
    const floorSelect = document.getElementById('floor');
    
    if (propertyType === 'terrain') {
        // Pour terrain: masquer pièces, chambres, étage, ascenseur
        roomsGroup.style.display = 'none';
        bedroomsGroup.style.display = 'none';
        floorGroup.style.display = 'none';
        multiFloorGroup.style.display = 'none';
        elevatorGroup.style.display = 'none';
        roomsSelect.removeAttribute('required');
        bedroomsSelect.removeAttribute('required');
        floorSelect.removeAttribute('required');
    } else if (propertyType === 'appartement') {
        // Pour appartement: afficher étage et ascenseur
        roomsGroup.style.display = 'block';
        bedroomsGroup.style.display = 'block';
        floorGroup.style.display = 'block';
        multiFloorGroup.style.display = 'none';
        elevatorGroup.style.display = 'block';
        floorLabel.textContent = 'À quel étage se situe l\'appartement ?';
        roomsSelect.setAttribute('required', 'required');
        bedroomsSelect.setAttribute('required', 'required');
    } else if (propertyType === 'maison') {
        // Pour maison: afficher question multi-étages
        roomsGroup.style.display = 'block';
        bedroomsGroup.style.display = 'block';
        floorGroup.style.display = 'none';
        multiFloorGroup.style.display = 'block';
        elevatorGroup.style.display = 'none';
        roomsSelect.setAttribute('required', 'required');
        bedroomsSelect.setAttribute('required', 'required');
    } else if (['immeuble', 'commerce'].includes(propertyType)) {
        // Pour immeuble/commerce: afficher ascenseur, masquer chambres si commerce
        roomsGroup.style.display = 'block';
        bedroomsGroup.style.display = propertyType === 'commerce' ? 'none' : 'block';
        floorGroup.style.display = 'block';
        elevatorGroup.style.display = 'block';
        roomsSelect.setAttribute('required', 'required');
    }
}

function updateExteriorDetails() {
    const exteriorDetails = document.getElementById('exteriorDetails');
    const exteriorSizes = document.getElementById('exteriorSizes');
    
    // Check if any counter has value > 0
    const counters = ['balconsCount', 'terrassesCount', 'cavesCount', 'garagesCount', 'boxesCount', 'parkingCount'];
    const hasAnyExterior = counters.some(id => {
        const input = document.getElementById(id);
        return input && parseInt(input.value) > 0;
    });
    
    if (!hasAnyExterior) {
        exteriorDetails.style.display = 'none';
        return;
    }
    
    exteriorDetails.style.display = 'block';
    exteriorSizes.innerHTML = '';
    
    // Create size inputs for balcons and terrasses
    ['balcons', 'terrasses'].forEach(type => {
        const countInput = document.getElementById(type + 'Count');
        const count = parseInt(countInput.value) || 0;
        
        if (count > 0) {
            const container = document.createElement('div');
            container.className = 'size-inputs-container';
            container.innerHTML = `<h6>📏 Taille des ${type}</h6>`;
            
            for (let i = 1; i <= count; i++) {
                const sizeInput = document.createElement('div');
                sizeInput.className = 'exterior-size-input';
                sizeInput.innerHTML = `
                    <label>${type.charAt(0).toUpperCase() + type.slice(1, -1)} ${i} :</label>
                    <input type="number" name="${type}Size${i}" placeholder="Surface m²" min="1" max="500" step="0.1" style="width: 120px;">
                `;
                container.appendChild(sizeInput);
            }
            exteriorSizes.appendChild(container);
        }
    });
}

function submitEstimation() {
    // Ajouter le spinner au bouton
    const submitBtn = document.querySelector('.submit-btn');
    if (submitBtn) {
        submitBtn.classList.add('btn-loading');
        submitBtn.disabled = true;
    }
    
    showLoadingModal();
    
    const formData = new FormData(document.getElementById('estimationForm'));
    const data = Object.fromEntries(formData.entries());
    
    if (typeof getAddressData === 'function') {
        const addressData = getAddressData();
        if (addressData && addressData.components) {
            data.googlePlaceId = addressData.place_id;
            data.city = addressData.components.city || addressData.components.locality;
            data.postalCode = addressData.components.postal_code;
            data.latitude = addressData.geometry?.location?.lat();
            data.longitude = addressData.geometry?.location?.lng();
        }
    }
    
    fetch('/api/estimate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        hideLoadingModal();
        if (data.success) {
            showResult(data.estimation);
        } else {
            alert('Erreur lors du calcul de l\'estimation: ' + data.message);
        }
    })
    .catch(error => {
        hideLoadingModal();
        console.error('Erreur:', error);
        alert('Une erreur est survenue lors du calcul de l\'estimation');
    });
}

function showLoadingModal() {
    document.getElementById('loadingModal').style.display = 'block';
}

function hideLoadingModal() {
    document.getElementById('loadingModal').style.display = 'none';
}

function showResult(estimation) {
    const resultContent = document.getElementById('estimationResult');
    const formData = new FormData(document.getElementById('estimationForm'));
    const data = Object.fromEntries(formData.entries());
    
    resultContent.innerHTML = `
        <div class="estimation-details">
            <div class="price-estimate">
                ${estimation.estimatedPrice.toLocaleString('fr-FR')} € - ${estimation.estimatedPriceMax.toLocaleString('fr-FR')} €
            </div>
            <div class="property-summary">
                <div><strong>Type:</strong> ${data.propertyType}</div>
                <div><strong>Surface:</strong> ${data.surface} m²</div>
                <div><strong>Pièces:</strong> ${data.rooms}</div>
                <div><strong>État:</strong> ${data.condition}</div>
                <div><strong>Adresse:</strong> ${data.address}</div>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: #e3f2fd; border-radius: 5px;">
                <small>
                    <strong>Prix au m²:</strong> ${estimation.pricePerSqm.toLocaleString('fr-FR')} €/m²<br>
                    Cette estimation est indicative et basée sur les données du marché local.
                </small>
            </div>
            <div style="margin-top: 1rem; padding: 1rem; background: #f8f9ff; border-radius: 5px; border: 2px solid #667eea;">
                <div style="text-align: center;">
                    <strong style="color: #667eea;">📞 Prochaine étape</strong><br>
                    <span style="color: #666;">Un spécialiste immobilier va vous contacter dans les 24h pour affiner cette estimation et répondre à toutes vos questions.</span>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('resultModal').style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Ajouter un bouton pour continuer après l'estimation
    setTimeout(() => {
        const resultModal = document.getElementById('resultModal');
        const modalContent = resultModal.querySelector('.modal-content');
        if (!modalContent.querySelector('.continue-btn')) {
            const continueBtn = document.createElement('button');
            continueBtn.className = 'continue-btn btn btn-primary';
            continueBtn.textContent = 'Continuer';
            continueBtn.style.cssText = `
                margin-top: 1rem;
                padding: 0.75rem 2rem;
                background-color: #667eea;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s ease;
                width: 100%;
            `;
            continueBtn.onmouseover = () => {
                continueBtn.style.backgroundColor = '#5a5fc4';
                continueBtn.style.transform = 'translateY(-2px)';
                continueBtn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)';
            };
            continueBtn.onmouseout = () => {
                continueBtn.style.backgroundColor = '#667eea';
                continueBtn.style.transform = 'translateY(0)';
                continueBtn.style.boxShadow = 'none';
            };
            continueBtn.onclick = () => {
                closeModal();
                showThankYouPage();
            };
            modalContent.appendChild(continueBtn);
        }
    }, 100);
}

function closeModal() {
    document.getElementById('resultModal').style.display = 'none';
    document.getElementById('loadingModal').style.display = 'none';
    document.body.classList.remove('modal-open');
}

function selectPartnerOption(choice) {
    if (choice === 'no') {
        document.getElementById('partnerRecommendations').style.display = 'block';
    } else {
        closeDpeModal();
    }
}

function closeDpeModal() {
    document.getElementById('dpePartnersModal').style.display = 'none';
}

window.onclick = function(event) {
    const resultModal = document.getElementById('resultModal');
    const loadingModal = document.getElementById('loadingModal');
    
    if (event.target === resultModal) {
        closeModal();
    }
    if (event.target === loadingModal) {
        hideLoadingModal();
    }
}

function showThankYouPage() {
    const formContainer = document.querySelector('.form-container');
    formContainer.innerHTML = `
        <div class="thank-you-container" style="text-align: center; padding: 3rem;">
            <h2 style="color: #667eea; margin-bottom: 2rem;">🎉 Merci pour votre confiance !</h2>
            
            <p style="font-size: 1.1rem; margin-bottom: 2rem;">
                Votre estimation a été enregistrée avec succès. 
                Un de nos experts immobiliers pourrait vous contacter prochainement pour affiner cette estimation.
            </p>
            
            <div class="thank-you-actions" style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 3rem;">
                <button onclick="location.reload()" class="btn btn-primary" style="padding: 1rem 2rem;">
                    🏠 Nouvelle estimation
                </button>
                <button onclick="window.location.href='/'" class="btn btn-secondary" style="padding: 1rem 2rem;">
                    🏡 Retour à l'accueil
                </button>
            </div>
            
            <div style="margin-top: 3rem; padding: 2rem; background: #f8f9fa; border-radius: 10px;">
                <h3 style="margin-bottom: 1rem;">💡 Conseils pour vendre au meilleur prix</h3>
                <ul style="text-align: left; max-width: 600px; margin: 0 auto;">
                    <li>Réalisez les petits travaux de rafraîchissement</li>
                    <li>Mettez en valeur votre bien (home staging)</li>
                    <li>Choisissez le bon moment pour vendre</li>
                    <li>Faites appel à un professionnel pour vous accompagner</li>
                </ul>
            </div>
        </div>
    `;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Exposer les fonctions globalement pour les boutons onclick
window.nextStep = nextStep;
window.prevStep = prevStep;
window.closeModal = closeModal;
window.closeDpeModal = closeDpeModal;
window.selectPartnerOption = selectPartnerOption;