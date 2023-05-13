"use strict"

window.addEventListener('load', function () {
  const inputTitle = document.querySelector('#title');
  const inputSubtitle = document.querySelector('#subtitle');
  const inputName = document.querySelector('#name');
  const inputIcon = document.querySelector('#icon');
  const inputDate = document.querySelector('#date');
  const inputImage = document.querySelector('#image');
  const inputShortImage = document.querySelector('#short-image');
  const inputContent = document.querySelector('#content');
  
  const formData = new Map([
    [getKeyInputText(inputTitle),      ""],
    [getKeyInputText(inputSubtitle),   ""],
    [getKeyInputText(inputName),       ""],
    [getKeyInputFile(inputIcon),       ""],
    [getKeyInputText(inputDate),       ""],
    [getKeyInputFile(inputImage),      ""],
    [getKeyInputFile(inputShortImage), ""],
    [getKeyInputText(inputContent),    ""],
  ]);

  let required = true;
  let notRequired = false;
  const formRequired = new Map([
    [getKeyInputText(inputTitle),      required],
    [getKeyInputText(inputSubtitle),   required],
    [getKeyInputText(inputName),       notRequired],
    [getKeyInputFile(inputIcon),       notRequired],
    [getKeyInputText(inputDate),       required],
    [getKeyInputFile(inputImage),      required],
    [getKeyInputFile(inputShortImage), required],
    [getKeyInputText(inputContent),    required],
  ]);

  const logo = document.querySelector('#logo');
  logo.addEventListener('click', goHome);

  const exit = document.querySelector('#logout');
  exit.addEventListener('click', logOut);

// Title
  const titlePreviews = document.getElementsByClassName('preview-title');
  required = formRequired.get(getKeyInputText(inputTitle));
  addHandlerText(inputTitle, titlePreviews, required);

// Subtitle
  const subtitlePreviews = document.getElementsByClassName('preview-subtitle');
  required = formRequired.get(getKeyInputText(inputSubtitle));
  addHandlerText(inputSubtitle, subtitlePreviews, required);
  
// Author Name
  const namePreviews = document.getElementsByClassName('author__name');
  required = formRequired.get(getKeyInputText(inputName));
  addHandlerText(inputName, namePreviews, required);
  
// Author Photo
  let limitIcon = 1 * 1024 * 1024;
  const iconPreviews = document.getElementsByClassName('icon-display');
  required = formRequired.get(getKeyInputFile(inputIcon));
  addHandlerFile(inputIcon, iconPreviews, required, limitIcon);

// Publish Date
  const datePreviews = document.getElementsByClassName('author__date');
  required = formRequired.get(getKeyInputText(inputDate));
  addHandlerText(inputDate, datePreviews, required);

// Hero Image
  let limitImage = 10 * 1024 * 1024;
  const imagePreviews = document.getElementsByClassName('image-display');
  required = formRequired.get(getKeyInputFile(inputImage));
  addHandlerFile(inputImage, imagePreviews, required, limitImage);
  
// Short Image
  let limitShortImage = 5 * 1024 * 1024;
  const shortImagePreviews = document.getElementsByClassName('short-image-display');
  required = formRequired.get(getKeyInputFile(inputShortImage));
  addHandlerFile(inputShortImage, shortImagePreviews, required, limitShortImage);
  
// Content
  const contentPreviews = document.getElementsByClassName('preview-content');
  required = formRequired.get(getKeyInputText(inputContent));
  addHandlerText(inputContent, contentPreviews, required);

  let eventFocus = new Event('focus');
  inputTitle.dispatchEvent(eventFocus);

  const buttonPublish = document.querySelector('#submit');
  buttonPublish.addEventListener('click', formSend);

  async function formSend(e) {
    const main = document.querySelector('main');
    main.classList.add('_sending');

    let errors = formValidate();
    
    if (errors) {
      showFormError();
      main.classList.remove('_sending');
    } else {
      let date = new Date(formData.get(getKeyInputText(inputDate)));
      let dateString = date.toLocaleDateString('en-US');

      //formData.set("ImageName", inputImage.file[0].name);
      //formData.set("ShortImageName", inputShortImage.file[0].name);
      let jsonData = {
        Title:          formData.get(getKeyInputText(inputTitle)),
        Subtitle:       formData.get(getKeyInputText(inputSubtitle)),
        Name:           formData.get(getKeyInputText(inputName)),
        Icon:           formData.get(getKeyInputFile(inputIcon)),
        IconName:       (inputIcon.value === "") ? "" : inputIcon.files[0].name,
        Date:           dateString,
        Image:          formData.get(getKeyInputFile(inputImage)),
        ImageName:      inputImage.files[0].name,
        ShortImage:     formData.get(getKeyInputFile(inputShortImage)),
        ShortImageName: inputShortImage.files[0].name,
        Content:        formData.get(getKeyInputText(inputContent))
      };

      console.log(jsonData);
      
      const response = await fetch('/api/post', {
        method: 'POST',
        body: JSON.stringify(jsonData)
      });

      if (response.ok) {
        showFormComplete();
        main.classList.remove('_sending');
      } else {
        showFormError();
        main.classList.remove('_sending');
      }
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
    formRequired.forEach(inputValidate);
    function inputValidate(required, key) {
      if (required) {
        if (! formData.get(key)) {
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
      let key = getKeyInputText(input);
      const reqNotice = input.parentElement.querySelector('.form__required');
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

  function addHandlerFile(input, previews, required, limit) {
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
      let key = getKeyInputFile(input);
      if (input.value === "") {
        formData.delete(key);
        if (required) {
          showInputFileEmpty(input);
        }
        hideMenu(input);
        showUpload(input);
        showLimit(input);
        hideLimitError(input);

        let imgBase64 = "";
        showFilePreviews(previews, imgBase64);
      } else {
        if (input.files[0].size > limit) {
          if (required) {
            showInputFileEmpty(input);
          }
          showLimit(input);
          showLimitError(input);
          hideUpload(input);
          showMenu(input);
        } else {
          let reader = new FileReader();
          reader.onload = (e) => {
            let imgBase64 = e.target.result;
            formData.set(key, imgBase64);
            hideUpload(input);
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
          hideLimit(input);
          hideLimitError(input);
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
    const limitNotice = input.parentElement.querySelector('.form__limit');
    limitNotice.classList.add("form__limit_error");
  }
  
  function hideLimitError(input) {
    const limitNotice = input.parentElement.querySelector('.form__limit');
    limitNotice.classList.remove("form__limit_error");
  }

  function showMenu(input) {
    const formMenu = input.parentElement.querySelector('.form__menu');
    formMenu.classList.remove("form__menu_hide");
  }
  
  function hideMenu(input) {
    const formMenu = input.parentElement.querySelector('.form__menu');
    formMenu.classList.add("form__menu_hide");
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

  function getKeyInputText(input) {
    return input.parentElement.querySelector('label').textContent;
  }

  function getKeyInputFile(input) {
    return input.parentElement.parentElement.querySelector('label').textContent;
  }
});