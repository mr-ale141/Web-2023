"use strict"

window.addEventListener('load', function () {

  const form = document.forms.main;
  const toggle = document.querySelector('#toggle');
  const userEmail = form.userEmail;
  const userPass = form.userPass;
  
  toggle.addEventListener("click", togglePass);
  addHandlerCompleted(userEmail);
  addHandlerCompleted(userPass);
  addHandlerKeyup(userEmail);
  addHandlerKeyup(userPass);
  form.addEventListener("submit", sendForm);

  async function sendForm(event) {
    event.preventDefault();

    let error = formValidate();
    const formInvalid = document.querySelector(".form__invalid");
    const formIncorrect = document.querySelector(".form__incorrect");
    formInvalid.classList.remove("notice_show");
    formIncorrect.classList.remove("notice_show");
    if (error === 0) {
      form.classList.add('_sending');

      const response = await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: userEmail.value,
          userPass: userPass.value
        })
      })

      if (response.ok) {
        formInvalid.classList.remove("notice_show");
        formIncorrect.classList.remove("notice_show");
        form.classList.remove('_sending');
        window.location.href = response.url;
      } else if (response.status === 401) {
        console.log("not authorizate");
        formIncorrect.classList.add("notice_show");
        userEmail.classList.add("form__input_invalid");
        userPass.classList.add("form__input_invalid");
        form.classList.remove('_sending');
      }
    } else {
      formInvalid.classList.add("notice_show");
    }
  }

  function formValidate() {
    let error = 0;
    const emailRequired = document.querySelector("#email_req");
    const passRequired = document.querySelector("#pass_req");
    const emailIncorrect = document.querySelector(".form__error");
    emailRequired.classList.remove("form__required_fixed");
    passRequired.classList.remove("form__required_fixed");
    emailIncorrect.classList.remove("form__error_fixed");
    emailRequired.classList.add("form__required_hide");
    passRequired.classList.add("form__required_hide");
    emailIncorrect.classList.add("form__error_hide");

    if (userEmail.value) {
      emailIncorrect.classList.add("form__error_hide");
      userEmail.classList.remove("form__input_invalid");

      if (! emailTest(userEmail)) {
        emailIncorrect.classList.remove("form__error_hide");
        userEmail.classList.add("form__input_invalid");
        error++;
      } else {
        emailIncorrect.classList.add("form__error_hide");
      }
    } else {
      emailIncorrect.classList.add("form__error_hide");
      emailRequired.classList.remove("form__required_hide");
      userEmail.classList.add("form__input_invalid");
      error++;
    }

    if (! passTest(userPass)) {
      passRequired.classList.remove("form__required_hide");
      userPass.classList.add("form__input_invalid");
      error++;
    } else {
      passRequired.classList.add("form__required_hide");
      userPass.classList.remove("form__input_invalid");
    }
    return error;
  }

  function emailTest(input) {
    return /\S+@\S+\.\S+/.test(input.value);
  }

  function passTest(input) {
    return /[A-Za-z0-9\s]{1,}/.test(input.value);
  }

  function addHandlerCompleted(input) {
    input.addEventListener("focus", inputFocus);
    input.addEventListener("blur", inputBlur);
  }

  function togglePass (e) {
    if (toggle.src.includes("static/img/admin/eye-off.png")) {
      toggle.src = "../static/img/admin/eye.png";
      userPass.setAttribute('type', 'password');
    } else {
      toggle.src = "../static/img/admin/eye-off.png";
      userPass.setAttribute('type', 'text');
    }
  }

  function inputFocus(e) {
    e.target.classList.add("form__input_completed");
  }

  function inputBlur(e) {
    if (e.target.value === "") {
      e.target.classList.remove("form__input_completed");
    }
  }

  function addHandlerKeyup(input) {
    input.addEventListener("keyup", inputKeyup);
  }

  function inputKeyup(e) {
    const formInvalid = document.querySelector(".form__invalid");
    const formIncorrect = document.querySelector(".form__incorrect");
    formInvalid.classList.remove("notice_show");
    formIncorrect.classList.remove("notice_show");
    const formRequired = e.target.parentElement.querySelector(".form__required");
    const formError = e.target.parentElement.querySelector(".form__error");
    if (e.target.value !== "") {
      e.target.classList.remove("form__input_invalid");
      formRequired.classList.add("form__required_fixed");
      if (formError) {
        formError.classList.add("form__error_fixed");
      }
    } else {
      e.target.classList.add("form__input_invalid");
      formRequired.classList.remove("form__required_hide");
      formRequired.classList.remove("form__required_fixed");
      if (formError) {
        formError.classList.add("form__error_hide");
      }
    }
  }
});
