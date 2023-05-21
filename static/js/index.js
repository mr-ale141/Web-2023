"use strict"

window.addEventListener('load', function () {
  const buttonAdmin = document.getElementsByClassName('menu__logo');
  
  addHandlerLogIn(buttonAdmin);

  const burgerHeader = document.querySelectorAll(".menu__burger")[0];
  const burgerFooter = document.querySelectorAll(".menu__burger")[1];

  burgerHeader.addEventListener("click", (e) => {
    const blockLinkHeader = document.querySelectorAll(".menu__block-link")[0];
    if (blockLinkHeader.classList.contains("menu__block-link_show")) {
      blockLinkHeader.classList.remove("menu__block-link_show");
    } else {
      blockLinkHeader.classList.add("menu__block-link_show");
    }
  });
  
  burgerFooter.addEventListener("click", (e) => {
    const blockLinkFooter = document.querySelectorAll(".menu__block-link")[1];
    if (blockLinkFooter.classList.contains("menu__block-link_show")) {
      blockLinkFooter.classList.remove("menu__block-link_show");
    } else {
      blockLinkFooter.classList.add("menu__block-link_show");
    }
  });

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