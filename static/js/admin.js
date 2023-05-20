"use strict"

const keyTitle       = "Title";
const keySubtitle    = "Subtitle";
const keyAuthorName  = "AuthorName";
const keyAuthorIcon  = "AuthorIcon";
const keyPublishDate = "PublishDate";
const keyHeroImage   = "HeroImage";
const keyShortImage  = "ShortImage";
const keyContent     = "Content";

const formData = new Map([
  [keyTitle,       ""],
  [keySubtitle,    ""],
  [keyAuthorName,  ""],
  [keyAuthorIcon,  ""],
  [keyPublishDate, ""],
  [keyHeroImage,   ""],
  [keyShortImage,  ""],
  [keyContent,     ""],
]);

let required = true;
let notRequired = false;

const formRequired = new Map([
  [keyTitle,       required],
  [keySubtitle,    required],
  [keyAuthorName,  notRequired],
  [keyAuthorIcon,  notRequired],
  [keyPublishDate, required],
  [keyHeroImage,   required],
  [keyShortImage,  required],
  [keyContent,     required],
]);

const limitIcon       = 1  * 1024 * 1024;
const limitImage      = 10 * 1024 * 1024;
const limitShortImage = 5  * 1024 * 1024;

window.addEventListener('load', windowLoaded);

const inputTitle      = document.getElementById(keyTitle);
const inputSubtitle   = document.getElementById(keySubtitle);
const inputName       = document.getElementById(keyAuthorName);
const inputIcon       = document.getElementById(keyAuthorIcon);
const inputDate       = document.getElementById(keyPublishDate);
const inputImage      = document.getElementById(keyHeroImage);
const inputShortImage = document.getElementById(keyShortImage);
const inputContent    = document.getElementById(keyContent);

function windowLoaded(e) {
  const logo = document.querySelector('#logo');
  logo.addEventListener('click', goHome);

  const exit = document.querySelector('#logout');
  exit.addEventListener('click', logOut);

  const titlePreviews = document.getElementsByClassName('preview-title');
  addHandlerText(inputTitle, titlePreviews, keyTitle);

  const subtitlePreviews = document.getElementsByClassName('preview-subtitle');
  addHandlerText(inputSubtitle, subtitlePreviews, keySubtitle);
  
  const namePreviews = document.getElementsByClassName('author__name');
  addHandlerText(inputName, namePreviews, keyAuthorName);
  
  const iconPreviews = document.getElementsByClassName('icon-display');
  addHandlerFile(inputIcon, iconPreviews, limitIcon, keyAuthorIcon);

  const datePreviews = document.getElementsByClassName('author__date');
  addHandlerText(inputDate, datePreviews, keyPublishDate);

  const imagePreviews = document.getElementsByClassName('image-display');
  addHandlerFile(inputImage, imagePreviews, limitImage, keyHeroImage);
  
  const shortImagePreviews = document.getElementsByClassName('short-image-display');
  addHandlerFile(inputShortImage, shortImagePreviews, limitShortImage, keyShortImage);
  
  const contentPreviews = document.getElementsByClassName('preview-content');
  addHandlerText(inputContent, contentPreviews, keyContent);

  let eventFocus = new Event('focus');
  inputTitle.dispatchEvent(eventFocus);

  const buttonPublish = document.querySelector('#submit');
  buttonPublish.addEventListener('click', formSend);
}

async function formSend(e) {
  const main = document.querySelector('main');
  main.classList.add('_sending');
  let errors = formValidate();
  if (errors) {
    showFormError();
    main.classList.remove('_sending');
  } else {
    let date = new Date(formData.get(keyPublishDate));
    let dateString = date.toLocaleDateString('en-US');
    let jsonData = {
      Title:          formData.get(keyTitle),
      Subtitle:       formData.get(keySubtitle),
      Name:           formData.get(keyAuthorName),
      Icon:           formData.get(keyAuthorIcon),
      IconName:       (formData.get(keyAuthorIcon) === "") ? "" : inputIcon.files[0].name,
      Date:           dateString,
      Image:          formData.get(keyHeroImage),
      ImageName:      inputImage.files[0].name,
      ShortImage:     formData.get(keyShortImage),
      ShortImageName: inputShortImage.files[0].name,
      Content:        formData.get(keyContent)
    };

    console.log(jsonData);
    
    const response = await fetch('/api/post', {
      method: 'POST',
      body: JSON.stringify(jsonData)
    });

    if (response.ok) {
      showFormComplete();
    } else {
      showFormError();
    }
    main.classList.remove('_sending');
  }
}

function showFormComplete() {
  const noticeError = document.querySelector('#errorNotice');
  const noticeComlete = document.querySelector('#completeNotice');
  noticeError.classList.add('empty-error_hide');
  noticeComlete.classList.remove('form-complete_hide');
}

function showFormError() {
  const noticeError = document.querySelector('#errorNotice');
  const noticeComlete = document.querySelector('#completeNotice');
  noticeError.classList.remove('empty-error_hide');
  noticeComlete.classList.add('form-complete_hide');
}

function formValidate() {
  let errors = 0;
  let eventChange = new Event('change');
  let eventKeyup = new Event('keyup');
  formRequired.forEach(inputValidate);
  function inputValidate(required, key) {
    if (required) {
      if (! formData.get(key)) {
        const input = document.getElementById(key);
        input.dispatchEvent(eventChange);
        input.dispatchEvent(eventKeyup);
        errors++;
      }
    }
  }
  return errors;
}

function goHome(e) {
  window.location.href = '/home';
}

async function logOut(e) {
  const response = await fetch('/logout')
  if (response.ok) {
    window.location.href = response.url;
  }
}

function addHandlerText(input, previews, key) {
  let required = formRequired.get(key);
  input.addEventListener("focus", () => {
    input.classList.add("form__text_completed");
  });

  input.addEventListener("blur", () => {
    if (input.value === "") {
      input.classList.remove("form__text_completed");
    }
  });
  
  input.addEventListener('keyup', () => {
    if (input.value === "") {
      formData.delete(key);
      if (required) {
        showInputTextEmpty(input);
      }
      let defaultStr = "Enter " + input.parentElement.querySelector('label').textContent;
      showTextPreviews(previews, defaultStr);
    } else {
      formData.set(key, input.value);
      if (required) {
        showInputTextComplete(input);
      }
      showTextPreviews(previews, input.value);
    }
  });
}

function addHandlerFile(input, previews, limit, key) {
  let required = formRequired.get(key);
  const formUpload = input.parentElement.querySelector('.form__upload');
  formUpload.addEventListener('click', () => {
    input.click();
  });
  
  const formRemove = input.parentElement.querySelector('.form__remove');
  formRemove.addEventListener('click', () => {
    input.value = "";
    let eventChange = new Event('change');
    input.dispatchEvent(eventChange);
  });
  
  input.addEventListener('change', () => {
    if (input.value === "") {
      formData.delete(key);
      if (required) {
        showInputFileEmpty(input);
      }
      hideMenu(input);
      hideLimitError(input);
      let imgBase64 = "";
      showFilePreviews(previews, imgBase64);
    } else {
      if (input.files[0].size > limit) {
        if (required) {
          showInputFileEmpty(input);
        }
        showLimitError(input);
        showMenu(input);
      } else {
        let reader = new FileReader();
        reader.onload = (e) => {
          let imgBase64 = e.target.result;
          formData.set(key, imgBase64);
          showMenu(input);
          showFilePreviews(previews, imgBase64);
        }
        reader.onerror = (e) => {
          console.log("Error in event: " + e);
          alert("File reading error!");
        }
        reader.readAsDataURL(input.files[0]);
        if (required) {
          showInputFileComlete(input);
        }
        hideLimitError(input);
        hideLimit(input);
      }
    }
  });
}

function showUpload(input) {
  const formSpan = input.parentElement.querySelector('.form__span');
  formSpan.classList.remove("form__span_hide");
}

function hideUpload(input) {
  const formSpan = input.parentElement.querySelector('.form__span');
  formSpan.classList.add("form__span_hide");
}

function showLimit(input) {
  const limitNotice = input.parentElement.querySelector('.form__limit');
  limitNotice.classList.remove("form__limit_hide");
}

function hideLimit(input) {
  const limitNotice = input.parentElement.querySelector('.form__limit');
  limitNotice.classList.add("form__limit_hide");
}

function showLimitError(input) {
  showLimit(input);
  const limitNotice = input.parentElement.querySelector('.form__limit');
  limitNotice.classList.add("form__limit_error");
}

function hideLimitError(input) {
  showLimit(input);
  const limitNotice = input.parentElement.querySelector('.form__limit');
  limitNotice.classList.remove("form__limit_error");
}

function showMenu(input) {
  hideUpload(input);
  const formMenu = input.parentElement.querySelector('.form__menu');
  formMenu.classList.remove("form__menu_hide");
}

function hideMenu(input) {
  const formMenu = input.parentElement.querySelector('.form__menu');
  formMenu.classList.add("form__menu_hide");
  showUpload(input);
}

function showInputFileEmpty(input) {
  const reqNotice = input.parentElement.querySelector('.form__required');
  const formPreview = input.parentElement.querySelector('.form__preview');
  reqNotice.classList.remove("form__required_hide");
  formPreview.classList.add("form__preview_empty");
}

function showInputFileComlete(input) {
  const reqNotice = input.parentElement.querySelector('.form__required');
  const formPreview = input.parentElement.querySelector('.form__preview');
  reqNotice.classList.add("form__required_hide");
  formPreview.classList.remove("form__preview_empty");
}

function showInputTextEmpty(input) {
  const reqNotice = input.parentElement.querySelector('.form__required');
  reqNotice.classList.remove("form__required_hide");
  input.classList.add("form__text_empty");
}

function showInputTextComplete(input) {
  const reqNotice = input.parentElement.querySelector('.form__required');
  reqNotice.classList.add("form__required_hide");
  input.classList.remove("form__text_empty");
}

function showFilePreviews(previews, imgBase64) {
  for (let index = 0; index < previews.length; index++) {
    previews[index].querySelector('img').setAttribute('src', imgBase64);
    if (imgBase64 !== "") {
      previews[index].querySelector('img').classList.remove('img-prev_hide');
    } else {
      previews[index].querySelector('img').classList.add('img-prev_hide');
    }
  }
}

function showTextPreviews(previews, content) {
  for (let index = 0; index < previews.length; index++) {
    previews[index].textContent = content;
  }
}