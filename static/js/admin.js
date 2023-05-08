"use strict"

window.addEventListener('load', function () {
  const main = document.querySelector('main');
  const logo = document.querySelector('#logo');
  const exit = document.querySelector('#logout');
  const buttonPublish = document.querySelector('#submit');
  const noticeError = document.querySelector('#errorNotice');
  const noticeComlete = document.querySelector('#completeNotice');
  
  const inputTitle = document.querySelector('#title');
  const inputSubtitle = document.querySelector('#subtitle');
  const inputName = document.querySelector('#name');
  const inputDate = document.querySelector('#date');
  const inputContent = document.querySelector('#content');
  
  const inputIcon = document.querySelector('#icon');
  const inputImage = document.querySelector('#image');
  const inputShortImage = document.querySelector('#short-image');
  
  const titlePreviews = document.getElementsByClassName('preview-title');
  const subtitlePreviews = document.getElementsByClassName('preview-subtitle');
  const imagePreviews = document.getElementsByClassName('article__image');
  const shortImagePreviews = document.getElementsByClassName('post__image');
  const iconPreviews = document.getElementsByClassName('author__icon');
  const namePreviews = document.getElementsByClassName('author__name');
  const datePreviews = document.getElementsByClassName('author__date');
  const contentPreviews = document.getElementsByClassName('preview-content');

  let iconBase64, imageBase64, shortImageBase64;
  let limitIcon = 1 * 1024 * 1024; 
  let limitImage = 10 * 1024 * 1024;
  let limitShortImage = 5 * 1024 * 1024;

  logo.addEventListener('click', goHome);
  exit.addEventListener('click', logOut);

  addHandlerText(inputTitle, titlePreviews, 'required');
  addHandlerText(inputSubtitle, subtitlePreviews, 'required');
  addHandlerText(inputName, namePreviews, '');
  addHandlerText(inputDate, datePreviews, 'required');
  addHandlerText(inputContent, contentPreviews, 'required');

  let eventFocus = new Event('focus');
  inputTitle.dispatchEvent(eventFocus);

  addHandlerFile(inputIcon, iconPreviews, '', limitIcon);
  addHandlerFile(inputImage, imagePreviews, 'required', limitImage);
  addHandlerFile(inputShortImage, shortImagePreviews, 'required', limitShortImage);

  buttonPublish.addEventListener('click', formSend);

  async function formSend(e) {
    main.classList.add('_sending');

    let eventKeyUp = new Event('keyup');
    let eventChange = new Event('change');

    const textInputs = document.getElementsByClassName('form__item');

    for (let index = 0; index < textInputs.length; index++) {
      if (textInputs[index].querySelector('input')) {
        textInputs[index].querySelector('input').dispatchEvent(eventKeyUp);
      } else if (textInputs[index].querySelector('textarea')) {
        textInputs[index].querySelector('textarea').dispatchEvent(eventKeyUp);
      }
    }

    const fileInputs = document.getElementsByClassName('form__file');
    for (let index = 0; index < fileInputs.length; index++) {
      fileInputs[index].querySelector('input').dispatchEvent(eventChange);
    }
    
    const requiredInputs = document.getElementsByClassName('form__required');
    let errors = 0;

    for (let index = 0; index < requiredInputs.length; index++) {
      if (! requiredInputs[index].classList.contains('form__required_hide')) {
        errors++;
      }
    }

    if (errors) {
      noticeError.classList.remove('empty-error_hide');
      noticeComlete.classList.add('form-complete_hide');
      main.classList.remove('_sending');
    } else {
      let date = new Date(inputDate.value);
      let dateString = date.toLocaleDateString('en-US');
      let iconPreview = inputIcon.parentElement.querySelector('.form__preview');
      let imagePreview = inputImage.parentElement.querySelector('.form__preview');
      let shortImagePreview = inputShortImage.parentElement.querySelector('.form__preview');
      if (! inputIcon.parentElement.querySelector('.form__limit').classList.contains('form__limit_error')) {
        iconBase64 = iconPreview.querySelector('img').getAttribute('src');
      }
      imageBase64 = imagePreview.querySelector('img').getAttribute('src');
      shortImageBase64 = shortImagePreview.querySelector('img').getAttribute('src');

      let jsonData = {
        Title: inputTitle.value,
        Subtitle: inputSubtitle.value,
        Name: inputName.value,
        Icon: iconBase64,
        Date: dateString,
        Image: imageBase64,
        ShortImage: shortImageBase64,
        Content: inputContent.value
      };

      console.log(jsonData);
      /*
      const response = await fetch('/admin', {
        method: 'POST',
        body: JSON.stringify(jsonData)
      });

      if (response.ok) {
        noticeError.classList.add('empty-error_hide');
        noticeComlete.classList.remove('form-complete_hide');
        main.classList.remove('_sending');
      } else {
        noticeError.classList.remove('empty-error_hide');
        noticeComlete.classList.add('form-complete_hide');
        main.classList.remove('_sending');
      }
      */
      main.classList.remove('_sending');
      noticeError.classList.add('empty-error_hide');
      noticeComlete.classList.remove('form-complete_hide');
    }
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

  function addHandlerText(input, previews, required) {
    input.addEventListener("focus", () => {
      input.classList.add("form__text_completed");
    });

    input.addEventListener("blur", () => {
      if (input.value === "") {
        input.classList.remove("form__text_completed");
      }
    });
    
    input.addEventListener('keyup', () => {
      const reqNotice = input.parentElement.querySelector('.form__required');
      if (input.value === "") {
        if (required === 'required') {
          reqNotice.classList.remove("form__required_hide");
          input.classList.add("form__text_empty");
        }
        for (let index = 0; index < previews.length; index++) {
          let defaultStr = "Enter " + input.parentElement.querySelector('label').textContent;
          previews[index].textContent = defaultStr;
        }
      } else {
        if (required === 'required') {
          reqNotice.classList.add("form__required_hide");
          input.classList.remove("form__text_empty");
        }
        for (let index = 0; index < previews.length; index++) {
          previews[index].textContent = "";
          previews[index].textContent = input.value;
        }
      }
    });
  }
  
  function addHandlerFile(input, previews, required, limit) {
    const limitNotice = input.parentElement.querySelector('.form__limit');
    const reqNotice = input.parentElement.querySelector('.form__required');
    const formPreview = input.parentElement.querySelector('.form__preview');
    const formMenu = input.parentElement.querySelector('.form__menu');
    const formUpload = input.parentElement.querySelector('.form__upload');
    const formRemove = input.parentElement.querySelector('.form__remove');
    const formSpan = input.parentElement.querySelector('span');

    formUpload.addEventListener('click', () => {
      let eventClick = new Event('click');
      input.dispatchEvent(eventClick);
    });

    formRemove.addEventListener('click', () => {
      input.value = "";
      let eventChange = new Event('change');
      input.dispatchEvent(eventChange);
    });
    
    input.addEventListener('change', () => {
      if (input.value === "") {
        if (required === 'required') {
          reqNotice.classList.remove("form__required_hide");
          formPreview.classList.add("form__preview_empty");
        }
        formMenu.classList.add("form__menu_hide");
        formPreview.querySelector('img').setAttribute('src', "");
        formPreview.querySelector('img').classList.add('img-prev_hide');
        formSpan.classList.remove('form__span_hide');
        limitNotice.classList.remove("form__limit_error");
        limitNotice.classList.remove("form__limit_hide");
        for (let index = 0; index < previews.length; index++) {
          previews[index].querySelector('img').setAttribute('src', "");
          previews[index].querySelector('img').classList.add('img-prev_hide');
        }
      } else {
        let reader = new FileReader();
        reader.onload = (e) => {
          let imgBase64 = e.target.result;
          formSpan.classList.add('form__span_hide');
          formPreview.querySelector('img').setAttribute('src', imgBase64);
          formPreview.querySelector('img').classList.remove('img-prev_hide');
          formMenu.classList.remove("form__menu_hide");
          for (let index = 0; index < previews.length; index++) {
            previews[index].querySelector('img').setAttribute('src', imgBase64);
            previews[index].querySelector('img').classList.remove('img-prev_hide');
          }
        }
        reader.onerror = (e) => {
          console.log("Error in event: " + e);
          alert("File reading error!");
        }
        reader.readAsDataURL(input.files[0]);

        if (input.files[0].size > limit) {
          if (required === 'required') {
            reqNotice.classList.remove("form__required_hide");
            formPreview.classList.add("form__preview_empty");
          }
          limitNotice.classList.add("form__limit_error");
          limitNotice.classList.remove("form__limit_hide");
        } else {
          if (required === 'required') {
            reqNotice.classList.add("form__required_hide");
            formPreview.classList.remove("form__preview_empty");
          }
          limitNotice.classList.remove("form__limit_error");
          limitNotice.classList.add("form__limit_hide");
        }
      }
    });
  }
});