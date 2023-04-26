const mainForm = document.forms.main;

const mainFormTitle = document.querySelector('#formTitle');
const mainFormUserEmail = mainForm.userEmail;
const mainFormUserPass = mainForm.userPass;
const mainFormToggleIcon = document.getElementsByClassName('main-form__toggle-icon')[0];

mainFormToggleIcon.addEventListener("click", function (event) {
  if (mainFormToggleIcon.src.includes("static/img/admin/eye-off.png")) {
    mainFormToggleIcon.src = "../static/img/admin/eye.png";
    mainFormUserPass.setAttribute('type', 'password');
  } else {
    mainFormToggleIcon.src="../static/img/admin/eye-off.png";
    mainFormUserPass.setAttribute('type', 'text');
  }
});

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

mainForm.addEventListener("submit", function (event) {
  if (mainFormUserEmail.value) {
    if (mainFormUserEmail.nextElementSibling === document.getElementsByClassName("main-form__empty-email")[0]) {
      mainFormUserEmail.nextElementSibling.remove();
    }
    mainFormUserEmail.classList.remove("main-form__item-input_invalid");
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
  }

  if (mainFormUserPass.value) {
    if (mainFormUserPass.nextElementSibling === document.getElementsByClassName("main-form__empty-pass")[0]) {
      mainFormUserPass.nextElementSibling.remove();
    }
    mainFormUserPass.classList.remove("main-form__item-input_invalid");
  } else {
    if (mainFormUserPass.nextElementSibling) {
      mainFormUserPass.nextElementSibling.remove();
    }
    mainFormUserPass.insertAdjacentHTML(
      "afterend",
      `<div class="main-form__empty-pass">
          Password is required.
        </div>`
    );
    mainFormUserPass.classList.add("main-form__item-input_invalid");
  }
  
  if (!mainFormUserEmail.value || !mainFormUserPass.value) {
    if (mainFormTitle.nextElementSibling === mainFormUserEmail.parentElement) {
      mainFormTitle.insertAdjacentHTML(
        "afterend",
        `<div class="main-form__empty-error">
          A-Ah! Check all fields,
        </div>`
      );
    }
  } else {
    if (mainFormTitle.nextElementSibling === document.getElementsByClassName("main-form__empty-error")) {
      mainFormTitle.nextElementSibling.remove();
    }
  }

  if (emailTest(mainFormUserEmail)) {
    if (!mainFormUserEmail.nextElementSibling) {
      mainFormUserEmail.insertAdjacentHTML(
        "afterend",
        `<div class="main-form__email-error">
          Incorrect email format. Correct format is ****@**.***
        </div>`
      );
      mainFormUserEmail.classList.add("main-form__item-input_invalid");
    }
    event.preventDefault();
  } else {
    if (mainFormUserEmail.nextElementSibling === document.getElementsByClassName("main-form__email-error")[0]) {
      mainFormUserEmail.nextElementSibling.remove();
    }
  }

  if (passTest(mainFormUserPass)) {
    event.preventDefault();
  }
});

function emailTest(input) {
  return !/\S+@\S+\.\S+/.test(input.value);
}

function passTest(input) {
  return !/[A-Za-z0-9\s]{1,}/.test(input.value);
}
