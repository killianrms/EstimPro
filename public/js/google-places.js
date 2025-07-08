let autocomplete;
let selectedAddress = null;

function initAutocomplete() {
    const addressInput = document.getElementById('address');
    
    if (!addressInput) {
        console.warn('Address input not found, Google Places not initialized');
        return;
    }

    // Vérifier si Google Maps est disponible
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
        console.warn('Google Maps API not available, using fallback validation');
        return;
    }

    try {
        autocomplete = new google.maps.places.Autocomplete(addressInput, {
            types: ['address'],
            componentRestrictions: { country: 'fr' },
            fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
        });

        autocomplete.addListener('place_changed', function() {
            const place = autocomplete.getPlace();
            
            if (!place.geometry) {
                console.warn('Place geometry not available');
                return;
            }

            selectedAddress = {
                formatted_address: place.formatted_address,
                place_id: place.place_id,
                geometry: place.geometry,
                components: extractAddressComponents(place.address_components)
            };

            console.log('Selected address:', selectedAddress);
            
            const city = selectedAddress.components.city || selectedAddress.components.locality;
            const postalCode = selectedAddress.components.postal_code;
            
            if (city) {
                console.log(`City: ${city}, Postal Code: ${postalCode}`);
            }
        });

        addressInput.addEventListener('input', function() {
            if (this.value.length < 3) {
                selectedAddress = null;
            }
        });
    } catch (error) {
        console.error('Error initializing Google Places:', error);
    }
}

function extractAddressComponents(components) {
    const result = {};
    
    components.forEach(component => {
        const types = component.types;
        
        if (types.includes('street_number')) {
            result.street_number = component.long_name;
        }
        if (types.includes('route')) {
            result.route = component.long_name;
        }
        if (types.includes('locality')) {
            result.city = component.long_name;
            result.locality = component.long_name;
        }
        if (types.includes('administrative_area_level_2')) {
            result.department = component.long_name;
        }
        if (types.includes('administrative_area_level_1')) {
            result.region = component.long_name;
        }
        if (types.includes('postal_code')) {
            result.postal_code = component.long_name;
        }
        if (types.includes('country')) {
            result.country = component.long_name;
        }
    });
    
    return result;
}

function getAddressData() {
    return selectedAddress;
}

function validateAddress() {
    const addressInput = document.getElementById('address');
    const address = addressInput.value.trim();
    
    if (!address) {
        alert('Veuillez saisir une adresse');
        return false;
    }
    
    // Si Google Places n'est pas disponible ou si l'adresse n'a pas été sélectionnée via autocomplete
    if (!selectedAddress && typeof google !== 'undefined' && google.maps && google.maps.places) {
        const confirmInvalid = confirm(
            'L\'adresse saisie n\'a pas été validée par Google. ' +
            'Voulez-vous continuer avec cette adresse ?'
        );
        
        if (!confirmInvalid) {
            return false;
        }
        
        selectedAddress = {
            formatted_address: address,
            place_id: null,
            geometry: null,
            components: extractCityFromAddress(address)
        };
    } else if (!selectedAddress) {
        // Si Google Places n'est pas disponible, créer directement l'objet address
        selectedAddress = {
            formatted_address: address,
            place_id: null,
            geometry: null,
            components: extractCityFromAddress(address)
        };
    }
    
    return true;
}

function extractCityFromAddress(address) {
    const parts = address.split(',');
    const lastPart = parts[parts.length - 1].trim();
    
    const postalCodeMatch = lastPart.match(/(\d{5})/);
    const postalCode = postalCodeMatch ? postalCodeMatch[1] : null;
    
    let city = lastPart.replace(/\d{5}/, '').trim();
    
    const cityMappings = {
        'paris': 'Paris',
        'lyon': 'Lyon',
        'marseille': 'Marseille',
        'toulouse': 'Toulouse',
        'nice': 'Nice',
        'nantes': 'Nantes',
        'strasbourg': 'Strasbourg',
        'montpellier': 'Montpellier',
        'bordeaux': 'Bordeaux',
        'lille': 'Lille',
        'rennes': 'Rennes'
    };
    
    const cityLower = city.toLowerCase();
    Object.keys(cityMappings).forEach(key => {
        if (cityLower.includes(key)) {
            city = cityMappings[key];
        }
    });
    
    return {
        city: city,
        postal_code: postalCode
    };
}

window.initAutocomplete = initAutocomplete;