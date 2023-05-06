"use strict"

window.addEventListener('load', function () {

  const form = document.forms.main;
  const toggle = document.querySelector('#toggle');
  const title = document.querySelector('#formTitle');
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

    let error = formValidate(form);
    
    if (error === 0) {
      if (checkNextElement(title, "form_invalid")) {
        title.nextElementSibling.remove();
      }
      form.classList.add('_sending');

      const response = await fetch('api/login', {
        method: 'POST',
        body: JSON.stringify({
          userEmail: userEmail.value,
          userPass: userPass.value
        })
      })

      if (response.ok) {
        if (checkNextElement(title, "form_invalid")) {
          title.nextElementSibling.remove();
        }
        form.classList.remove('_sending');
        window.location.href = response.url;
      } else if (response.status === 401) {
        console.log("not authorizate");
        if (!checkNextElement(title, "form_invalid")) {
          title.insertAdjacentHTML(
            "afterend",
            `<div class="form_invalid">
              Email or password is incorrect.
            </div>`
          );
          userEmail.classList.add("form__input_invalid");
          userPass.classList.add("form__input_invalid");
          form.classList.remove('_sending');
        }
      }
    } else {
      if (checkNextElement(title, "form_invalid")) {
        title.nextElementSibling.remove();
      }
      if (!checkNextElement(title, "form_invalid")) {
        title.insertAdjacentHTML(
          "afterend",
          `<div class="form_invalid">
            A-Ah! Check all fields,
          </div>`
        );
      }
    }
  }

  function formValidate(form) {
    let error = 0;
    
    if (userEmail.value) {
      if (checkNextElement(userEmail, "form__error")) {
        userEmail.nextElementSibling.remove();
      }
      userEmail.classList.remove("form__input_invalid");

      if (! emailTest(userEmail)) {
        if (! checkNextElement(userEmail, "form__error")) {
          userEmail.insertAdjacentHTML(
            "afterend",
            `<div class="form__error">
              Incorrect email format. Correct format is ****@**.***
            </div>`
          );
        }
        userEmail.classList.add("form__input_invalid");
        error++;
      } else {
        if (checkNextElement(userEmail, "form__error")) {
          userEmail.nextElementSibling.remove();
        }
      }
    } else {
      if (checkNextElement(userEmail, "form__error")) {
        userEmail.nextElementSibling.remove();
      }
      userEmail.insertAdjacentHTML(
        "afterend",
        `<div class="form__error">
            Email is required.
          </div>`
      );
      userEmail.classList.add("form__input_invalid");
      error++;
    }

    if (! passTest(userPass)) {
      if (checkNextElement(userPass, "form__error")) {
        userPass.nextElementSibling.remove();
      }
      userPass.insertAdjacentHTML(
        "afterend",
        `<div class="form__error">
        Password is required.
        </div>`
      );
      userPass.classList.add("form__input_invalid");
      error++;
    } else {
      if (checkNextElement(userPass, "form__error")) {
        userPass.nextElementSibling.remove();
      }
      userPass.classList.remove("form__input_invalid");
    }
    return error;
  }

  function checkNextElement(input, nameClassNextElement) {
    return input.nextElementSibling && input.nextElementSibling.classList.contains(nameClassNextElement)
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
    if (e.target.value !== "") {
      e.target.classList.remove("form__input_invalid");
    } else {
      e.target.classList.add("form__input_invalid");
    }
    if (checkNextElement(e.target, 'form__error')) {
      if (e.target.value !== "") {
        e.target.nextElementSibling.classList.add("form__error_fixed");
      } else {
        e.target.nextElementSibling.classList.remove("form__error_fixed");
      }
    }
  }
  
});
