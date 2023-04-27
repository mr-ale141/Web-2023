"use strict"

document.addEventListener('DOMContentLoaded', function () {

  const mainForm = document.forms.main;
  const mainFormToggleIcon = document.getElementsByClassName('main-form__toggle-icon')[0];
  const mainFormTitle = document.querySelector('#formTitle');
  const mainFormUserEmail = mainForm.userEmail;
  const mainFormUserPass = mainForm.userPass;
  
  mainFormToggleIcon.addEventListener("click", togglePass);
  
  mainFormUserEmail.addEventListener("focus", function (event) {
    mainFormUserEmail.classList.add("main-form__item-input_completed");
  });
  
  mainFormUserEmail.addEventListener("blur", function (event) {
    if (mainFormUserEmail.value === "") {
      mainFormUserEmail.classList.remove("main-form__item-input_completed");
    }
  });
  
  mainFormUserPass.addEventListener("focus", function (event) {
    mainFormUserPass.parentElement.classList.add("main-form__item-input_completed");
  });
  
  mainFormUserPass.addEventListener("blur", function (event) {
    if (mainFormUserPass.value === "") {
      mainFormUserPass.parentElement.classList.remove("main-form__item-input_completed");
    }
  });
  
  mainForm.addEventListener("submit", sendForm);

  async function sendForm(event) {
    event.preventDefault();

    let error = formValidate(mainForm);
    
    if (error === 0) {
      if (mainFormTitle.nextElementSibling === document.getElementsByClassName("main-form__empty-error")[0]) {
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
        mainForm.classList.remove('_sending');
        if (mainFormTitle.nextElementSibling === document.getElementsByClassName("main-form__empty-error")[0]) {
          mainFormTitle.nextElementSibling.remove();
        }
        console.log(response);
        console.log(response.url);

        //перенаправление по response.url
        window.location.href = response.url;

      } else if (response.status == 404) {
        mainForm.classList.remove('_sending');
        console.log("not authorizate");
        if (mainFormTitle.nextElementSibling === mainFormUserEmail.parentElement) {
          mainFormTitle.insertAdjacentHTML(
            "afterend",
            `<div class="main-form__empty-error">
              Email or password is incorrect.
            </div>`
          );
        }
      }
    } else {
      if (mainFormTitle.nextElementSibling === document.getElementsByClassName("main-form__empty-error")[0]) {
        mainFormTitle.nextElementSibling.remove();
      }
      if (mainFormTitle.nextElementSibling === mainFormUserEmail.parentElement) {
        mainFormTitle.insertAdjacentHTML(
          "afterend",
          `<div class="main-form__empty-error">
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
      if (mainFormUserEmail.nextElementSibling === document.getElementsByClassName("main-form__empty-email")[0]) {
        mainFormUserEmail.nextElementSibling.remove();
      }
      mainFormUserEmail.classList.remove("main-form__item-input_invalid");

      if (emailTest(mainFormUserEmail)) {
        if (!mainFormUserEmail.nextElementSibling) {
          mainFormUserEmail.insertAdjacentHTML(
            "afterend",
            `<div class="main-form__email-error">
              Incorrect email format. Correct format is ****@**.***
            </div>`
          );
        }
        mainFormUserEmail.classList.add("main-form__item-input_invalid");
        error++;
      } else {
        if (mainFormUserEmail.nextElementSibling === document.getElementsByClassName("main-form__email-error")[0]) {
          mainFormUserEmail.nextElementSibling.remove();
        }
      }
    } else {
      if (mainFormUserEmail.nextElementSibling) {
        mainFormUserEmail.nextElementSibling.remove();
      }
      mainFormUserEmail.insertAdjacentHTML(
        "afterend",
        `<div class="main-form__empty-email">
            Email is required.
          </div>`
      );
      mainFormUserEmail.classList.add("main-form__item-input_invalid");
      error++;
    }

    if (passTest(mainFormUserPass)) {
      if (mainFormUserPass.parentElement.nextElementSibling) {
        mainFormUserPass.parentElement.nextElementSibling.remove();
      }
      mainFormUserPass.parentElement.insertAdjacentHTML(
        "afterend",
        `<div class="main-form__empty-pass">
        Password is required.
        </div>`
      );
      mainFormUserPass.parentElement.classList.add("main-form__item-input_invalid");
      error++;
    } else {
      if (mainFormUserPass.parentElement.nextElementSibling === document.getElementsByClassName("main-form__empty-pass")[0]) {
        mainFormUserPass.parentElement.nextElementSibling.remove();
      }
      mainFormUserPass.parentElement.classList.remove("main-form__item-input_invalid");
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
