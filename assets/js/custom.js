document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.querySelector('.php-email-form');

    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const dataObject = {};

            for (let [name, value] of formData.entries()) {
                if (name === 'phone' || name.includes('slider')) {
                    dataObject[name] = parseFloat(value);
                }
                else {
                    dataObject[name] = value;
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
            }
        });
    }
});