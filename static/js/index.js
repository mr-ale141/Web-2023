"use strict"

window.addEventListener('load', function () {
  const buttonAdmin = document.getElementsByClassName('menu__logo');
  
  addHandlerLogIn(buttonAdmin);

  function addHandlerLogIn(inputs) {
    for (let index = 0; index < inputs.length; index++) {
      inputs[index].addEventListener("click", async function (event) {
        const response = await fetch('/admin', {
          method: 'GET'
        })
        if (response.status === 401) {
          window.location.href = '/login';
        } else {
          window.location.href = '/admin';
        }
      });
    }
  }
});