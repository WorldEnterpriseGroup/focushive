//constraints which are applied on the form field
let constraints = {
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
    interest: {
        presence: true
    }
};

var inputs = document.querySelectorAll("input.form-control, textarea, select.form-control");
inputs.forEach( input => {
        input.addEventListener("change", function (ev) {
            var errors = validate(form, constraints) || {};
            showErrorsForInput(this, errors[this.name])
        });}
)


var form = document.querySelector("form#contactus");
form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    handleFormSubmit(form);
});

//it handles the form submit
function handleFormSubmit(form, input) {
    // validate the form against the constraints
    var errors = validate(form, constraints);
    // then we update the form to reflect the results
    showErrors(form, errors || {});
    if (!errors) {
        showSuccess();
    } else {
        swal.fire({
            title: "Form Error",
            text: "Please ensure all fields are correct!",
            type: "error",
            confirmButtonText: "Ok",
        })
    }
}

function showErrors(form, errors) {
    // We loop through all the inputs and show the errors for that input
    form.querySelectorAll("input.form-control, select.form-control").forEach(function (input) {
        showErrorsForInput(input, errors && errors[input.name]);
    });
}

function showErrorsForInput(input, errors) {
    var formGroup = closestParent(input, "form-group")
    resetFormGroup(formGroup);
    if (errors) {
        formGroup.classList.add("has-error");
        errors.forEach(function (error) {
            addError(formGroup, error);
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

// function to remove errors from the form
function resetFormGroup(formGroup) {
    formGroup.classList.remove("has-error");
    formGroup.classList.remove("has-success");
    formGroup.querySelectorAll(".custom-error").forEach(function (el) {
        el.remove();
    });
}

//logic to add error into the form
function addError(formGroup, error) {
    let errorMessage = document.createElement('small');
    errorMessage.style.position = 'absolute';
    errorMessage.style.color = '#ea205a';
    errorMessage.innerText = error;
    errorMessage.classList.add('custom-error');
    let isSelect = formGroup.querySelector('.tg-select');
    if(isSelect){
        errorMessage.classList.add('select')
        isSelect.appendChild(errorMessage);
    }else{
        formGroup.appendChild(errorMessage);
    }
}

//function to reset the form
function resetForm(){
    document.querySelectorAll('div.form-group.has-success').forEach(formGroup => {
        formGroup.classList.remove('has-success');
    })
    document.querySelectorAll('#contactus input.form-control, select.form-control, textarea').forEach(input => {
        input.value = '';
    })
}

// this function handles success if form is valid
function showSuccess() {
    grecaptcha.ready(function () {
        grecaptcha.execute("6LcHIYcUAAAAAPnqH0iBwnDeFma0mWAMJKJHAoEO").then(function (token) {
            document.querySelector('input[name=token]').value = token;
            let a = $('form#contactus');
            $.ajax({
                type: a.attr('method'),
                url: a.attr('action'),
                data: a.serialize(),
                success: function (data, textStatus, xhr) {
                    console.log(xhr.status)
                    if (xhr.status === 200) {
                        swal.fire({
                            title: "Thank You!",
                            type: "success",
                            confirmButtonText: 'Ok'
                        });
                        resetForm();
                    } else {
                        swal.fire({
                            title: "Some Error Occurred",
                            type: "error",
                            confirmButtonText: 'Ok'
                        });
                    }
                },
                error: function (data) {
                    swal.fire({
                        title: "An unexpected Error Occurred",
                        type: "error",
                        confirmButtonText: 'Ok'
                    })
                },
            })
        });
    });
}
