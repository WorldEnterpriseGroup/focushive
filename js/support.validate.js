var constraints = {
    firstname: {
        presence: true,
        length: {
            minimum: 2,
            maximum: 50
        }
    },
    lastname: {
        presence: true,
        length: {
            minimum: 2,
            maximum: 50
        }
    },
    email: {
      presence: true,
      email: true
    },
    tel: {
        presence: true,
        format: {
            pattern: "[0-9]+",
            message: "can only contain digits"
        }
    },
    location: {
      presence: true,
    },
    interest:{
        presence: true
    }
  };

  var inputs = document.querySelectorAll("input.form-control, textarea, select.form-control")
    for (var i = 0; i < inputs.length; ++i) {
        inputs.item(i).addEventListener("change", function (ev) {
            var errors = validate(form, constraints) || {};
            showErrorsForInput(this, errors[this.name])
        });
    }

  var form = document.querySelector("form#contactus");
    form.addEventListener("submit", function (ev) {
        ev.preventDefault();
        handleFormSubmit(form);
    });

  function handleFormSubmit(form, input) {
        // validate the form against the constraints
        var errors = validate(form, constraints);
        // then we update the form to reflect the results
        showErrors(form, errors || {});
        if (!errors) {
            showSuccess();
        } else{
            swal({
                title: "Form Error",
                text: "Please ensure all fields are is checked",
                icon: "error",
                button: "Ok",
            })
        }
    }

  function showErrors(form, errors) {
        // We loop through all the inputs and show the errors for that input
        form.querySelectorAll("input.form-control, select.form-control").forEach( function (input) {
            showErrorsForInput(input, errors && errors[input.name]);
        });
    }

    function showErrorsForInput(input, errors) {
        var formGroup = closestParent(input, "form-group")
        var messages = formGroup.querySelector(".custom-alert");
        resetFormGroup(formGroup);
        if (errors) {
            formGroup.classList.add("has-error");
            errors.forEach(function (error) {

                addError(messages, error);
            });
        } else {
            formGroup.classList.add("has-success");
        }
    }

    // Recusively finds the closest parent that has the specified class
    function closestParent(child, className) {
        if (!child || child == document) {
            return null;
        }
        if (child.classList.contains(className)) {
            return child;
        } else {
            return closestParent(child.parentNode, className);
        }
    }

    function resetFormGroup(formGroup) {
        // Remove the success and error classes
        formGroup.classList.remove("has-error");
        formGroup.classList.remove("has-success");
        // and remove any old messages
        formGroup.querySelectorAll(".custom-error").forEach(function (el) {
            el.innerText = ''
            el.classList.remove('custom-error');
        });
    }


    function addError(messages, error) {
        messages.classList.add('custom-error');
        messages.innerText = error;
    }

    function showSuccess() {
        if (grecaptcha.getResponse() == "") {
            swal({
                title: "Recaptcha Error",
                text: "Please ensure recaptcha is checked",
                icon: "error",
                button: "Ok",
            });
        } else{
            var form_data = new FormData();
            document.querySelectorAll('#contactus input[name],select[name],textbox[name]').forEach(input => {
                form_data.append(input.name,  input.value);
            })
            console.log(form_data);
            fetch('https://prod-01.eastus.logic.azure.com:443/workflows/8a428578d58348b6bb79faadd105be3c/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=cNjnAoDbYO6HcBStQnAxY41C72UuqhMy18_KjvpAXr8', {
                    method: 'post',
                    body: form_data
                }).then(res => {
                    swal("Good job!", "success");
                })
            }
    }