document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.php-email-form');

    const formFields = contactForm.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    fieldValidation(formFields);

    if(contactForm) {
        formValidation(contactForm);

        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const dataObject = {};

            for (let [fieldName, value] of formData.entries()) {
                if (fieldName.includes('slider')) {
                    dataObject[fieldName] = parseFloat(value);
                } else if(fieldName === 'phone') {
                    dataObject[fieldName] = '+370 ' + value;
                } else {
                    dataObject[fieldName] = value;
                }
            }

            console.log('Formos duomenys:');
            console.log(dataObject);

            const outputDiv = document.getElementById('form-data-output');
            const outputPre = document.getElementById('form-data-pre');
            const rankDiv = document.getElementById('form-data-rank');
            const rankPre = document.getElementById('form-data-rank-pre');
            const successMessage = document.getElementById('success-message');

            const rankAverage = (dataObject['first-slider'] + dataObject['second-slider'] + dataObject['third-slider']) / 3;

            if(outputDiv && outputPre && rankDiv && rankPre && successMessage) {
                outputPre.textContent = 'Vardas: ' + dataObject['name'] + '\n' +
                                    'Pavardė: ' + dataObject['last-name'] + '\n' +
                                    'El. paštas: ' + dataObject['email'] + '\n' +
                                    'Tel. numeris: ' + dataObject['phone'] + '\n';
                outputDiv.style.display = 'block';
                rankPre.textContent = dataObject['name'] + ' ' + dataObject['last-name'] + ': ' + rankAverage.toFixed(2);
                rankDiv.style.display = 'block';
                successMessage.style.display = 'block';
                contactForm.reset();

                formFields.forEach(field => {
                    if (field.id === 'phone') {
                        field.parentNode.classList.remove('form-valid-border');
                    } else {
                        field.classList.remove('form-valid-border');
                    }
                });
            }
        });
    }
});

function formValidation(form) {
    form.addEventListener('input', () => handleFormValidation(form));
}

function fieldValidation(formFields) {
    formFields.forEach(field => {
        field.addEventListener('input', () => handleFieldValidation(field));
        field.addEventListener('blur', () => handleFieldValidation(field));
    });
}

function handleFormValidation(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const formFields = form.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
    let formValid = true;
    if(form.querySelector('.form-error')) {
        formValid = false;
    }
    formFields.forEach(field => {
        if(!isNotEmpty(field.value)) {
            formValid = false;
        }
    });
    submitButton.disabled = !formValid;
    if(formValid) {
        submitButton.classList.remove('submit-button-disabled');
    } else {
        submitButton.classList.add('submit-button-disabled');
    }
}

function handleFieldValidation(field) {
    let fieldValid = true;
    let errorMessage = '';
    if(!isNotEmpty(field.value)) {
        fieldValid = false;
        errorMessage = 'Skiltis turi būti užpildyta';
    } else if(field.id === 'name' || field.id === 'last-name') {
        if(!isValidName(field.value)) {
            fieldValid = false;
            errorMessage = 'Galimos tik raidės';
        }
    } else if(field.id === 'email') {
        if(!isValidEmail(field.value)) {
            fieldValid = false;
            errorMessage = 'Netinkamas el. pašto formatas';
        }
    } else if(field.id === 'phone') {
        formatPhoneInput(field);
        if(!isValidPhone(field.value)) {
            fieldValid = false;
            errorMessage = 'Netinkamas telefono numerio formatas';
        }
    }

    if(!fieldValid) {
        if(field.id === 'phone') {
            showError(field.parentNode, errorMessage);
        } else {
            showError(field, errorMessage);
        }
    } else {
        if(field.id === 'phone') {
            clearError(field.parentNode);
        } else {
            clearError(field);
        }
    }
}

function isValidPhone(phone) {
    const phonePattern = /^\d{3}\s\d{5}$/;
    return phonePattern.test(phone);
}

function isNotEmpty(value) {
    return value.trim() !== '';
}

function isValidName(name) {
    return !(/\d/.test(name));
}

function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
}

function showError(field, message) {
    let errorDiv = field.parentNode.querySelector('.form-error');
    if(errorDiv) {
        errorDiv.innerText = message;
        return;
    }
    errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.innerText = message;
    field.parentNode.insertBefore(errorDiv, field.nextSibling);
    field.classList.remove('form-valid-border');
    field.classList.add('form-error-border');
}

function clearError(field) {
    let errorDiv = field.parentNode.querySelector('.form-error');
    if(errorDiv) {
        errorDiv.remove();
        field.classList.remove('form-error-border');
    }
    field.classList.add('form-valid-border');
}

function formatPhoneInput(input) {
    input.value = input.value.replace(/[^0-9]/g, '');

    if(input.value.length > 3 && !input.value.includes(' ')) {
        input.value = input.value.slice(0, 3) + ' ' + input.value.slice(3);
    } else if(input.value.length === 4 && input.value[3] === ' ') {
        input.value = input.value.trim();
    }
}