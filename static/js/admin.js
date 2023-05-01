"use strict"

document.addEventListener('DOMContentLoaded', function () {
  const buttonPublish = document.getElementsByClassName('menu__button')[0];
  const noticeError = document.getElementsByClassName('empty-error')[0];
  const noticeComlete = document.getElementsByClassName('form-complete')[0];
  
  const inputsText = document.getElementsByClassName('form__text');
  const inputsFile = document.getElementsByClassName('form__file');
  const inputTextarea = document.getElementById('content');

  let iconBase64, imageBase64, shortImageBase64;

  addHandlerCompletedForInputText(inputsText);
  addHandlerTextPreview(inputsText);
  addHandlerImagePreview(inputsFile);
  addHendlerContent(inputTextarea);
  addHandlerRemove(inputsFile);

  buttonPublish.addEventListener('click', formSend);

  async function formSend(event) {
    document.querySelector('main').classList.add('_sending');

    let errorsText = inputTextValidate(inputsText);
    let errorsFile = inputFileValidate(inputsFile);
    let errorTextarea = inputTextareaValidate(inputTextarea);

    let errorsAll = errorsText + errorsFile + errorTextarea;
    if (errorsAll) {
      setTimeout(() => {
        document.getElementsByClassName('empty-error')[0].classList.remove('empty-error_hide');
        document.getElementsByClassName('form-complete')[0].classList.add('form-complete_hide');
        document.querySelector('main').classList.remove('_sending');
      }, 1000);
    } else {
      console.log('object');
      let date = new Date(document.getElementById('date').value);
      let dateString = date.toLocaleDateString('en-US');
      let jsonData = {
        Title: document.getElementById('title').value,
        Subtitle: document.getElementById('subtitle').value,
        Name: document.getElementById('name').value,
        Icon: iconBase64,
        Date: dateString,
        Image: imageBase64,
        ShortImage: shortImageBase64,
        Content: document.getElementById('content').value
      };
      console.log(jsonData);
      const response = await fetch(window.location.pathname, {
        method: 'POST',
        body: JSON.stringify(jsonData)
      });
      if (response.ok) {
        setTimeout(() => {
          document.getElementsByClassName('empty-error')[0].classList.add('empty-error_hide');
          document.getElementsByClassName('form-complete')[0].classList.remove('form-complete_hide');
          document.querySelector('main').classList.remove('_sending');
        }, 1000);
      } else {
        setTimeout(() => {
          document.getElementsByClassName('empty-error')[0].classList.remove('empty-error_hide');
          document.getElementsByClassName('form-complete')[0].classList.add('form-complete_hide');
          document.querySelector('main').classList.remove('_sending');
        }, 1000);

      }
    }
  }

  function inputTextValidate(inputs) {
    let errors = 0;
    for (let index = 0; index < inputs.length; index++) {
      if (inputs[index].value === "") {
        errors++;
        inputs[index].classList.add("form__text_empty");
        if (! inputs[index].nextElementSibling) {
          let lable = inputs[index].previousElementSibling.textContent
          inputs[index].insertAdjacentHTML(
            "afterend",
            `<div style="margin-top: 5px; color: #E86961">
              `+ lable +` is required.
            </div>`
          );
        }
      } else {
        inputs[index].classList.remove("form__text_empty");
        if (inputs[index].nextElementSibling) {
          inputs[index].nextElementSibling.remove();
        }
      }
    }
    return errors;
  }
  
  function inputFileValidate(inputs) {
    let errors = 0;
    for (let index = 0; index < inputs.length; index++) {
      let lable = inputs[index].querySelector('label').textContent;
      const div = document.createElement('div');
      div.setAttribute('style', 'margin: 5px 0; color: #E86961');
      div.textContent = lable + ` is required.`;
      if (inputs[index].querySelector('input').value !== "") {
        if (!inputs[index].lastElementChild.classList.value) {
          inputs[index].lastElementChild.remove();
        }
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(inputs[index].querySelector('input').files[0].type)) {
          inputs[index].getElementsByClassName('form__limit')[0].setAttribute('style', 'color: #E86961;');
          errors++;
        } else {
          if (inputs[index].getElementsByClassName('form__limit')[0]) {
            inputs[index].getElementsByClassName('form__limit')[0].setAttribute('style', 'color: #999999;');
          }
        }
        let limit = 0;
        switch (inputs[index].querySelector('input').parentElement.classList.value) {
          case "icon": limit = 5 * 1024; break;
          case "image": limit = 10 * 1024 * 1024; break;
          case "short-image": limit = 5 * 1024 * 1024; break;
        }
        if (inputs[index].querySelector('input').files[0].size > limit) {
          inputs[index].getElementsByClassName('form__limit')[0].classList.remove('form__limit_hide');
          inputs[index].getElementsByClassName('form__limit')[0].setAttribute('style', 'color: #E86961;');
          errors++;
        } else {
          if (inputs[index].getElementsByClassName('form__limit')[0]) {
            inputs[index].getElementsByClassName('form__limit')[0].classList.add('form__limit_hide');
            inputs[index].getElementsByClassName('form__limit')[0].setAttribute('style', 'color: #999999;');
          }
        }
      } else {
        errors++;
        if (inputs[index].lastElementChild.classList.value) {
          inputs[index].appendChild(div);
        }
      }
    }
    return errors;
  }

  function inputTextareaValidate(input) {
    let errors = 0;
    let lable = input.parentElement.querySelector('label').textContent;
    const div = document.createElement('div');
    div.setAttribute('style', 'margin: 5px 0; color: #E86961;');
    div.textContent = lable + ` is required.`;
    if (input.value !== "") {
      if (!input.parentElement.lastElementChild.classList.value) {
        input.parentElement.lastElementChild.remove();
      }
    } else {
      errors++;
      if (input.parentElement.lastElementChild.classList.value) {
        input.parentElement.appendChild(div);
      }
    }
    return errors;
  }

  function addHandlerTextPreview(inputs) {
    for (let index = 0; index < inputs.length; index++) {
      inputs[index].addEventListener('change', function (event) {
        switch (inputs[index].previousElementSibling.textContent) {
          case "Title":
            document.getElementsByClassName('article__title')[0].innerHTML = '';
            document.getElementsByClassName('post__title')[0].innerHTML = '';
            document.getElementsByClassName('article__title')[0].innerHTML = event.target.value;
            document.getElementsByClassName('post__title')[0].innerHTML = event.target.value;
            break;
          case "Short description":
            document.getElementsByClassName('article__subtitle')[0].innerHTML = '';
            document.getElementsByClassName('post__subtitle')[0].innerHTML = '';
            document.getElementsByClassName('article__subtitle')[0].innerHTML = event.target.value;
            document.getElementsByClassName('post__subtitle')[0].innerHTML = event.target.value;
            break;
          case "Author name":
            document.getElementsByClassName('author__name')[0].innerHTML = '';
            document.getElementsByClassName('author__name')[0].innerHTML = event.target.value;
            break;
          case "Publish Date":
            document.getElementsByClassName('author__date')[0].innerHTML = '';
            let date = new Date(event.target.value);
            let dateString = date.toLocaleDateString('en-US');
            document.getElementsByClassName('author__date')[0].innerHTML = dateString;
            break;
        }
        if (!inputs[index].parentElement.lastElementChild.classList.value) {
          if (inputs[index].value !== "") {
            inputs[index].parentElement.lastElementChild.setAttribute('style', 'margin: 5px 0; color: #999999;')
          } else {
            inputs[index].parentElement.lastElementChild.setAttribute('style', 'margin: 5px 0; color: #E86961;')
          }
        }
        inputs[index].classList.remove('form__text_empty');
      });
    }
  }

  function addHandlerImagePreview(inputs) {
    for (let index = 0; index < inputs.length; index++) {
      inputs[index].querySelector('input').addEventListener('change', function (event) {
        let reader = new FileReader();
        reader.onload = function (event) {
          let img = document.createElement('img');
          img.setAttribute('style', 'width: 100%; height: 100%;');
          let imgBase64 = event.target.result;
          img.setAttribute('src', imgBase64);

          inputs[index].querySelector('input').previousElementSibling.innerHTML = '';
          inputs[index].querySelector('input').previousElementSibling.appendChild(img);

          img = document.createElement('img');
          img.setAttribute('style', 'width: 100%; height: 100%;');
          img.setAttribute('src', imgBase64);

          switch (inputs[index].querySelector('input').parentElement.classList.value) {
            case "icon":
              iconBase64 = imgBase64, 
              document.getElementsByClassName('icon__span')[0].classList.add('icon__span_hide');
              document.getElementsByClassName('author__icon')[0].innerHTML = '';
              document.getElementsByClassName('author__icon')[0].appendChild(img);
              break;
            case "image":
              imageBase64 = imgBase64,
              document.getElementsByClassName('article__image')[0].innerHTML = '';
              document.getElementsByClassName('article__image')[0].appendChild(img);
              break;
            case "short-image":
              shortImageBase64 = imgBase64;
              document.getElementsByClassName('post__image')[0].innerHTML = '';
              document.getElementsByClassName('post__image')[0].appendChild(img);
              break;
          }
          inputs[index].getElementsByClassName('form__menu')[0].classList.remove('form__menu_hide');
          inputs[index].getElementsByClassName('form__limit')[0].classList.add('form__limit_hide');
          if (!inputs[index].lastElementChild.classList.value) {
            inputs[index].lastElementChild.setAttribute('style', 'margin: 5px 0; color: #999999;')
          }
        }
        reader.onerror = function (event) {
          console.log("Error in event: " + event);
          alert("File reading error!");
        }
        reader.readAsDataURL(inputs[index].querySelector('input').files[0]);
      });
    }
  }

  function addHandlerRemove(inputs) {
    for (let index = 0; index < inputs.length; index++) {
      inputs[index].getElementsByClassName('form__remove')[0].addEventListener('click', function (event) {
        inputs[index].querySelector('input').value = "";
        inputs[index].querySelector('input').previousElementSibling.innerHTML = '';
        switch (inputs[index].querySelector('input').parentElement.classList.value) {
          case "icon":
            iconBase64 = "";
            document.getElementsByClassName('icon__span')[0].classList.remove('icon__span_hide');
            document.getElementsByClassName('author__icon')[0].innerHTML = '';
            break;
          case "image":
            imageBase64 = "";
            inputs[index].querySelector('input').previousElementSibling.textContent = 'Upload';
            document.getElementsByClassName('article__image')[0].innerHTML = '';
            break;
          case "short-image":
            shortImageBase64 = "";
            inputs[index].querySelector('input').previousElementSibling.textContent = 'Upload';
            document.getElementsByClassName('post__image')[0].innerHTML = '';
            break;
        }
        inputs[index].getElementsByClassName('form__menu')[0].classList.add('form__menu_hide');
        inputs[index].getElementsByClassName('form__limit')[0].classList.remove('form__limit_hide');
        inputs[index].getElementsByClassName('form__limit')[0].setAttribute('style', 'color: #999999;');
      });
    }
  }

  function addHendlerContent(input) {
    input.addEventListener('change', function (event) {
      if (!input.parentElement.lastElementChild.classList.value) {
        if (input.value !== "") {
          input.parentElement.lastElementChild.setAttribute('style', 'margin: 5px 0; color: #999999;')
        } else {
          input.parentElement.lastElementChild.setAttribute('style', 'margin: 5px 0; color: #E86961;')
        }
      }
    });
  }

  function addHandlerCompletedForInputText(inputs) {
    for (let index = 0; index < inputs.length; index++) {
      inputs[index].addEventListener("focus", function (event) {
        inputs[index].classList.add("form__text_completed");
      });
  
      inputs[index].addEventListener("blur", function (event) {
        if (inputs[index].value === "") {
          inputs[index].classList.remove("form__text_completed");
        }
      });
    }
  }
});