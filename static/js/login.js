"use strict"

document.addEventListener('DOMContentLoaded', function () {

  const mainForm = document.forms.main;
  const mainFormToggleIcon = document.getElementsByClassName('form__toggle')[0];
  const mainFormTitle = document.querySelector('#formTitle');
  const mainFormUserEmail = mainForm.userEmail;
  const mainFormUserPass = mainForm.userPass;
  
  mainFormToggleIcon.addEventListener("click", togglePass);
  
  mainFormUserEmail.addEventListener("focus", function (event) {
    mainFormUserEmail.classList.add("form__input_completed");
  });
  
  mainFormUserEmail.addEventListener("blur", function (event) {
    if (mainFormUserEmail.value === "") {
      mainFormUserEmail.classList.remove("form__input_completed");
    }
  });
  
  mainFormUserPass.addEventListener("focus", function (event) {
    mainFormUserPass.classList.add("form__input_completed");
  });
  
  mainFormUserPass.addEventListener("blur", function (event) {
    if (mainFormUserPass.value === "") {
      mainFormUserPass.classList.remove("form__input_completed");
    }
  });

  mainFormUserEmail.addEventListener('change', function (event) {
    if (mainFormUserEmail.nextElementSibling) {
      if (mainFormUserEmail.value !== "") {
        mainFormUserEmail.nextElementSibling.setAttribute('style', 'margin: 5px 0; color: #999999;');
        mainFormUserEmail.classList.remove("form__input_invalid");
      } else {
        mainFormUserEmail.nextElementSibling.setAttribute('style', 'margin: 5px 0; color: #E86961;');
        mainFormUserEmail.classList.add("form__input_invalid");
      }
    }
  });

  mainFormUserPass.addEventListener('change', function (event) {
    if (mainFormUserPass.nextElementSibling) {
      if (mainFormUserPass.value !== "") {
        mainFormUserPass.nextElementSibling.setAttribute('style', 'margin: 5px 0; color: #999999;');
        mainFormUserPass.classList.remove("form__input_invalid");
      } else {
        mainFormUserPass.nextElementSibling.setAttribute('style', 'margin: 5px 0; color: #E86961;');
        mainFormUserPass.classList.add("form__input_invalid");
      }
    }
  });
  
  mainForm.addEventListener("submit", sendForm);

  async function sendForm(event) {
    event.preventDefault();

    let error = formValidate(mainForm);
    
    if (error === 0) {
      if (mainFormTitle.nextElementSibling === document.getElementsByClassName("form_invalid")[0]) {
        mainFormTitle.nextElementSibling.remove();
      }
      mainForm.classList.add('_sending');

      const response = await fetch('admin', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: mainFormUserEmail.value,
          userPass: mainFormUserPass.value
        })
      })

      if (response.ok) {
        if (mainFormTitle.nextElementSibling === document.getElementsByClassName("form_invalid")[0]) {
          mainFormTitle.nextElementSibling.remove();
        }
        console.log(response);
        console.log(response.url);

        setTimeout(() => {
          mainForm.classList.remove('_sending');
          //перенаправление по response.url
          window.location.href = response.url;
        }, 1000);
        

      } else if (response.status == 404) {
        console.log("not authorizate");
        setTimeout(() => {
          if (mainFormTitle.nextElementSibling === mainFormUserEmail.parentElement) {
            mainFormTitle.insertAdjacentHTML(
              "afterend",
              `<div class="form_invalid">
                Email or password is incorrect.
              </div>`
            );
          }
          
          mainFormUserEmail.classList.add("form__input_invalid");
          mainFormUserPass.classList.add("form__input_invalid");

          mainForm.classList.remove('_sending');
        }, 1000);
      }
    } else {
      if (mainFormTitle.nextElementSibling === document.getElementsByClassName("form_invalid")[0]) {
        mainFormTitle.nextElementSibling.remove();
      }
      if (mainFormTitle.nextElementSibling === mainFormUserEmail.parentElement) {
        mainFormTitle.insertAdjacentHTML(
          "afterend",
          `<div class="form_invalid">
            A-Ah! Check all fields,
          </div>`
        );
      }
    }
  }

  function formValidate(mainForm) {
    let error = 0;
    const mainFormUserEmail = mainForm.userEmail;
    const mainFormUserPass = mainForm.userPass;
    
    if (mainFormUserEmail.value) {
      if (mainFormUserEmail.nextElementSibling === document.getElementsByClassName("form__error")[0]) {
        mainFormUserEmail.nextElementSibling.remove();
      }
      mainFormUserEmail.classList.remove("form__input_invalid");

      if (emailTest(mainFormUserEmail)) {
        if (!mainFormUserEmail.nextElementSibling) {
          mainFormUserEmail.insertAdjacentHTML(
            "afterend",
            `<div class="form__error">
              Incorrect email format. Correct format is ****@**.***
            </div>`
          );
        }
        mainFormUserEmail.classList.add("form__input_invalid");
        error++;
      } else {
        if (mainFormUserEmail.nextElementSibling === document.getElementsByClassName("form__error")[0]) {
          mainFormUserEmail.nextElementSibling.remove();
        }
      }
    } else {
      if (mainFormUserEmail.nextElementSibling) {
        mainFormUserEmail.nextElementSibling.remove();
      }
      mainFormUserEmail.insertAdjacentHTML(
        "afterend",
        `<div class="form__error">
            Email is required.
          </div>`
      );
      mainFormUserEmail.classList.add("form__input_invalid");
      error++;
    }

    if (passTest(mainFormUserPass)) {
      if (mainFormUserPass.nextElementSibling.classList.contains('form__error')) {
        mainFormUserPass.nextElementSibling.remove();
      }
      mainFormUserPass.insertAdjacentHTML(
        "afterend",
        `<div class="form__error">
        Password is required.
        </div>`
      );
      mainFormUserPass.classList.add("form__input_invalid");
      error++;
    } else {
      if (mainFormUserPass.nextElementSibling.classList.contains('form__error')) {
        mainFormUserPass.nextElementSibling.remove();
      }
      mainFormUserPass.classList.remove("form__input_invalid");
    }
    return error;

    function emailTest(input) {
      return !/\S+@\S+\.\S+/.test(input.value);
    }
    
    function passTest(input) {
      return !/[A-Za-z0-9\s]{1,}/.test(input.value);
    }
  }

  function togglePass (event) {
    if (mainFormToggleIcon.src.includes("static/img/admin/eye-off.png")) {
      mainFormToggleIcon.src = "../static/img/admin/eye.png";
      mainFormUserPass.setAttribute('type', 'password');
    } else {
      mainFormToggleIcon.src = "../static/img/admin/eye-off.png";
      mainFormUserPass.setAttribute('type', 'text');
    }
  }
  
});
