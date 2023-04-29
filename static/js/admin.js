//pattern = "[0-9]{2}\.[0-9]{2}\.[0-9]{4}"

const inputDate = document.getElementById('date');

console.log(inputDate);

const options = {
  weekday: 'numeric',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
};

let now = new Date();
console.log(now.toLocaleDateString('en-US'));

nowString = new Intl.DateTimeFormat('en-US').format(now);

console.log(nowString);

inputDate.valueAsDate = now;


console.log(inputDate.valueAsDate);

